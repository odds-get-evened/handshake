import Joi from 'joi';
import JSZip from 'jszip';
import { CleartextMessage, createCleartextMessage, readKey, readSignature, verify } from 'openpgp';
import React, {useState, useRef, useEffect} from 'react';
import { 
    ButtonGroup, FloatingLabel, Form, 
    Stack, Button 
} from 'react-bootstrap';

const Verify = () => {
    const refGimmeUrMsg = useRef();
    const refUrMsg = useRef();

    const [disabledVerify, setDisabledVerify] = useState(true);
    const [dataVerify, setDataVerify] = useState({
        originalMessage: "",
        signature: "",
        publicKey: ""
    });

    const schemaVerify = Joi.object({
        originalMessage: Joi.string().required(),
        signature: Joi.string().required(),
        publicKey: Joi.string().required()
    });

    const changeGimmeUrMsg = (e) => {
        // handle upload of message packet
        e.target.files.item(0).arrayBuffer().then((bin) => {
            JSZip.loadAsync(bin).then((u) => {
                u.folder('').file(/.*\.txt$/)[0].async('string').then((msg) => {
                    u.folder('').file(/.*\.sig$/)[0].async('string').then((sig) => {
                        u.folder('').file(/.*\.key$/)[0].async('string').then((pub) => {
                            setDataVerify({
                                originalMessage: msg.trim(),
                                signature: sig,
                                publicKey: pub
                            });
                        });
                    });
                });
            });
        });
    };

    const clickVerify= (e) => {
        // handle verification
        console.log(dataVerify);
        // load up public key for verification
        readKey({armoredKey: dataVerify.publicKey})
            .then(pubKey => {
                readSignature({armoredSignature: dataVerify.signature}).then(sig => {
                    verify({
                        message: createCleartextMessage({text: dataVerify.originalMessage}),
                        verificationKeys: pubKey,
                        signature: sig
                    }).then(msg => console.log(msg));
                });
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        let isValid = schemaVerify.validate(dataVerify);
        setDisabledVerify(isValid.error);
    }, [dataVerify]);

    return (
        <Stack gap={3}>
            <Form.Group>
                <FloatingLabel label='signed message'>
                    <Form.Control value={dataVerify.originalMessage} disabled={true} as='textarea' style={{minHeight: '150px'}} />
                </FloatingLabel>
            </Form.Group>
            <input type="file" ref={refGimmeUrMsg} multiple={false} onChange={changeGimmeUrMsg} style={{ display: 'none' }} />
            <ButtonGroup>
                <Button onClick={(e) => refGimmeUrMsg.current.click()}>get message packet...</Button>
                <Button disabled={disabledVerify} onClick={clickVerify}>verify</Button>
            </ButtonGroup>
        </Stack>
    );
};

export default Verify;