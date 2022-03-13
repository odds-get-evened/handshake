import 'regenerator-runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    Container, Row, Col
} from 'react-bootstrap';
import Signthings from './elements/signthings';

const Main = (props) => {
    return (
        <Container>
            <Row>
                <Col lg={12}>
                    <Signthings />
                </Col>
            </Row>
        </Container>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));