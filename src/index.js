import 'regenerator-runtime';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
    Container, Row, Col, Button,
    Card, Table, Image, Spinner,
    Tab, Nav, Tabs, Form, Stack,
    ButtonGroup
} from 'react-bootstrap';
import crypto from 'crypto';

const CryptoTool = (props) => {
    const [randomString, setRandomString] = useState();
    const [byteLength, setByteLength] = useState(4);

    useEffect(() => {
        crypto.randomBytes(byteLength, (err, buf) => {
            setRandomString(buf.toString('hex'))
        });
    }, []);

    const clickGenRandomString = (e) => {
        console.log("byte length: " + byteLength);
        crypto.randomBytes(byteLength, (err, buf) => {
            setRandomString(buf.toString('hex'));
        });
    };

    const onSelectBytLength = (e) => {
        setByteLength(parseInt(e.target.value));
    };

    return (
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
                            <Form.Select onChange={onSelectBytLength} aria-label="# bytes">
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
    );
};

const Main = (props) => {
    return (
        <Container>
            <Row>
                <Col lg={4}>
                    <CryptoTool />
                </Col>
            </Row>
        </Container>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));