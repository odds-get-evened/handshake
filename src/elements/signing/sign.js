import React, {useState, useEffect, useRef} from 'react';
import {
    Stack, Form, FloatingLabel,
    ButtonGroup, Button, Modal
} from 'react-bootstrap';
import {
    createCleartextMessage, decryptKey,
    readPrivateKey, sign
} from 'openpgp';
import JSZip from 'jszip';
import {randomBytes} from 'crypto';
import {saveAs} from 'file-saver';

const Sign = () => {
    const refUpload = useRef();
    const refMessage = useRef();
    const refPasswd = useRef();

    const [showPassModal, setShowPostModal] = useState(false);
    
    const [disabledSubmitPasswd, setDisabledSubmitPasswd] = useState(true);
    const [disabledUpload, setDisabledUpload] = useState(true);
    const [signingData, setSigningData] = useState({});

    const clickSubmitPasswd = (e) => {
        decryptKey({
            privateKey: signingData.privateKey,
            passphrase: signingData.thepasswd.trim()
        }).then(privk => {
            createCleartextMessage({
                text: signingData.message
            }).then(ctm => {
                sign({
                    message: ctm,
                    signingKeys: privk
                }).then(signedMsg => {
                    let zip = JSZip();
                    let theTag = randomBytes(4).toString('hex');

                    zip.file("signature-" + theTag + ".sig", signedMsg);
                    zip.file("public-key-" + theTag + ".p7", privk.toPublic().armor());

                    if(JSZip.support.uint8array) {
                        zip.generateAsync({type: 'blob'}).then(blob => {
                            saveAs(blob, "handshake-signed-" + theTag + ".zip");
                            cleanThisUp();
                            setShowPostModal(false);
                        }).catch(err3 => console.error(err3));
                    }
                }).catch(err1 => console.error(err1));
            }).catch(err2 => console.error(err2));
        }).catch(err => {
            console.error(err.message);
            setShowPostModal(false);
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
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.priv$/)[0].async('string').then(privk => {
                    readPrivateKey({armoredKey: privk}).then(unprivk => {
                        setSigningData({...signingData, privateKey: unprivk});
                        setShowPostModal(true);
                    }).catch(err3 => console.log(err3));
                }).catch(err2 => console.log(err2));
            }).catch(err1 => console.log(err1));
        }).catch(err => console.log(err));
    };

    useEffect(() => {
        //console.log(signingData);
        // make sure message is present
        setDisabledUpload(!(signingData.message));
        setDisabledSubmitPasswd(!(signingData.thepasswd));
    }, [signingData]);

    return (
        <>
            <Modal show={showPassModal}>
                <Modal.Header>
                    <Modal.Title>private key authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>password</Form.Label>
                            <Form.Control ref={refPasswd} type='password' onChange={changePasswd} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='button' disabled={disabledSubmitPasswd} onClick={clickSubmitPasswd}>ok</Button>
                </Modal.Footer>
            </Modal>
            <Stack gap={3}>
                <Form>
                    <Form.Group>
                        <FloatingLabel label='message to sign'>
                            <Form.Control ref={refMessage} onChange={changeMessage} as='textarea' style={{minHeight: '150px'}} />
                        </FloatingLabel>
                    </Form.Group>
                </Form>
                <input type='file' ref={refUpload} multiple={false} onChange={changeUploadFile} style={{display: 'none'}} />
                <ButtonGroup>
                    <Button onClick={e => {refUpload.current.click();}} disabled={disabledUpload} type='button'>upload keys...</Button>
                </ButtonGroup>
            </Stack>
        </>
    );
};

export default Sign;