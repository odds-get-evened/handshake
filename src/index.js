import 'regenerator-runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
    Container, Row, Col, Badge
} from 'react-bootstrap';
import Signing from './elements/signing'; 

const Main = (props) => {
    return (
        <BrowserRouter>
            <Container>
                <Row>
                    <Col lg={12}>
                        <h1>handshake <Badge bg='dark'>v0.0.1</Badge></h1>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Routes>
                            <Route path="/" element={<Signing />} />
                        </Routes>
                    </Col>
                </Row>
            </Container>
        </BrowserRouter>
    );
};

const appContainer = document.getElementById('app');
const appRoot = createRoot(appContainer);
appRoot.render(<Main />);