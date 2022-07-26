import JSZip from "jszip";
import { readMessage } from "openpgp";
import React, {useState, useRef, useEffect} from "react";
import {
    ButtonGroup, Button, Stack
} from "react-bootstrap";

const Decrypt = () => {
    const refUploadKey = useRef();
    const refUploadMsg = useRef();

    const [disableUploadMsg, setDisableUploadMsg] = useState(true);
    const [decData, setDecData] = useState({});

    const changeUploadMsg = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.asc$/)[0].async('arraybuffer').then(msg => {
                    readMessage({binaryMessage: Buffer.from(msg).toString('utf8')}).then(emg => {
                        setDecData({
                            ...decData,
                            encMessage: emg
                        });
                    }).catch(err4 => console.log(err4));
                }).catch(err3 => console.log(err3))
            }).catch(err2 => console.log(err2));
        }).catch(err1 => console.log(err1));
    };

    const changeUploadKey = (e) => {
        e.target.files.item(0).arrayBuffer().then(bin => {
            JSZip.loadAsync(bin).then(u => {
                u.folder('').file(/.*\.pem$/)[0].async('arraybuffer').then(priv => {
                    setDecData({
                        ...decData,
                        privateEncKey: priv
                    });
                    setDisableUploadMsg(false);
                }).catch(err3 => console.log(err3));
            }).catch(err2 => console.log(err2));
        }).catch(err1 => console.log(err1));
    };

    useEffect(() => {
        console.log(decData);
    }, [decData]);

    return (
        <>
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