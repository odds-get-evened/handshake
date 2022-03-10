import React, { useEffect, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Card, Form, Stack
} from 'react-bootstrap';
import crypto from 'crypto';

const SignThings = (props) => {
    const [signingKey, setSigningKey] = useState({
        priv: null,
        pub: null
    });

    const [signingText, setSigningText] = useState({
        priv: "",
        pub: ""
    });

    const BEGIN_PRIV_KEY = "-----BEGIN ENCRYPTED PRIVATE KEY-----\n";
    const END_PRIV_KEY = "\n-----END ENCRYPTED PRIVATE KEY-----";

    useEffect(() => {
        regenerateKeys();
        return;
    }, []);

    const regenerateKeys = () => {
        window.crypto.subtle.generateKey({
            name: 'ECDSA',
            namedCurve: 'P-384'
        }, true, ['sign', 'verify']).then((keys) => {
            window.crypto.subtle.exportKey('pkcs8', keys.privateKey).then((pem) => {
                setSigningKey({...signingKey, priv: pem});

                let exportStr = String.fromCharCode.apply(null, new Uint8Array(pem));
                let exportB64 = window.btoa(exportStr);
                setSigningText({
                    ...signingText,
                    priv: `${BEGIN_PRIV_KEY}${exportB64}${END_PRIV_KEY}`
                });
            });
        });
    };

    const clickRegenerateKeys = (e) => {
        regenerateKeys();
    };

    const clickDownloadKey = (e) => {
        let hashy = crypto.createHash('sha1');
        crypto.randomBytes(4, (error, buffer) => {
            let hash1 = hashy.update(buffer, 'utf8');
            let sha1ID = hash1.digest().slice(0, 4).toString('hex');

            // initiate download in browser client
            download('handshake-signing-'+sha1ID+".pem", signingText.priv);
            // regen keys. we don't need this one anymore
            regenerateKeys();
        });
    };

    const download = (filename, text) => {
        let e = document.createElement('a');
        e.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
        e.setAttribute('download', filename);
        e.style.display = 'none';
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    };

    return (
        <Stack direction='vertical' gap={5}>
            <Card style={{padding: '20px'}}>
                <Card.Title>signing things.</Card.Title>
                <Stack direction='vertical' gap={5}>
                    <Form>
                        <Form.Group controlId='signinForm.privateKeyInput'>
                            <Form.Label>private key (PEM)</Form.Label>
                            <Form.Control disabled as='textarea' value={signingText.priv} style={{minHeight: '200px'}} />
                            <Form.Text muted>
                                this is a secret. download it to a file DO NOT lose it.
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Stack>
                <ButtonGroup aria-label="buttons and stuff">
                    <Button onClick={clickRegenerateKeys} variant='secondary'>regenerate!</Button>
                    <Button onClick={clickDownloadKey} variant='primary'>download</Button>
                </ButtonGroup>
            </Card>
        </Stack>
    );
};

export default SignThings;