import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { decryptKey, readPrivateKey } from 'openpgp';
import React, { useRef, useState, useEffect } from 'react';
import { 
    Stack, Row, Col, Button, Alert,
    Modal, Form
} from 'react-bootstrap';
import { getFileTag } from '../../handshake-tools/file-utils';

const PubKey = () => {
    const refUploadEnc = useRef();
    const refBtnGetPub = useRef();
    const refPasswd = useRef();

    const [errorMessage, setErrorMessage] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    const [showPassModal, setShowPassModal] = useState(false);

    const [theData, setTheData] = useState({});

    const changePasswd = (e) => {
        setTheData({...theData, passwd: e.target.value.trim()});
    };

    const submitPasswd = (e) => {
        e.preventDefault();

        decryptKey({
            privateKey: theData.armoredPriv,
            passphrase: theData.passwd
        }).then((res) => {
            setTheData({...theData, armoredPriv: undefined, passwd: undefined});
            const armorPub = res.toPublic().armor();
            const zip = new JSZip();
            zip.file("handshake-enc-" + theData.theTag + ".pub", armorPub);

            if(JSZip.support.uint8array) {
                zip.generateAsync({type: 'blob'}).then((res) => {
                    saveAs(res, "handshake-pub-" + theData.theTag + ".zip");
                }).catch((e) => setErrorMessage(e.message));
            }
        }).catch((e) => setErrorMessage(e.message));

        setShowPassModal(false);
    };

    const changeUploadEnc = (e) => {
        const zipFilename = e.target.files.item(0).name;

        e.target.files.item(0).arrayBuffer().then((res) => {
            JSZip.loadAsync(res).then((res) => {
                res.folder('').file(/.*\.pem$/)[0].async('string').then((res) => {
                    readPrivateKey({
                        armoredKey: res
                    }).then((res) => {
                        setTheData({
                            ...theData, 
                            armoredPriv: res,
                            theTag: getFileTag(zipFilename)
                        });
                        setShowPassModal(true);
                    }).catch((e) => setErrorMessage(e));
                }).catch((e) => setErrorMessage(e.message));
            }).catch((e) => setErrorMessage(e.message));
        }).catch((e) => setErrorMessage(e.message));
    };

    useEffect(() => {
        console.log(theData);
        setShowErrors(!(errorMessage == ""));
    }, [errorMessage, theData])

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
                <Alert variant='danger' show={showErrors}>{errorMessage}</Alert>
                <Row>
                    <Col lg={12}>encryption packets <u>will not</u> encrypt messages, it will only decrypt.</Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <input type='file' ref={refUploadEnc} multiple={false} onChange={changeUploadEnc} style={{display: 'none'}} />
                        <Button type="button" ref={refBtnGetPub} onClick={(e) => {refUploadEnc.current.click();}}>extract public key!</Button>
                    </Col>
                </Row>
            </Stack>
        </>
    );
};

export default PubKey;