import 'regenerator-runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    Container, Row, Col, Badge, Navbar, Nav
} from 'react-bootstrap';
import Signing from './elements/signing';

const Main = (props) => {
    return (
        <>
            <Container>
                <Row>
                    <Col lg={12}>
                        <h1>handshake <Badge bg='dark'>v0.0.2</Badge></h1>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Signing />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

const appContainer = document.getElementById('app');
const appRoot = createRoot(appContainer);
appRoot.render(<Main />);