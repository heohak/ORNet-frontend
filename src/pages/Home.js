import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const HomePage = () => {
    return (
        <Container fluid className="mt-5">
            <Row className="mb-4">
                <Col className="text-center">
                    <h1>Tere tulemast!</h1>
                    <p>Valige allpool olevate valikute hulgast, mida soovite hallata.</p>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Kliendid</Card.Title>
                            <Button variant="primary" href="/clients">Kliendid</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Seadmed</Card.Title>
                            <Button variant="primary" href="/devices">Seadmed</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Piletid</Card.Title>
                            <Button variant="primary" href="/tickets">Piletid</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;
