import 'regenerator-runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    Container, Row, Col
} from 'react-bootstrap';
import RandomStringTool from './elements/randomstringtool';
import SignThings from './elements/signthings';



const Main = (props) => {
    return (
        <Container>
            <Row>
                <Col lg={4}>
                    <RandomStringTool />
                </Col>
                <Col lg={8}><SignThings /></Col>
            </Row>
        </Container>
    );
};

ReactDOM.render(<Main />, document.getElementById('app'));