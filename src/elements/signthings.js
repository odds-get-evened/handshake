import 'regenerator-runtime';
import {
    Form, Stack,
    Button, Card, ButtonGroup
} from 'react-bootstrap';
import { generateKey } from 'openpgp';
import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import crypto from 'crypto';
import {saveAs} from 'file-saver';

const Signthings = (props) => {
    const refPassphrase = useRef();
    const refGenBtn = useRef();
    const [valSignPub, setValSignPub] = useState('');
    const [valSignPriv, setValSignPriv] = useState('');
    const [isDisabledGenSign, setIsDisabledGenSign] = useState(true);
    const [isDisabledDL, setIsDisabledDL] = useState(true);
    const [tag, setTag] = useState('');

    useEffect(() => {
        setTag(crypto.randomBytes(4).toString('hex'));
    }, [null]);

    const generateSigning = () => {
        console.log("DEBUG :: " + refPassphrase.current.value);
        generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{name: 'Chris Walsh', email: 'chris.is.rad@pm.me'}],
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
        let v = e.target.value.trim(); 
        
        setIsDisabledGenSign(!(v.length > 1));
    };

    const cleanUp = () => {
        setValSignPriv('');
        setValSignPub('');
        setTag(crypto.randomBytes(4).toString('hex'));
        refPassphrase.current.value = '';
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

    return (
        <Card>
            <Card.Title>signing things</Card.Title>
            <Stack direction='vertical' gap={5}>
                <Form>
                    <Form.Group controlId='signing.passPhrase'>
                        <Form.Label>passphrase/salt</Form.Label>
                        <Form.Control onChange={changePassphrase} ref={refPassphrase} />
                        <Form.Text>enter a password or just some random text</Form.Text>
                    </Form.Group>
                    <Form.Group controlId='signing.privateKey'>
                        <Form.Label>private key</Form.Label>
                        <Form.Control value={valSignPriv} disabled readOnly as='textarea' style={{ minHeight: '200px' }} />
                    </Form.Group>
                    <Stack direction='horizontal' gap={5}>
                        <Button variant='secondary'>copy</Button>
                    </Stack>
                    <Form.Group controlId='signing.publicKey'>
                        <Form.Label>public key</Form.Label>
                        <Form.Control value={valSignPub} disabled readOnly as='textarea' style={{ minHeight: '200px' }} />
                    </Form.Group>
                    <Stack direction='horizontal' gap={5}>
                        <Button variant='secondary'>copy</Button>
                    </Stack>
                </Form>
                <ButtonGroup>
                    <Button ref={refGenBtn} disabled={isDisabledGenSign} onClick={generateSigning} variant='primary'>generate</Button>
                    <Button variant='secondary' disabled={isDisabledDL} onClick={downloadSigning}>download</Button>
                    <Button variant='danger' onClick={cleanUp}>reset</Button>
                </ButtonGroup>
                <div>tag: {tag}</div>
            </Stack>
        </Card>
    );
};

export default Signthings;