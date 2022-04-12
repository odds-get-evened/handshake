import React, {useState, useEffect, useRef} from 'react';
import { 
    ButtonGroup, Form, Tabs, Tab, 
    Row, Col, Button, Stack, Nav,
    FloatingLabel
} from 'react-bootstrap';
import Joi from 'joi';
import { 
    createMessage, decryptKey, generateKey, 
    PrivateKey, PublicKey, readPrivateKey, sign
} from 'openpgp';
import JSZip from 'jszip';
import {randomBytes} from 'crypto';
import {saveAs} from 'file-saver'

const Signing = () => {
    const refTheName = useRef();
    const refTheEmail = useRef();
    const refThePasswd = useRef();
    const refSignMsg = useRef();
    const refSignMsgPasswd = useRef();
    const refGimmeUrKey = useRef();

    const [clickGenerateDisabled, setClickGenerateDisabled] = useState(true);
    const [clickSignDisabled, setClickSignDisabled] = useState(true);

    const [signingData, setSigningData] = useState({
        thename: '',
        theemail: '',
        thepasswd: ''
    });

    const [signMsgData, setSignMsgData] = useState({
        privateKey: '',
        message: '',
        thepasswd: '',
        publicKey: ''
    });

    const signingSchema = Joi.object({
        thename: Joi.string().min(3).max(30).required(),
        theemail: Joi.string().email({tlds: {allowllow: false}}).required(),
        thepasswd: Joi.string().min(8).max(30).required()
    });

    const signMsgSchema = Joi.object({
        privateKey: Joi.object().instance(PrivateKey),
        publicKey: Joi.object().instance(PublicKey),
        message: Joi.string().min(3).max(1024).required(),
        thepasswd: Joi.string().min(8).max(30).required()
    });

    useEffect(() => {
        let val1 = signingSchema.validate(signingData);
        setClickGenerateDisabled(val1.error);
        let val2 = signMsgSchema.validate(signMsgData);
        setClickSignDisabled(val2.error);
    }, [signingData, signMsgData]);

    const cleanUp = () => {
        setSigningData({ theemail: "", thename: "", thepasswd: "" });
        setSignMsgData({privateKey: undefined, message: "", thepasswd: ""});
        refTheEmail.current.value = "";
        refTheName.current.value = "";
        refThePasswd.current.value = "";
        refSignMsgPasswd.current.value = "";
        refSignMsg.current.value = "";
    };

    const clickGenerate = (e) => {
        e.preventDefault();
        generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [
                { 
                    name: signingData.thename.trim(), 
                    email: signingData.theemail.trim() 
                }
            ],
            passphrase: signingData.thepasswd.trim(),
            format: 'armored'
        }).then((kee) => {            
            cleanUp();

            let zip = new JSZip();
            let thetag = randomBytes(4).toString('hex');
            zip.file("handshake-sign-" + thetag + ".priv", kee.privateKey);
            zip.file("handshake-sign-" + thetag + ".pub", kee.publicKey);

            if(JSZip.support.uint8array) {
                zip.generateAsync({type: 'blob'}).then((blob) => {
                    saveAs(blob, "handshake-sign-" + thetag + ".zip");
                });
            }
        });
    };

    const changeGimmeUrKey = (e) => {
        // handles key upload
        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then((u) => {
                // we only need private key for signing
                u.folder('').file(/.*\.priv$/)[0].async('string').then((block) => {
                    readPrivateKey({armoredKey: block}).then((pk) => {
                        decryptKey({
                            privateKey: pk,
                            passphrase: signMsgData.thepasswd
                        }).then((p) => {
                            setSignMsgData({...signMsgData, privateKey: p, publicKey: p.toPublic()});
                        });
                    });
                });
            });
        });
    };

    const downloadSignature = (msg, sig) => {
        let tag = randomBytes(4).toString('hex');
        let zip = new JSZip();
        zip.file("message-" + tag + ".txt", msg);
        zip.file("signature-" + tag + ".sig", sig);

        if(JSZip.support.uint8array) {
            zip.generateAsync({type: 'blob'}).then((blob) => {
                saveAs(blob, "handshake-signed-" + tag + ".zip");
            });
        }
    };

    const clickSignIt = (e) => {
        createMessage({text: signMsgData.message.trim()}).then((msg) => {
            sign({
                signingKeys: signMsgData.privateKey,
                message: msg,
                format: 'armored'
            }).then((sigmsg) => {
                downloadSignature(msg.getText(), sigmsg);
                cleanUp();
            });
        });
    };

    const changeMessage = (e) => {
        setSignMsgData({...signMsgData, message: e.target.value});
    };

    return (
        <Tabs defaultActiveKey="signing" transition={false} className="mb-3">
            <Tab eventKey="signing" title="Signing">
                <Row>
                    <Col>
                        <Tab.Container defaultActiveKey="generate">
                            <Row>
                                <Col sm={3}>
                                    <Nav variant='pills' className='flex-column'>
                                        <Nav.Item>
                                            <Nav.Link eventKey="generate">generate</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="sign">sign</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={9}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="generate">
                                            <Stack gap={3}>
                                                <Form>
                                                    <Form.Group controlId='thename'>
                                                        <Form.Label>name</Form.Label>
                                                        <Form.Control ref={refTheName} onChange={(e) => setSigningData({ ...signingData, thename: e.target.value.trim() })} />
                                                        <Form.Text>use your name or nickname</Form.Text>
                                                    </Form.Group>
                                                    <Form.Group controlId='theemail'>
                                                        <Form.Label>email</Form.Label>
                                                        <Form.Control ref={refTheEmail} type='email' onChange={(e) => setSigningData({ ...signingData, theemail: e.target.value.trim() })} />
                                                    </Form.Group>
                                                    <Form.Group controlId='thepasswd'>
                                                        <Form.Label>password</Form.Label>
                                                        <Form.Control ref={refThePasswd} type='password' onChange={(e) => setSigningData({ ...signingData, thepasswd: e.target.value.trim() })} />
                                                    </Form.Group>
                                                </Form>
                                                <ButtonGroup>
                                                    <Button type='button' disabled={clickGenerateDisabled} variant='primary' onClick={clickGenerate}>generate</Button>
                                                </ButtonGroup>
                                            </Stack>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="sign">
                                            <Stack gap={3}>
                                                <Form>
                                                    <Form.Group controlId='signing.message'>
                                                        <FloatingLabel label='message to sign'>
                                                            <Form.Control ref={refSignMsg} onChange={changeMessage} as='textarea' style={{ minHeight: '150px' }} />
                                                        </FloatingLabel>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>password</Form.Label>
                                                        <Form.Control ref={refSignMsgPasswd} type='password' onChange={(e) => setSignMsgData({...signMsgData, thepasswd: e.target.value.trim()})} />
                                                    </Form.Group>
                                                </Form>
                                                <input type="file" ref={refGimmeUrKey} multiple={false} onChange={changeGimmeUrKey} style={{ display: 'none' }} />
                                                <ButtonGroup>
                                                    <Button onClick={() => { refGimmeUrKey.current.click() }}>gimme your key!</Button>
                                                    <Button onClick={clickSignIt} disabled={clickSignDisabled}>sign it!</Button>
                                                </ButtonGroup>
                                            </Stack>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </Col>
                </Row>
            </Tab>
            <Tab eventKey="encryption" title="Encryption">

            </Tab>
        </Tabs>
    );
};

export default Signing;