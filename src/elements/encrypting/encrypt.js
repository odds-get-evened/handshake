import Joi from "joi";
import JSZip from "jszip";
import { readCleartextMessage } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import { 
    ButtonGroup, Stack, Button,
    Form,
    FloatingLabel
} from 'react-bootstrap';

const Encrypt = () => {
    const refUploadKey = useRef();
    const refUploadMsg = useRef();
    const refOrigMsg = useRef();

    const [disableUploadKey, setDisableUploadKey] = useState(true);
    const [disableEncryptIt, setDisableEncryptIt] = useState(true);

    const [encData, setEncData] = useState({
        originalMessage: '',
        signature: '',
        publicSigningKey: '',
        publicEncKey: ''
    });

    const encSchema = Joi.object({
        originalMessage: Joi.string().required(),
        signature: Joi.string().required(),
        publicSigningKey: Joi.string().required(),
        publicEncKey: Joi.string().required()
    });

    const clickEncryptIt = (e) => {

    };

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.sig$/)[0].async('string').then(sig => {
                    u.folder('').file(/.*\.p7$/)[0].async('string').then(pubk => {
                        readCleartextMessage({cleartextMessage: sig}).then(ctm => {
                            setEncData({
                                ...encData,
                                originalMessage: ctm.getText(),
                                signature: sig,
                                publicSigningKey: pubk
                            });
                            setDisableUploadKey(false);
                        }).catch(err5 => console.log(err5));
                    }).catch(err4 => console.error(err4));
                }).catch(err3 => console.error(err3));
            }).catch(err2 => console.log(err2));
        }).catch(err1 => console.error(err1));
    };

    const changeUploadKey = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                console.log(u.folder(''));
                u.folder('').file(/.*\.pub$/)[0].async('string').then(pub => {
                    setEncData({
                        ...encData,
                        publicEncKey: pub
                    });
                }).catch(err3 => console.log(err3));
            }).catch(err2 => console.error(err2));
        }).catch(err1 => console.error(err1));
    };

    useEffect(() => {
        console.log(encData);
    }, [encData]);

    return (
        <>
            <Stack gap={3}>
                <Form>
                    <Form.Group>
                        <FloatingLabel label='original message'>
                            <Form.Control as='textarea' value={encData.originalMessage} ref={refOrigMsg} disabled={true} style={{minHeight: '100px'}} />
                        </FloatingLabel>
                    </Form.Group>
                </Form>
                <input type='file' ref={refUploadMsg} multiple={false} onChange={changeUploadMsg} style={{display: 'none'}} />
                <input type='file' ref={refUploadKey} multiple={false} onChange={changeUploadKey} style={{display: 'none'}} />
                <ButtonGroup>
                    <Button onClick={e => {refUploadMsg.current.click();}}>add signed message</Button>
                    <Button disabled={disableUploadKey} onClick={e => {refUploadKey.current.click();}}>add encrpytion key</Button>
                    <Button disabled={disableEncryptIt} onClick={clickEncryptIt}>encrypt!</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Encrypt;