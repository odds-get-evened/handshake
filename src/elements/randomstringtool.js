
import React, { useEffect, useState } from 'react';
import {
    Button,
    Card, Table, Form, Stack
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
                        </Form>
                        <Button variant='primary' type='button' onClick={clickGenRandomString}>Random String</Button>
                    </Stack>
                </Card.Body>
            </Card>
        </Stack>
    );
};

export default RandomStringTool;