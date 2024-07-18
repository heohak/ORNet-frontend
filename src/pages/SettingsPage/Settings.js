import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const navigate = useNavigate();

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Settings</h1>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/view-bait-workers')}
                        className="w-50"
                    >
                        View Bait Workers
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/locations')}
                        className="w-50"
                    >
                        View Locations
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/device-classificators')}
                        className="w-50"
                    >
                        View Device Classificators
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/ticket-status-classificators')}
                        className="w-50"
                    >
                        View Ticket Status Classificators
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Settings;
