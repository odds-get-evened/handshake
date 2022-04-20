import React, {useState, useEffect, useRef} from 'react';
import {
    Stack, Form, FloatingLabel,
    ButtonGroup, Button, Card
} from 'react-bootstrap';
import Joi from 'joi';
import {
    createMessage, decryptKey,
    PrivateKey, PublicKey, readKey, readPrivateKey, sign
} from 'openpgp';
import JSZip from 'jszip';
import {randomBytes} from 'crypto';
import {saveAs} from 'file-saver';

const Sign = () => {
    const refSignMsg = useRef();
    const refSignMsgPasswd = useRef();
    const refGimmeUrKey = useRef();
    
    const [clickSignDisabled, setClickSignDisabled] = useState(true);
    const [clickUrKeyDisabled, setClickUrKeyDisabled] = useState(true);

    const [signMsgData, setSignMsgData] = useState({
        privateKey: '',
        message: '',
        thepasswd: '',
        publicKey: ''
    });

    const signMsgSchema = Joi.object({
        privateKey: Joi.object().instance(PrivateKey),
        publicKey: Joi.object().instance(PublicKey),
        message: Joi.string().min(3).max(1024).required(),
        thepasswd: Joi.string().min(8).max(30).required()
    });

    const cleanUp = () => {
        setSignMsgData({privateKey: undefined, message: "", thepasswd: ""});
        refSignMsgPasswd.current.value = "";
        refSignMsg.current.value = "";
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
                        }).catch((err) => console.log(err));
                    });
                });
            });
        });
    };

    const downloadSignature = (msg, sig, pubkey) => {
        let tag = randomBytes(4).toString('hex');
        let zip = new JSZip();
        zip.file("message-" + tag + ".txt", msg);
        zip.file("signature-" + tag + ".sig", sig);
        zip.file("public-" + tag + ".key", pubkey.armor());

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
                downloadSignature(msg.getText(), sigmsg, signMsgData.publicKey);
                cleanUp();
            });
        });
    };

    const changeMessage = (e) => {
        setSignMsgData({...signMsgData, message: e.target.value});
    };

    const changeUrSignedMsg = (e) => {
        // upload signed message packet
        
    };

    useEffect(() => {
        let val = signMsgSchema.validate(signMsgData);
        setClickSignDisabled(val.error);
        setClickUrKeyDisabled((signMsgData.message == "" || signMsgData.thepasswd == ""));
    }, [signMsgData]);

    return (
        <Stack gap={3}>
            <Form>
                <Form.Group controlId='signing.message'>
                    <FloatingLabel label='message to sign'>
                        <Form.Control ref={refSignMsg} onChange={changeMessage} as='textarea' style={{ minHeight: '150px' }} />
                    </FloatingLabel>
                </Form.Group>
                <Form.Group>
                    <Form.Label>password</Form.Label>
                    <Form.Control ref={refSignMsgPasswd} type='password' onChange={(e) => setSignMsgData({ ...signMsgData, thepasswd: e.target.value.trim() })} />
                    <Form.Text>the password you provided at key generation. forgot? make another one!</Form.Text>
                </Form.Group>
            </Form>
            <input type="file" ref={refGimmeUrKey} multiple={false} onChange={changeGimmeUrKey} style={{ display: 'none' }} />
            <ButtonGroup>
                <Button disabled={clickUrKeyDisabled} onClick={(e) => { refGimmeUrKey.current.click(); }}>get key packet...</Button>
                <Button onClick={clickSignIt} disabled={clickSignDisabled}>sign it!</Button>
            </ButtonGroup>
            <Card>
                <Card.Body>
                    <Card.Title>what's a `handoff key packet`?</Card.Title>
                    in order for you to sign something, you need to provide a "handoff key packet". this can be generated in the previous tab, <em>generate</em>.
                    it will have a file name like <code>handshake-sign-cd398e72.zip</code>
                </Card.Body>
                <Card.Body>
                    <Card.Title>what do i get when i `sign it`?</Card.Title>
                    yes, you will get another packet, this time it's a signature packet containing
                    the original message, and the message's signature. it will look like this 
                    <code>handshake-signed-808f158f.zip</code>. this will be used for verification,
                    and even encryption.
                </Card.Body>
            </Card>
        </Stack>
    );
};

export default Sign;