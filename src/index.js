import 'regenerator-runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    Container, Row, Col, Badge, Stack, Card, ListGroup, ListGroupItem
} from 'react-bootstrap';
import Signing from './elements/signing';

const Main = (props) => {
    return (
        <Container>
            <Row>
                <Col lg={12}>
                    <h1>handshake <Badge bg='dark'>v0.0.1</Badge></h1>
                </Col>
            </Row>
            <Row>
                <Col lg={12}>
                    <Signing />
                </Col>
            </Row>
        </Container>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));