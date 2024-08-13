import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const navigate = useNavigate();

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Settings</h1>
            <p style={{ color: 'red', fontWeight: 'bold' }}>
                Note: If you encounter a 500 error when trying to remove an object, it means that the object is linked to something else. This issue will be resolved as soon as possible.
            </p>
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
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/third-party-its')}
                        className="w-50"
                    >
                        View Third Party ITs
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/linked-devices')}
                        className="w-50"
                    >
                        View Linked Devices
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/client-worker-roles')}
                        className="w-50"
                    >
                        View Client Worker Roles
                    </Button>
                </Col>
            </Row>
            {/*
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/client-workers')}
                        className="w-50"
                    >
                        View Client Workers
                    </Button>
                </Col>
            </Row>
            */}
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/software')}
                        className="w-50"
                    >
                        View Software
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/files')}
                        className="w-50"
                    >
                        Upload Files
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/work-types')}
                        className="w-50"
                    >
                        View Work Types
                    </Button>
                </Col>
            </Row>

        </Container>
    );
}

export default Settings;
