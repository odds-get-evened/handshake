import 'regenerator-runtime';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
    Container, Row, Col, Button,
    Card, Table, Image, Spinner,
    Tab, Nav, Tabs, Form, Stack,
    ButtonGroup, Text
} from 'react-bootstrap';
import crypto from 'crypto';

const RandomStringTool = (props) => {
    const [randomString, setRandomString] = useState();
    const [byteLength, setByteLength] = useState(4);

    useEffect(() => {
        crypto.randomBytes(byteLength, (err, buf) => {
            setRandomString(buf.toString('hex'))
        });

        
    }, []);

    const clickGenRandomString = (e) => {
        crypto.randomBytes(byteLength, (err, buf) => {
            setRandomString(buf.toString('hex'));
        });
    };

    const onSelectBytLength = (e) => {
        setByteLength(parseInt(e.target.value));
    };

    return (
        <Stack direction='horizontal' gap={5}>
            <Card>
                <Card.Body>
                    <Card.Title>random string generator</Card.Title>
                    
                    <Stack direction='vertical' gap={5}>
                        <Table striped hover>
                            <tbody>
                                <tr>
                                    <th>byte len.</th>
                                    <td>{byteLength}</td>
                                </tr>
                                <tr>
                                    <th>random str.</th>
                                    <td>{randomString}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form>
                            <Form.Group>
                                <Form.Label htmlFor='selectByteLength'></Form.Label>
                                <Form.Select id='selectByteLength' onChange={onSelectBytLength} aria-label="# bytes">
                                    <option value={4}>4</option>
                                    <option value={8}>8</option>
                                    <option value={16}>16</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant='primary' type='button' onClick={clickGenRandomString}>Random String</Button>
                        </Form>
                    </Stack>
                </Card.Body>
            </Card>
        </Stack>
    );
};

const SignThings = (props) => {
    const [signingKey, setSigningKey] = useState({
        pub: [],
        priv: []
    });

    // for exports
    const [keyFormat, setKeyFormat] = useState('raw');

    useEffect(() => {
        let keyPair = window.crypto.subtle.generateKey({
            name: 'ECDSA',
            namedCurve: 'P-384',
        }, true, ['sign', 'verify']);
        keyPair.then((res) => {
            window.crypto.subtle.exportKey(keyFormat, res.publicKey).then((exported) => {
                setSigningKey({...signingKey, pub: Buffer.from(exported)});
            });
        });

    }, []);

    const selectKeyFormat = (mode) => {
        setKeyFormat(mode);
    };

    const clickDoIt = (e) => {
        if(keyFormat == 'spki') { // public signing keys only
            window.crypto.subtle.generateKey({
                name: 'ECDSA',
                namedCurve: 'P-384',
            }, true, ['sign', 'verify']).then((res) => {
                window.crypto.subtle.exportKey('spki', res.publicKey).then((exported) => {
                    setSigningKey({...signingKey, pub: exported});
                    let pubStr = String.fromCharCode.apply(null, new Uint8Array(signingKey.pub));
                    let pubB64 = window.btoa(pubStr);
                    console.log("-----BEGIN PUBLIC KEY-----\n" + pubB64 + "\n-----END PUBLIC KEY-----");

                });
            });
        }
    };

    return (
        <Stack direction='vertical' gap={5}>
            <Card>
                <Card.Title>signing things</Card.Title>
                <Card.Subtitle>use this to create and sign strings</Card.Subtitle>
                <Stack direction='vertical' gap={5}>
                    <Table striped hover>
                        <tbody>
                            <tr>
                                <th>format</th>
                                <td>{keyFormat}</td>
                            </tr>
                            <tr>
                                <th>public key</th>
                                <td style={{wordBreak: 'break-all'}}>{signingKey.pub.toString('hex')}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Form>
                        <Form.Group>
                            <Form.Label htmlFor='keyFormat'>format?</Form.Label>
                            <Form.Select onChange={(e) => selectKeyFormat(e.target.value)}>
                                <option value={'raw'}>raw</option>
                                <option value={'spki'}>spki</option>
                                <option value={'pkcs8'}>pkcs8 (good 4 file saving)</option>
                                <option value={'jwk'}>json web key</option>
                            </Form.Select>
                        </Form.Group>
                        <Button onClick={clickDoIt}>do it</Button>
                    </Form>
                </Stack>
            </Card>
        </Stack>
    );
};

const Main = (props) => {
    return (
        <Container>
            <Row>
                <Col lg={6}>
                    <RandomStringTool />
                </Col>
                <Col lg={6}>
                    <SignThings />
                </Col>
            </Row>
        </Container>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));