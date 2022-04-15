import 'regenerator-runtime';
import React from 'react';
import { 
    Tabs, Tab, 
    Row, Col, Nav
} from 'react-bootstrap';
import Generate from './signing/generate';
import Sign from './signing/sign';

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
                                <Col sm={9}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="generate">
                                            <Generate />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="sign">
                                            <Sign />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="verify">
                                            Nothing for now
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </Col>
                </Row>
            </Tab>
            <Tab eventKey="encryption" title="Encryption">

            </Tab>
        </Tabs>
    );
};

export default Signing;