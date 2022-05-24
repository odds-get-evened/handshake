import Joi from 'joi';
import JSZip from 'jszip';
import { CleartextMessage, createCleartextMessage, createMessage, Message, readCleartextMessage, readKey, readMessage, readSignature, verify } from 'openpgp';
import React, {useState, useRef, useEffect} from 'react';
import { 
    ButtonGroup, FloatingLabel, Form, 
    Stack, Button 
} from 'react-bootstrap';

const Verify = () => {
    const refUpload = useRef();
    const refOrigMsg = useRef();

    const [dataVerify, setDataVerify] = useState({});
    const [disabledVerify, setDisabledVerify] = useState(true);
    const [verifyStatus, setVerifyStatus] = useState(false);
    const [classVerifyStatus, setClassVerifyStatus] = useState("badge bg-danger");

    const changeUpload = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.sig$/)[0].async('string').then(sig => {
                    u.folder('').file(/.*\.p7$/)[0].async('string').then(pubk => {
                        readCleartextMessage({cleartextMessage: sig}).then(ctm => {
                            setDataVerify({
                                ...dataVerify, 
                                originalMessage: ctm.getText(),
                                signature: sig,
                                publicKey: pubk
                            });
                            setDisabledVerify(false);
                        }).catch(e5 => console.error("e5: " + e5));
                    }).catch(e4 => console.error("e4: " + e4));
                }).catch(e3 => console.error("e3: " + e3))
            }).catch(e2 => {console.log("e2: " + e2)});
        }).catch(e1 => console.error("e1: " + e1))
    };

    const clickVerify = (e) => {
        readCleartextMessage({
            cleartextMessage: dataVerify.signature
        }).then(ctm => {
            readKey({
                armoredKey: dataVerify.publicKey
            }).then(pubk => {
                verify({
                    message: ctm,
                    verificationKeys: pubk.toPublic()
                }).then(veri => {
                    // it's good.
                    setVerifyStatus(true);
                    cleanThisUp();
                }).catch(e3 => {
                    setVerifyStatus(false);
                    // handle unverified signature
                    cleanThisUp();
                });
            }).catch(e2 => console.error(e2));
        }).catch(e1 => console.error(e1));
    };

    const cleanThisUp = () => {
        setDisabledVerify(true);
        refOrigMsg.current.value = "";
        setDataVerify({});
    };

    useEffect(() => {}, [dataVerify]);

    return (
        <>
            <Stack gap={3}>
                <Form.Group>
                    <FloatingLabel label="original message">
                        <Form.Control ref={refOrigMsg} value={dataVerify.originalMessage} disabled={true} as='textarea' style={{minHeight: '150px'}} />
                    </FloatingLabel>
                </Form.Group>
                <div>verified? <span className="badge bg-success">{verifyStatus ? "yup" : "nope"}</span></div>
                <input type='file' ref={refUpload} multiple={false} onChange={changeUpload} style={{display: 'none'}} />
                <ButtonGroup>
                    <Button onClick={e => refUpload.current.click()} variant='primary'>upload signature...</Button>
                    <Button disabled={disabledVerify} onClick={clickVerify} variant='secondary'>verify</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Verify;