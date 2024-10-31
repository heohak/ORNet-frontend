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


    const handleNavigate = () => {
        if (client && client.id) {
            navigate('/history', { state: { endpoint: `client/history/${client.id}` } });
        } else {
            setError('Client or client id is undefined');
        }
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
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body className="pt-4 pb-4 px-4">
                        <Row className="text-center mb-4">
                            <Col>
                                <Card.Text style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#343a40' }}>
                                    {client.fullName}/{client.shortName}
                                </Card.Text>
                            </Col>
                        </Row>


                        <Row className="gy-2 gx-2 px-2">
                            {renderField('pathologyClient', client.pathologyClient)}
                            {renderField('surgeryClient', client.surgeryClient)}
                            {renderField('editorClient', client.editorClient)}
                            {renderField('otherMedicalDevices', client.otherMedicalDevices)}
                            {renderField('lastMaintenance', client.lastMaintenance)}
                            {renderField('nextMaintenance', client.nextMaintenance)}
                        </Row>

                        <Row className="mt-4 d-flex justify-content-end">
                            <Col xs="auto">
                                <Button variant="link" onClick={() => setShowClientFieldModal(true)} className="text-primary me-2">
                                    <FontAwesomeIcon icon={faCog} />
                                </Button>
                                <Button variant="link" onClick={() => navigate(`/client/edit/${client.id}`)} className="text-primary me-2">
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button variant="link" onClick={handleNavigate} className="text-primary">
                                    <FontAwesomeIcon icon={faHistory} />
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
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
