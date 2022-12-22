import JSZip from 'jszip';
import { readCleartextMessage, readKey, verify } from 'openpgp';
import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import { 
    ButtonGroup, FloatingLabel, Form, 
    Stack, Button, Alert
} from 'react-bootstrap';

const Verify = () => {
    const refUpload = useRef();
    const refOrigMsg = useRef();

    const [dataVerify, setDataVerify] = useState({});
    const [disabledVerify, setDisabledVerify] = useState(true);
    const [verifyStatus, setVerifyStatus] = useState(false);
    const [displayUserId, setDisplayUserId] = useState(false);

    const [sigData, setSigData] = useState({});

    const changeUpload = (e) => {
        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then((u) => {
                u.folder('').file(/.*\.sig$/)[0].async('string').then((sig) => {
                    u.folder('').file(/.*\.p7$/)[0].async('string').then((pubk) => {

                        readKey({armoredKey: pubk}).then((k) => {
                            k.getPrimaryUser().then((pu) => {
                                setSigData({
                                    ...sigData, 
                                    name: pu.user.userID.name,
                                    email: pu.user.userID.email
                                });
                                setDisplayUserId(true);
                            }).catch((e) => {});
                        }).catch((e) => console.log(e));

                        readCleartextMessage({cleartextMessage: sig}).then((ctm) => {
                            setDataVerify({
                                ...dataVerify, 
                                originalMessage: ctm.getText(),
                                signature: sig,
                                publicKey: pubk
                            });
                            setDisabledVerify(false);
                        }).catch((e) => console.error("e5: " + e));
                    }).catch((e) => console.error("e4: " + e));
                }).catch((e) => console.error("e3: " + e))
            }).catch((e) => {console.log("e2: " + e)});
        }).catch((e) => console.error("e1: " + e))
    };

    const clickVerify = (e) => {
        readCleartextMessage({
            cleartextMessage: dataVerify.signature
        }).then((ctm) => {
            readKey({
                armoredKey: dataVerify.publicKey
            }).then((pubk) => {
                verify({
                    message: ctm,
                    verificationKeys: pubk.toPublic()
                }).then((veri) => {
                    // it's good.
                    setVerifyStatus(true);
                    cleanThisUp();
                }).catch((e) => {
                    setVerifyStatus(false);
                    // handle unverified signature
                    cleanThisUp();
                });
            }).catch((e) => console.error(e));
        }).catch((e) => console.error(e));
    };

    const cleanThisUp = () => {
        setDisabledVerify(true);
        refOrigMsg.current.value = "";
        setDataVerify({});
    };

    return (
        <>
            <Stack gap={3}>
                <Form.Group>
                    <FloatingLabel label="original message">
                        <Form.Control ref={refOrigMsg} value={dataVerify.originalMessage} disabled={true} as='textarea' style={{minHeight: '150px'}} />
                    </FloatingLabel>
                </Form.Group>

                <Alert show={displayUserId}>signer: {sigData.name} {sigData.email}</Alert>
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