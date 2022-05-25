import JSZip from "jszip";
import { createMessage, encrypt, readCleartextMessage, readKey } from "openpgp";
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

    const [disableUploadKey, setDisableUploadKey] = useState(false);
    const [disableEncryptIt, setDisableEncryptIt] = useState(false);
    const [originalMessageClear, setOriginalMessageClear] = useState("");

    const [encData, setEncData] = useState({});

    const clickEncryptIt = (e) => {
        createMessage({text: encData.originalMessage.getText()}).then(msg => {
            readKey({armoredKey: Buffer.from(encData.publicEncKey).toString('utf8')}).then(pubk => {
                encrypt({
                    message: msg,
                    encryptionKeys: pubk
                }).then(strm => {
                    console.log(strm);
                    console.log(pubk.armor());
                }).catch(err3 => console.log(err3));
            }).catch(err2 => console.error(err2));
        }).catch(err1 => console.error(err1));
    };

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.sig$/)[0].async('arraybuffer').then(sig => {
                    u.folder('').file(/.*\.p7$/)[0].async('arraybuffer').then(pubk => {
                        readCleartextMessage({
                            cleartextMessage: Buffer.from(sig).toString('utf8')
                        }).then(ctm => {
                            setEncData({
                                ...encData,
                                originalMessage: ctm,
                                signature: sig,
                                publicSigningKey: pubk
                            });
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
                u.folder('').file(/.*\.pub$/)[0].async('arraybuffer').then(pub => {
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
        if(typeof encData.originalMessage == 'object') 
            setOriginalMessageClear(encData.originalMessage.getText());
    }, [encData]);

    return (
        <>
            <Stack gap={3}>
                <Form>
                    <Form.Group>
                        <FloatingLabel label='original message'>
                            <Form.Control as='textarea' value={originalMessageClear} ref={refOrigMsg} disabled={true} style={{minHeight: '100px'}} />
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