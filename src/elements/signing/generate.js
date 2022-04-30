import React, { useEffect, useState, useRef } from "react";
import { ButtonGroup, Button, Form, Stack } from "react-bootstrap";
import Joi from 'joi';
import {generateKey} from 'openpgp';
import JSZip from 'jszip';
import {randomBytes} from 'crypto';
import {saveAs} from 'file-saver'

const Generate = (props) => {
    const refTheName = useRef();
    const refTheEmail = useRef();
    const refThePasswd = useRef();

    const [clickGenerateDisabled, setClickGenerateDisabled] = useState(true);

    const [signingData, setSigningData] = useState({
        thename: '',
        theemail: '',
        thepasswd: ''
    });

    const signingSchema = Joi.object({
        thename: Joi.string().min(3).max(30).required(),
        theemail: Joi.string().email({tlds: {allowllow: false}}).required(),
        thepasswd: Joi.string().min(8).max(30).required()
    });

    const cleanUp = () => {
        setSigningData({ theemail: "", thename: "", thepasswd: "" });
        refTheEmail.current.value = "";
        refTheName.current.value = "";
        refThePasswd.current.value = "";
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

    useEffect(() => {
        let val1 = signingSchema.validate(signingData);
        setClickGenerateDisabled(val1.error);
    }, [signingData]);

    return (
        <>
            <Stack gap={3}>
                <Form>
                    <Form.Group controlId='thename'>
                        <Form.Label>name</Form.Label>
                        <Form.Control ref={refTheName} onChange={(e) => setSigningData({ ...signingData, thename: e.target.value.trim() })} />
                        <Form.Text>use your name or any nickname</Form.Text>
                    </Form.Group>
                    <Form.Group controlId='theemail'>
                        <Form.Label>email</Form.Label>
                        <Form.Control ref={refTheEmail} type='email' onChange={(e) => setSigningData({ ...signingData, theemail: e.target.value.trim() })} />
                    </Form.Group>
                    <Form.Group controlId='thepasswd'>
                        <Form.Label>password</Form.Label>
                        <Form.Control ref={refThePasswd} type='password' onChange={(e) => setSigningData({ ...signingData, thepasswd: e.target.value.trim() })} />
                        <Form.Text>must be at least 8 characters, less than 31</Form.Text>
                    </Form.Group>
                </Form>
                <ButtonGroup>
                    <Button type='button' disabled={clickGenerateDisabled} variant='primary' onClick={clickGenerate}>generate</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Generate;