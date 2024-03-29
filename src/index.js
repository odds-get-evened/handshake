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
                        <h1>handshake <Badge bg='dark'>v0.0.4</Badge></h1>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <Signing />
                    </Col>
                </Row>
                <footer className='text-center text-lg-start bg-light text-muted'>
                    <div className='text-center p-4' style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
                        &copy; 2023 copyright&nbsp;
                        <a className='text-reset fw-bold' href="https://odds-get-evened.github.io/">Chris Walsh &lt;odds_get_evened&gt;</a>
                    </div>
                </footer>
            </Container>
        </>
    );
};

const appContainer = document.getElementById('app');
const appRoot = createRoot(appContainer);
appRoot.render(<Main />);