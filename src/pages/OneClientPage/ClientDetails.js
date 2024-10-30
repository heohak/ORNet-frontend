import React, { useEffect, useState } from 'react';
import {Card, Button, Modal, Form, Alert, Row, Col, Container} from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

// Define specific fields to display
const specificFields = [
    'pathologyClient', 'surgeryClient', 'editorClient', 'otherMedicalDevices', 'lastMaintenance', 'nextMaintenance'
];

function ClientDetails({ client, navigate }) {
    const [showClientFieldModal, setShowClientFieldModal] = useState(false);
    const [visibleDeviceFields, setVisibleDeviceFields] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (client) {
            initializeVisibleFields(client);
        }
    }, [client]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('deviceVisibilityState');
        if (savedVisibilityState) {
            setVisibleDeviceFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = specificFields.reduce((acc, key) => {
                if (key in data) {
                    acc[key] = true;
                }
                return acc;
            }, {});
            setVisibleDeviceFields(initialVisibleFields);
        }
    };



    const handleFieldToggle = (field) => {
        setVisibleDeviceFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem('deviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        const visibleFields = specificFields.filter(
            key => visibleDeviceFields[key] && data[key] !== undefined && data[key] !== null && (typeof data[key] !== 'boolean' || data[key])
        );

        return (
            <Row className="mb-3">
                {/* Display FullName/ShortName at the top, in a larger font */}
                {(visibleDeviceFields.fullName || visibleDeviceFields.shortName) && (
                    <Col xs={12} className="mb-3">
                        <Card.Text style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {data.fullName}/{data.shortName}
                        </Card.Text>
                    </Col>
                )}

                {/* Render each field in a responsive column, filling available space without gaps */}
                {visibleFields.map((key, index) => (
                    <Col md={6} key={index} className="mb-2">
                        <Card.Text>
                            <strong>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </strong>
                            <span className="ms-2">
                            {typeof data[key] === 'boolean' ? (
                                data[key] ? <FontAwesomeIcon icon={faCheck} /> : null
                            ) : (
                                data[key]
                            )}
                        </span>
                        </Card.Text>
                    </Col>
                ))}
            </Row>
        );
    };

    const handleNavigate = () => {
        if (client && client.id) {
            navigate('/history', { state: { endpoint: `client/history/${client.id}` } })
        } else {
            setError("Client or client id is undefined")
        }
    }

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
                <Card className="mb-4">
                    <Card.Body className="pt-2 pb-2">
                        <Row>
                            <Col md={10}>
                                {renderFields(client)}
                            </Col>
                            <Col md={2} className="d-flex justify-content-end align-items-start text-end">
                                <Button variant="link" onClick={() => setShowClientFieldModal(true)} className="me-2">
                                    <FontAwesomeIcon icon={faCog} />
                                </Button>
                                <Button variant="primary" onClick={() => navigate(`/client/edit/${client.id}`)} className="me-2">
                                    Edit Customer
                                </Button>
                                <Button variant="secondary" onClick={handleNavigate}>
                                    See History
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
                    <Modal.Title>Edit Visible Fields for {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            {specificFields.map(key => (
                                <Col xs={6} key={key}>
                                    <Form.Check
                                        type="checkbox"
                                        label={key.replace(/([A-Z])/g, ' $1')}
                                        checked={visibleDeviceFields[key]}
                                        onChange={() => handleFieldToggle(key)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClientFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientDetails;
