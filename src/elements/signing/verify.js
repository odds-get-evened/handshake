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

    const [dataVerify, setDataVerify] = useState({});
    const [disabledVerify, setDisabledVerify] = useState(true);
    const [verifyStatus, setVerifyStatus] = useState(false);

    const changeUpload = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.sig$/)[0].async('uint8array').then(sig => {
                    u.folder('').file(/.*\.p7$/)[0].async('uint8array').then(pubk => {
                        setDataVerify({
                            ...dataVerify,
                            signature: sig,
                            publicKey: pubk
                        });
                        setDisabledVerify(false);
                    }).catch(e4 => console.error(e4));
                }).catch(e3 => console.error(e3))
            }).catch(e2 => console.log(e2));
        }).catch(e1 => console.error(e1))
    };

    const clickVerify = (e) => {
        let sigStr = Buffer.from(dataVerify.signature).toString('utf8');
        readMessage({armoredMessage: sigStr}).then(msg => {
            console.log(msg.getText());
        }).catch(e1 => console.error(e1));
        /*verify({
            message: dataVerify.signature,
            verificationKeys: dataVerify.publicKey
        }).then(veriMsg => {
            console.log(veriMsg);

        }).catch(e1 => console.error(e1));*/
    };

    useEffect(() => {
        console.log(dataVerify);
    }, [dataVerify]);

    return (
        <>
            <Stack gap={3}>
                <Form.Group>
                    <FloatingLabel label="original message">
                        <Form.Control value={dataVerify.originalMessage} disabled={true} as='textarea' style={{minHeight: '150px'}} />
                    </FloatingLabel>
                </Form.Group>
                <div>{verifyStatus}</div>
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