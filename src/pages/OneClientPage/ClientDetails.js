import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCheck, faEdit, faHistory } from '@fortawesome/free-solid-svg-icons';

// Define specific fields to display
const specificFields = [
    'pathologyClient',
    'surgeryClient',
    'editorClient',
    'otherMedicalDevices',
    'lastMaintenance',
    'nextMaintenance',
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
        setVisibleDeviceFields((prevVisibleFields) => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field],
            };
            localStorage.setItem('deviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        const visibleFields = specificFields.filter(
            (key) =>
                visibleDeviceFields[key] &&
                data[key] !== undefined &&
                data[key] !== null &&
                (typeof data[key] !== 'boolean' || data[key])
        );

        // Separate maintenance fields from others
        const maintenanceFields = ['lastMaintenance', 'nextMaintenance'].filter(key => visibleFields.includes(key));
        const otherFields = visibleFields.filter(key => !maintenanceFields.includes(key));

        // Group other fields into pairs for two-column layout
        const fieldPairs = [];
        for (let i = 0; i < otherFields.length; i += 2) {
            fieldPairs.push([otherFields[i], otherFields[i + 1]]);
        }

        return (
            <div>
                {/* Centered FullName/ShortName */}
                <Card.Text
                    style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                    className="text-center mb-3"
                >
                    {data.fullName}/{data.shortName}
                </Card.Text>

                {/* Render other fields in two columns */}
                {fieldPairs.map((pair, index) => (
                    <Row key={index} className="justify-content-center">
                        {pair.map(
                            (key, idx) =>
                                key && (
                                    <Col xs={12} md={6} key={idx}>
                                        <Card.Text className="mb-1 text-start">
                                            <strong>
                                                {key
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/^./, (str) => str.toUpperCase())}:
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
                                )
                        )}
                    </Row>
                ))}

                {/* Maintenance Fields Row at the End */}
                {maintenanceFields.length > 0 && (
                    <Row className="justify-content-center mt-3">
                        {maintenanceFields.map((key, idx) => (
                            <Col xs={12} md={6} key={idx}>
                                <Card.Text className="mb-1 text-start" style={{ whiteSpace: 'nowrap' }}>
                                    <strong>
                                        {key
                                            .replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, (str) => str.toUpperCase())}:
                                    </strong>
                                    <span className="ms-2">
                                    {data[key]}
                                </span>
                                </Card.Text>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        );
    };



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
                <Card className="mb-4">
                    <Card.Body className="pt-4 pb-4">
                        <Row className="align-items-start">
                            {/* Empty Column for Alignment */}
                            <Col xs={1} md={1}></Col>

                            {/* Centered Content */}
                            <Col xs={10} md={10} className="d-flex flex-column align-items-center">
                                {renderFields(client)}
                            </Col>

                            {/* Buttons on the Right */}
                            <Col xs={1} md={1} className="d-flex flex-row justify-content-end">
                                {/* Settings Icon */}
                                <Button
                                    variant="link"
                                    onClick={() => setShowClientFieldModal(true)}
                                    className="me-2"
                                >
                                    <FontAwesomeIcon icon={faCog} />
                                </Button>
                                {/* Edit Icon */}
                                <Button
                                    variant="link"
                                    onClick={() => navigate(`/client/edit/${client.id}`)}
                                    className="me-2"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                {/* History Icon */}
                                <Button variant="link" onClick={handleNavigate}>
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
                    <Modal.Title>Edit Visible Fields for {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            {specificFields.map((key) => (
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
                    <Button variant="secondary" onClick={() => setShowClientFieldModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientDetails;
