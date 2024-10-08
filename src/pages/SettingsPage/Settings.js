import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../css/SettingsPage/Settings.css';

function Settings() {
    const navigate = useNavigate();

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Settings</h1>
            <Row className="mb-3">
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/view-bait-workers')}
                        className="settings-button"
                    >
                        Bait Workers
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/locations')}
                        className="settings-button"
                    >
                        Locations
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/device-classificators')}
                        className="settings-button"
                    >
                        Device Classificators
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/ticket-status-classificators')}
                        className="settings-button"
                    >
                        Ticket Status Classificators
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/third-party-its')}
                        className="settings-button"
                    >
                        Third Party ITs
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/linked-devices')}
                        className="settings-button"
                    >
                        Linked Devices
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/client-worker-roles')}
                        className="settings-button"
                    >
                        Customer Worker Roles
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/software')}
                        className="settings-button"
                    >
                        Softwares
                    </Button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/files')}
                        className="settings-button"
                    >
                        Upload Files
                    </Button>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/settings/work-types')}
                        className="settings-button"
                    >
                        Work Types
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Settings;
