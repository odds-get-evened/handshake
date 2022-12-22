import JSZip from "jszip";
import { createMessage, encrypt, readCleartextMessage, readKey } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import { 
    ButtonGroup, Stack, Button,
    Form, FloatingLabel
} from 'react-bootstrap';
import {randomBytes} from 'crypto';

const Encrypt = () => {
    const refUploadKey = useRef();
    const refUploadMsg = useRef();
    const refOrigMsg = useRef();

    const [disableUploadKey, setDisableUploadKey] = useState(true);
    const [disableEncryptIt, setDisableEncryptIt] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    const [encData, setEncData] = useState({});

    const clickEncryptIt = (e) => {
        createMessage({text: encData.originalMessageClear}).then((msg) => {
            readKey({
                armoredKey: Buffer.from(encData.publicEncKey).toString('utf8')
            }).then((pubk) => {
                encrypt({
                    message: msg,
                    encryptionKeys: pubk,
                    config: {
                        versionString: 'handshake 0.0.1'
                    }
                }).then((strm) => {
                    let zip = new JSZip();
                    let theTag = randomBytes(4).toString('hex');

                    zip.file("public-key-" + theTag + ".p7", pubk.armor());
                    zip.file("encrypted-" + theTag + ".asc", strm);

                    if(JSZip.support.uint8array) {
                        zip.generateAsync({type: 'blob'}).then((blob) => {
                            saveAs(blob, "handshake-secret-" + theTag + ".zip");
                            cleanUp();       
                        }).catch((e) => console.error(e));
                    }
                }).catch((e) => console.log(e));
            }).catch((e) => console.error(e));
        }).catch((e) => {
            console.error(e);
            setErrorMessage("failed to create a valid PGP message packet.");
        });
    };

    const cleanUp = () => {
        setErrorMessage("");
        setDisableEncryptIt(true);
        setDisableUploadKey(true);
        setEncData({});
    };

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then((u) => {
                u.folder('').file(/.*\.sig$/)[0].async('arraybuffer').then((sig) => {
                    u.folder('').file(/.*\.p7$/)[0].async('arraybuffer').then((pubk) => {
                        readCleartextMessage({
                            cleartextMessage: Buffer.from(sig).toString('utf8')
                        }).then((ctm) => {
                            setEncData({
                                ...encData,
                                originalMessageClear: ctm.getText(),
                                signature: sig,
                                publicSigningKey: pubk
                            });
                            setErrorMessage("");
                            setDisableUploadKey(false);
                        }).catch((e) => {
                            console.log(e);
                            setErrorMessage("unable to create clear-text message.");
                        });
                    }).catch((e) => {
                        console.error(e);
                        setErrorMessage("unable to load public key file.");
                    });
                }).catch((e) => {
                    console.error(e);
                    setErrorMessage("bad signature packet.");
                });
            }).catch((e) => {
                console.log(e);
                setErrorMessage("unable to load packet file");
            });
        }).catch((e) => {
            console.error(e);
            setErrorMessage("could not find and files.");
        });
    };

    const changeUploadKey = (e) => {
        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then((u) => {
                u.folder('').file(/.*\.pub$/)[0].async('arraybuffer').then((pub) => {
                    setEncData({...encData, publicEncKey: pub});
                    setErrorMessage("");
                    setDisableEncryptIt(false);
                }).catch((e) => {
                    console.log(e);
                    setErrorMessage("failed to load public encryption key.");
                });
            }).catch((e) => {
                console.error(e);
                setErrorMessage("failed to load key.");
            });
        }).catch((e) => {
            console.error(e);
            setErrorMessage("failed to upload key.")
        });
    };

    useEffect(() => {
        // console.log(encData);
    }, [encData]);

    return (
        <>
            <Stack gap={3}>
                <Form>
                    <Form.Group>
                        <FloatingLabel label='original message'>
                            <Form.Control as='textarea' value={encData.originalMessageClear} ref={refOrigMsg} disabled={true} style={{minHeight: '100px'}} />
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