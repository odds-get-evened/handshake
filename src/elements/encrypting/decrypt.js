import JSZip from "jszip";
import { decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import {
    ButtonGroup, Button, Stack, Modal, Form, FloatingLabel
} from "react-bootstrap";

const Decrypt = () => {
    const refUploadKey = useRef();
    const refUploadMsg = useRef();
    const refPasswd = useRef();
    const refMessage = useRef();

    const [disableUploadMsg, setDisableUploadMsg] = useState(true);
    const [decData, setDecData] = useState({});
    const [showPassModal, setShowPassModal] = useState(false);
    const [disabledSubmitPasswd, setDisabledSubmitPasswd] = useState(true);

    const changePasswd = (e) => {
        setDecData({...decData, thepasswd: e.target.value.trim()});
    };

    const submitPasswd = (e) => {
        e.preventDefault();

        decryptKey({
            privateKey: decData.privatekey,
            passphrase: decData.thepasswd
        }).then((privk) => {
            setDecData({...decData, privatekey: privk, thepasswd: ""});
            setDisableUploadMsg(false);
            setShowPassModal(false);
        }).catch((e) => {
            console.log(e);
        });
    };

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.asc$/)[0].async('string').then((msg) => {
                    readMessage({
                        armoredMessage: msg
                    }).then((encMsg) => {
                        decrypt({
                            message: encMsg,
                            decryptionKeys: decData.privatekey
                        }).then((dec) => {
                            setDecData({...decData, origmsg: dec.data});
                        }).catch((e) => console.log(e));
                    }).catch((e) => console.log(e));
                }).catch((e) => console.log(e));
            }).catch((e) => console.log(e));
        }).catch((e) => console.log(e));
    };

    const changeUploadKey = (e) => {
        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then(u => {                
                u.folder('').file(/.*\.pem$/)[0].async('string').then(armoredPriv => {
                    readPrivateKey({
                        armoredKey: armoredPriv
                    }).then((unPriv) => {
                        setDecData({...decData, privatekey: unPriv});
                        setShowPassModal(true);
                    }).catch((e) => console.log(e));
                }).catch((e) => console.log(e));
            }).catch((e) => console.log(e));
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        console.log(decData);
        setDisabledSubmitPasswd(!(decData.thepasswd));
    }, [decData]);

    return (
        <>
            <Modal show={showPassModal}>
                <Modal.Header>
                    <Modal.Title>encryption key authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={submitPasswd}>
                        <Form.Group>
                            <Form.Label>password</Form.Label>
                            <Form.Control ref={refPasswd} type='password' onChange={changePasswd} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
            <Stack gap={3}>
                <Form.Group>
                    <FloatingLabel label="message">
                        <Form.Control ref={refMessage} value={decData.origmsg} disabled={true} as='textarea' style={{minHeight: '150px'}} />
                    </FloatingLabel>
                </Form.Group>
                <input type='file' ref={refUploadKey} multiple={false} onChange={changeUploadKey} style={{display: 'none'}} />
                <input type='file' ref={refUploadMsg} multiple={false} onChange={changeUploadMsg} style={{display: 'none'}} />
                <ButtonGroup>
                    <Button onClick={e => {refUploadKey.current.click();}}>add encryption key</Button>
                    <Button disabled={disableUploadMsg} onClick={e => {refUploadMsg.current.click();}}>add secret message</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Decrypt;