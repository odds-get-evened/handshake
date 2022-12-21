import JSZip from "jszip";
import { readMessage } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import {
    ButtonGroup, Button, Stack, Modal, Form
} from "react-bootstrap";

const Decrypt = () => {
    const refUploadKey = useRef();
    const refUploadMsg = useRef();
    const refPasswd = useRef();

    const [disableUploadMsg, setDisableUploadMsg] = useState(true);
    const [decData, setDecData] = useState({});
    const [showPassModal, setShowPassModal] = useState(false);
    const [disabledSubmitPasswd, setDisabledSubmitPasswd] = useState(true);

    const changePasswd = (e) => {
        setDecData({...decData, thepasswd: e.target.value.trim()});
    };

    const clickSubmitPasswd = (e) => {};

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                /*u.folder('').file(/.*\.asc$/)[0].async('arraybuffer').then(msg => {
                    
                }).catch(err3 => console.log(err3))*/
                u.folder('').file(/.*\.asc$/)[0].async('string').then((msg) => {
                    console.log(msg);
                });
            }).catch(err2 => console.log(err2));
        }).catch(err1 => console.log(err1));
    };

    const changeUploadKey = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                setShowPassModal(true);
                /*u.folder('').file(/.*\.pem$/)[0].async('arraybuffer').then(priv => {
                    setDecData({
                        ...decData,
                        privateEncKey: priv
                    });
                    
                    //setDisableUploadMsg(false);
                }).catch(err3 => console.log(err3));*/
            }).catch(err2 => console.log(err2));
        }).catch(err1 => console.log(err1));
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