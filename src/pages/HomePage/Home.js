import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const HomePage = () => {
    return (
        <Container fluid className="mt-5">
            <Row className="mb-4">
                <Col className="text-center">
                    <h1>Welcome!</h1>
                    <p>Please select from the options below what you want to manage</p>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Customers</Card.Title>
                            <Button variant="primary" href="/customers">Customers</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Devices</Card.Title>
                            <Button variant="primary" href="/devices">Devices</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Tickets</Card.Title>
                            <Button variant="primary" href="/tickets">Tickets</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;
