import {
    Form, Stack, FloatingLabel,
    Button, Card, ButtonGroup
} from 'react-bootstrap';
import { generateKey } from 'openpgp';
import React, { useState, useRef, useEffect } from 'react';
import JSZip, { file } from 'jszip';
import crypto from 'crypto';
import {saveAs} from 'file-saver';

const Signthings = (props) => {
    const refPassphrase = useRef();
    const refGenBtn = useRef();
    const refSigningMsg = useRef();
    const refName = useRef();
    const refEmail = useRef();

    const [valSignPub, setValSignPub] = useState('');
    const [valSignPriv, setValSignPriv] = useState('');
    const [signPriv, setSignPriv] = useState(null);
    const [tag, setTag] = useState('');
    const [signingMsg, setSigningMsg] = useState('');
    const [signingName, setSigningName] = useState('');
    const [signingEmail, setSigningEmail] = useState('');
    const [signingPass, setSigningPass] = useState('');

    const [isDisabledGenSign, setIsDisabledGenSign] = useState(true);
    const [isDisabledDL, setIsDisabledDL] = useState(true);
    const [isDisabledSI, setIsDisabledSI] = useState(true);

    useEffect(() => {
        setTag(crypto.randomBytes(4).toString('hex'));

        if(signingMsg == "") setIsDisabledSI(true);
        else setIsDisabledSI(false);
    }, [signingMsg]);

    const generateSigning = () => {
        /**
         * TODO : add name and email field
         */
        console.log("pass phrase :: " + refPassphrase.current.value);
        console.log("name: " + signingName);
        console.log("email: " + signingEmail);

        generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{name: signingName, email: signingEmail}],
            passphrase: refPassphrase.current.value,
            format: 'armored'
        }).then((res) => {
            setValSignPriv(res.privateKey);
            setValSignPub(res.publicKey);

            // enable download buton
            setIsDisabledDL(false);
        });
    };

    const changePassphrase = (e) => {
        
    };

    const cleanUp = () => {
        setIsDisabledDL(true);
        setIsDisabledGenSign(true);
        setValSignPriv('');
        setValSignPub('');
        setSigningEmail('');
        setSigningName('');
        setTag(crypto.randomBytes(4).toString('hex'));
        refPassphrase.current.value = '';
        refName.current.value = '';
        refEmail.current.value = '';
    };

    const downloadSigning = (e) => {
        let zip = new JSZip();
        
        zip.file("handshake-" + tag + ".priv", valSignPriv);
        zip.file("handshake-" + tag + ".pub", valSignPub);

        if(JSZip.support.uint8array) {
            zip.generateAsync({type: 'blob'}).then((blob) => {
                saveAs(blob, "handshake-" + tag + ".zip");

                // cleanup
                cleanUp();
            });
        }
    };

    const handleKeyUpload = (e) => {
        e.target.files.item(0).arrayBuffer().then((bin) => {
            // bin arraybuffer
            JSZip.loadAsync(bin).then((u) => {
                // we don't want to provide a private key back to public space
                u.folder('').file(/.*\.priv$/)[0].async('string').then((block) => setValSignPriv(block));

                u.folder('').file(/.*\.pub$/)[0].async('string').then((block) => {
                    setValSignPub(block);
                });
            });
        });
    };

    const changeSigningMsg = (e) => {
        setSigningMsg(e.target.value.trim());
    };

    const clickSignIt = (e) => {
        console.log(valSignPub);
    };

    const changeName = (e) => {
        setSigningName(e.target.value.trim());
    };

    const changeEmail = (e) => {
        setSigningEmail(e.target.value.trim());
    };

    return (
        <Stack direction='horizontal' gap={5}>
            <Card>
                <Card.Title>signing things</Card.Title>
                <Stack direction='vertical' gap={5}>
                    <Form>
                        <Form.Group controlId='signing.username'>
                            <FloatingLabel label='name'>
                                <Form.Control onChange={changeName} ref={refName} />
                            </FloatingLabel>
                            <Form.Text>enter your name or a username</Form.Text>
                        </Form.Group>
                        <Form.Group controlId='signing.email'>
                            <FloatingLabel label='email address'>
                                <Form.Control onChange={changeEmail} ref={refEmail} />
                            </FloatingLabel>
                            <Form.Text>enter an email.</Form.Text>
                        </Form.Group>
                        <Form.Group controlId='signing.passPhrase'>
                            <FloatingLabel label='passphares/salt'>
                                <Form.Control onChange={changePassphrase} ref={refPassphrase} />
                            </FloatingLabel>
                            <Form.Text>enter a password or just some random text</Form.Text>
                        </Form.Group>
                        <Form.Group controlId='signing.privateKey'>
                            <FloatingLabel label='private key'>
                                <Form.Control value={valSignPriv} disabled readOnly as='textarea' style={{ minHeight: '200px' }} />
                            </FloatingLabel>
                            <Form.Text muted>do not share this ever! ssshh it's a secret. hide it away in your happy place.</Form.Text>
                        </Form.Group>
                        <Form.Group controlId='signing.publicKey'>
                            <FloatingLabel label='public key'>
                                <Form.Control value={valSignPub} disabled readOnly as='textarea' style={{ minHeight: '200px' }} />
                            </FloatingLabel>
                            <Form.Text muted>this is ok to share with anyone. you can always make more</Form.Text>
                        </Form.Group>
                    </Form>
                    <ButtonGroup>
                        <Button ref={refGenBtn} disabled={isDisabledGenSign} onClick={generateSigning} variant='primary'>generate</Button>
                        <Button variant='secondary' disabled={isDisabledDL} onClick={downloadSigning}>download</Button>
                        <Button variant='danger' onClick={cleanUp}>reset</Button>
                    </ButtonGroup>
                    <div>tag: {tag}</div>
                </Stack>
            </Card>
            <Card>
                <Card.Title>sign something!</Card.Title>
                <Stack direction='vertical' gap={5}>
                    <Form>
                        <Form.Group controlId='signing.message'>
                            <FloatingLabel label='message to sign'>
                                <Form.Control ref={refSigningMsg} onChange={changeSigningMsg} as='textarea' style={{minHeight: '150px'}} />
                            </FloatingLabel>
                        </Form.Group>
                    </Form>
                    <input type="file" ref={el => (refGimmeUrKey = el)} onChange={handleKeyUpload} style={{display: 'none'}} />
                    <ButtonGroup>
                        <Button onClick={(e) => {refGimmeUrKey.click()}}>gimme your key!</Button>
                        <Button onClick={clickSignIt} disabled={isDisabledSI}>sign it!</Button>
                    </ButtonGroup>
                    
                </Stack>
            </Card>
        </Stack>
    );
};

export default Signthings;