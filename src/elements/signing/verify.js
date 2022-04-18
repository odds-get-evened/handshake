import Joi from 'joi';
import JSZip from 'jszip';
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
                /*u.folder('').file(/.*\.txt$/)[0].async('string').then((msg) => {
                    setDataVerify({...dataVerify, originalMessage: msg.trim()});
                });

                u.folder('').file(/.*\.sig$/)[0].async('string').then((sig) => {
                    setDataVerify({...dataVerify, signature: sig});
                });

                u.folder('').file(/.*\.key$/)[0].async('string').then((pub) => {
                    setDataVerify({...dataVerify, publicKey: pub});
                });*/
                u.folder('').forEach((i, v) => {
                    v.async('string').then((c) => {
                        if(v.name.endsWith('.sig')) {
                            
                        }
                    });
                });
            });
        });
    };

    const clickVerify= (e) => {
        // handle verification
    };

    useEffect(() => {
        console.log(dataVerify);
        let isValid = schemaVerify.validate(dataVerify);
        setDisabledVerify(isValid.error);
    }, [dataVerify]);

    return (
        <Stack gap={3}>
            <Form.Group>
                <FloatingLabel label='signed message'>
                    <Form.Control disabled={true} ref={refUrMsg} as='textarea' style={{minHeight: '150px'}} />
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