import React from 'react';
import { 
    Tabs, Tab, Alert,
    Row, Col, Nav
} from 'react-bootstrap';
import Generate from './signing/generate';
import Sign from './signing/sign';
import Verify from './signing/verify';
import EGenerate from './encrypting/egenerate';
import Encrypt from './encrypting/encrypt';
import Decrypt from './encrypting/decrypt';

const Signing = () => {
    return (
        <Tabs defaultActiveKey="signing" transition={false} className="mb-3">
            <Tab eventKey="signing" title="Signing">
                <Row>
                    <Col>
                        <Tab.Container defaultActiveKey="generate">
                            <Row>
                                <Col sm={3}>
                                    <Nav variant='pills' className='flex-column'>
                                        <Nav.Item>
                                            <Nav.Link eventKey="generate">generate</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="sign">sign</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="verify">verify</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={6}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="generate">
                                            <Generate />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="sign">
                                            <Sign />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="verify">
                                            <Verify />
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                                <Col lg={3}>
                                    <Alert variant='danger'>
                                        <span className='fs-3 text'>1.</span> generate some keys to sign things with. you will
                                        receive a signing packet
                                        <br />
                                        <span className='small fw-semibold'>handshake-sign-&lt;id tag&gt;.zip</span>
                                    </Alert>
                                    <Alert variant='warning'>
                                        <span className='fs-3 text'>2.</span> upload a signing packet to sign any provided message.
                                        from this you will receive a signed message packet
                                        <br />
                                        <span className='small fw-semibold'>handshake-signed-&lt;sign id tag&gt;.zip</span>
                                    </Alert>
                                    <Alert variant='success'>
                                        <span className='fs-3 text'>3.</span> upload any signed message packet, that was signed using
                                        handshake. it will check to see if a signature is valid.                                        
                                    </Alert>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </Col>
                </Row>
            </Tab>
            <Tab eventKey="encryption" title="Encryption">
                <Row>
                    <Col>
                        <Tab.Container defaultActiveKey="generate">
                            <Row>
                                <Col sm={3}>
                                    <Nav variant='pills' className='flex-column'>
                                        <Nav.Item>
                                            <Nav.Link eventKey="generate">generate</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="encrypt">encrypt</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="decrypt">decrypt</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={6}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="generate">
                                            <EGenerate />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="encrypt">
                                            <Encrypt />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="decrypt">
                                            <Decrypt />
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                                <Col lg={3}>
                                    <Alert variant='danger'>
                                        <span className='fs-3 text'>1.</span>
                                        generate a key packet for encrypting your signed messages. this will download 
                                        an encryption packet.
                                        <br />
                                        <span className='small fw-semibold'>example: handshake-enc-&lt;tag id&gt;.zip</span>
                                    </Alert>
                                    <Alert variant='warning'>
                                        <span className='fs-3 text'>2.</span> use your signed packet, to encrypt the clear text message from the signing process.
                                        <br />
                                        <span className='small fw-semibold'>example: handshake-secret-&lt;enc id tag&gt;.zip</span>
                                    </Alert>
                                    <Alert variant='success'>
                                        <span className='fs-3 text'>3.</span> decrypt the secret packet created in step 2.
                                        it is important to use ensure the encryption and secret packets ID tags match.                                        
                                    </Alert>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </Col>
                </Row>
            </Tab>
        </Tabs>
    );
};

export default Signing;