import Joi from "joi";
import JSZip from "jszip";
import { generateKey } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import {
    Stack, Button, ButtonGroup, 
    Form,
    Alert,
    Spinner
} from 'react-bootstrap';
import {randomBytes} from 'crypto';

const EGenerate = () => {
    const refKeyName = useRef();
    const refKeyEmail = useRef();
    const refKeyPasswd = useRef();
    const refBtnGenerate = useRef();

    const [displayLoading, setDisplayLoading] = useState(false);

    const [keyData, setKeyData] = useState({});
    
    const [disabledGenerate, setDisabledGenerate] = useState(true);

    const keySchema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({tlds: {allow: false}}).required(),
        thepasswd: Joi.string().min(8).max(30).required()
    });

    const changeKeyName = (e) => {
        setKeyData({...keyData, username: e.target.value.trim()});
    };

    const changeKeyEmail = (e) => {
        setKeyData({...keyData, email: e.target.value.trim()});
    };

    const changeKeyPasswd = (e) => {
        setKeyData({...keyData, thepasswd: e.target.value.trim()});
    };

    const cleanUp = () => {
        refKeyEmail.current.value = '';
        refKeyName.current.value = '';
        refKeyPasswd.current.value = '';

        setDisplayLoading(false);
        
        setKeyData({
            email: '',
            thepasswd: '',
            username: ''
        });
    };

    const clickGenerate = (e) => {
        e.preventDefault();

        /**
         * disable the genreate button, until key has 
         * completed generating
         */
        // e.target.disabled = true;
        refBtnGenerate.current.disabled = true;
        setDisplayLoading(true);

        let userIDs = {'name': keyData.username, 'email': keyData.email};
        generateKey({
            userIDs: userIDs,
            type: 'rsa',
            passphrase: keyData.thepasswd,
            format: 'armored'
        }).then((keyPair) => {
            const theTag = randomBytes(4).toString('hex');

            const zip = new JSZip();
            zip.file("handshake-enc-" + theTag + ".pem", keyPair.privateKey);

            if(JSZip.support.uint8array) {
                zip.generateAsync({type: 'blob'}).then((blob) => {
                    saveAs(blob, "handshake-enc-" + theTag + ".zip");
                });
            }
            
            cleanUp();
        }).catch((e) => console.error(e));
    };

    useEffect(() => {
        let validateKey = keySchema.validate(keyData);
        setDisabledGenerate(validateKey.error);
    }, [keyData]);

    return (
        <>
            <Stack gap={3}>
                <Alert variant="info" show={displayLoading}>
                    <Spinner animation="border" size="sm" />
                    <Alert.Heading>generating...</Alert.Heading>
                </Alert>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Form.Group>
                        <Form.Label>name</Form.Label>
                        <Form.Control type="text" onChange={changeKeyName} ref={refKeyName} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>email</Form.Label>
                        <Form.Control type="email" onChange={changeKeyEmail} ref={refKeyEmail} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>password</Form.Label>
                        <Form.Control type="password" onChange={changeKeyPasswd} ref={refKeyPasswd} />
                    </Form.Group>
                </Form>
                <ButtonGroup>
                    <Button type="button" ref={refBtnGenerate} onClick={clickGenerate} disabled={disabledGenerate}>generate</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default EGenerate;