import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCheck, faEdit, faHistory } from '@fortawesome/free-solid-svg-icons';

// Define the default visibility of each field
const defaultVisibility = {
    pathologyClient: true,
    surgeryClient: true,
    editorClient: true,
    otherMedicalDevices: true,
    lastMaintenance: true,
    nextMaintenance: true,
};

function ClientDetails({ client, navigate }) {
    const [showClientFieldModal, setShowClientFieldModal] = useState(false);
    const [fieldVisibility, setFieldVisibility] = useState(defaultVisibility);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedVisibilityState = localStorage.getItem('deviceVisibilityState');
        if (savedVisibilityState) {
            setFieldVisibility(JSON.parse(savedVisibilityState));
        }
    }, []);

    const handleFieldToggle = (field) => {
        setFieldVisibility((prevVisibility) => {
            const updatedVisibility = {
                ...prevVisibility,
                [field]: !prevVisibility[field],
            };
            localStorage.setItem('deviceVisibilityState', JSON.stringify(updatedVisibility));
            return updatedVisibility;
        });
    };

    const renderField = (label, value) => (
        fieldVisibility[label] && value !== false && (
            <Col xs={12} md={6} className="mb-1">
                <Card.Text className="d-flex justify-content-between align-items-center text-secondary" style={{ marginBottom: '0.2rem' }}>
                <span className="fw-semibold" style={{ marginRight: '0.5rem' }}>
                    {label.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                </span>
                    <span>
                    {typeof value === 'boolean' ? (value ? <FontAwesomeIcon icon={faCheck} /> : null) : value}
                </span>
                </Card.Text>
            </Col>
        )
    );

    // Estonia date formatter
    const estoniaDateFormat = new Intl.DateTimeFormat('et-EE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });


    const handleNavigate = () => {
        if (client && client.id) {
            navigate('/history', { state: { endpoint: `client/history/${client.id}` } });
        } else {
            setError('Client or client id is undefined');
        }
    };

    const renderTypes = () => {
        const types = [
            client.pathologyClient && "Pathology",
            client.editorClient && "Editor",
            client.surgeryClient && "Surgery",
            client.otherMedicalDevices && "Other Medical Devices"
        ].filter(Boolean); // Filter out any false or undefined values

        return types.join(", ");
    };

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <>
            {client ? (
                <>
                    <Row className="justify-content-between mb-2">
                        <Col className="col-md-auto">
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#343a40' }}>
                                {client.fullName}/{client.shortName}
                            </div>
                        </Col>
                        <Col className="col-md-auto">
                            <Button variant="link" onClick={() => setShowClientFieldModal(true)} className="text-primary me-2">
                                <FontAwesomeIcon icon={faCog}
                                                title="Edit visible fields"/>
                            </Button>
                            <Button variant="link" onClick={() => navigate(`/client/edit/${client.id}`)} className="text-primary me-2">
                                <FontAwesomeIcon icon={faEdit}
                                                 title="Edit Customer"/>
                            </Button>
                            <Button variant="link" onClick={handleNavigate} className="text-primary">
                                <FontAwesomeIcon icon={faHistory}
                                                 title="View history"/>
                            </Button>
                        </Col>
                    </Row>
                    <Row className="justify-content-between mb-3">
                        <Col className="col-md-auto">
                            <Row>
                                <Col className="col-md-auto">
                                    <div className="maintenance-box">
                                        <div className="maintenance-text">Maintenance</div>
                                    </div>
                                </Col>
                                <Col className="col-md-auto">
                                    <Row className="maintenance-date-box">
                                        <Col className="col-md-auto">
                                            <div>
                                                <div className="maintenance-text">Next: {client.nextMaintenance ? estoniaDateFormat.format(new Date(client.nextMaintenance)) : 'N/A'}</div>
                                            </div>
                                        </Col>
                                        <Col className="col-md-auto">
                                            <div>
                                                <div className="maintenance-text">Last: {client.lastMaintenance ? estoniaDateFormat.format(new Date(client.lastMaintenance)) : 'N/A'}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col className="col-md-auto align-content-center">
                            <div className="maintenance-text">{renderTypes()}</div>
                        </Col>
                    </Row>
                </>

            ) : (
                <Alert variant="info">No client details available.</Alert>
            )}

            <Modal show={showClientFieldModal} onHide={() => setShowClientFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Fields for {client?.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            {Object.keys(defaultVisibility).map((key) => (
                                <Col xs={6} key={key} className="mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        label={key.replace(/([A-Z])/g, ' $1')}
                                        checked={fieldVisibility[key]}
                                        onChange={() => handleFieldToggle(key)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClientFieldModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientDetails;
