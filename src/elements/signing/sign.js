import React, { useState, useEffect, useRef } from 'react';
import {
    Stack, Form, FloatingLabel,
    ButtonGroup, Button, Modal,
    Alert
} from 'react-bootstrap';
import {
    createCleartextMessage, decryptKey,
    readPrivateKey, sign
} from 'openpgp';
import JSZip from 'jszip';
import { randomBytes } from 'crypto';
import { saveAs } from 'file-saver';
import { getFileTag } from '../../handshake-tools/file-utils';

const Sign = () => {
    const refUpload = useRef();
    const refMessage = useRef();
    const refPasswd = useRef();

    const [showPassModal, setShowPassModal] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [disabledSubmitPasswd, setDisabledSubmitPasswd] = useState(true);
    const [disabledUpload, setDisabledUpload] = useState(true);
    const [signingData, setSigningData] = useState({});

    const submitPasswd = (e) => {
        e.preventDefault();

        decryptKey({
            privateKey: signingData.privateKey,
            passphrase: signingData.thepasswd.trim()
        }).then(privk => {
            createCleartextMessage({
                text: signingData.message
            }).then((ctm) => {
                sign({
                    message: ctm,
                    signingKeys: privk
                }).then((signedMsg) => {
                    let zip = JSZip();
                    let theTag = randomBytes(4).toString('hex');

                    zip.file("signature-" + signingData.thetag + ".sig", signedMsg);
                    zip.file("public-key-" + signingData.thetag + ".p7", privk.toPublic().armor());

                    if(JSZip.support.uint8array) {
                        zip.generateAsync({type: 'blob'}).then((blob) => {
                            saveAs(blob, "handshake-signed-" + signingData.thetag + ".zip");
                            cleanThisUp();
                            setShowPassModal(false);
                        }).catch((e) => console.error(e));
                    }
                }).catch((e) => setErrorMessage('failed to sign message. [' + e.message + ']'));
            }).catch((e) => setErrorMessage('failed to acquire clear-text message. [' + e.message +']'));
        }).catch((e) => {
            setErrorMessage('failed to decrypt armored signing key. [' + e.message + ']')
            setShowPassModal(false);
            cleanThisUp();
        });
    };

    const cleanThisUp = () => {
        setDisabledUpload(true);
        refMessage.current.value = "";
        refPasswd.current.value = "";
        setSigningData({});
    };

    const changePasswd = (e) => {
        setSigningData({...signingData, thepasswd: e.target.value.trim()});
    };

    const changeMessage = (e) => {
        setSigningData({...signingData, message: e.target.value.trim()});
    };

    const changeUploadFile = (e) => {
        let zipFilename = e.target.files.item(0).name;

        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then((u) => {
                u.folder('').file(/.*\.priv$/)[0].async('string').then((privk) => {
                    readPrivateKey({armoredKey: privk}).then((unprivk) => {
                        setSigningData({
                            ...signingData, 
                            privateKey: unprivk,
                            thetag: getFileTag(zipFilename)
                        });
                        setShowPassModal(true);
                    }).catch((e) => setErrorMessage('failed to read signing key. [' + e.message + ']'));
                }).catch((e) => setErrorMessage('unable to read signing packet file. [' + e.message + ']'));
            }).catch((e) => setErrorMessage('invalid signing packet file. [' + e.message + ']'));
        }).catch((e) => setErrorMessage('[' + e.message + ']'));
    };

    useEffect(() => {
        // make sure message is present
        setShowError(!(errorMessage === ""));
        setDisabledUpload(!(signingData.message));
        setDisabledSubmitPasswd(!(signingData.thepasswd));
    }, [signingData, errorMessage]);

    return (
        <>
            <Modal show={showPassModal}>
                <Modal.Header>
                    <Modal.Title>private key authentication</Modal.Title>
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
                <Alert variant='danger' show={showError}>{errorMessage}</Alert>
                <Form>
                    <Form.Group>
                        <FloatingLabel label='message to sign'>
                            <Form.Control ref={refMessage} onChange={changeMessage} as='textarea' style={{minHeight: '150px'}} />
                        </FloatingLabel>
                    </Form.Group>
                </Form>
                <input type='file' ref={refUpload} multiple={false} onChange={changeUploadFile} style={{display: 'none'}} />
                <ButtonGroup>
                    <Button onClick={e => {refUpload.current.click();}} disabled={disabledUpload} type='button'>upload signing key</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Sign;