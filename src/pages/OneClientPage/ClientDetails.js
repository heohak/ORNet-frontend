import React, { useEffect, useState } from 'react';
import {Card, Button, Modal, Form, Alert, Row, Col, Container} from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

// Define specific fields to display
const specificFields = [
    'fullName', 'shortName', 'pathologyClient', 'surgeryClient', 'editorClient', 'otherMedicalInformation', 'lastMaintenance', 'nextMaintenance'
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
        return specificFields.map(key => {
            if (data[key] !== null && visibleDeviceFields[key]) {
                let displayValue = data[key];
                if (typeof data[key] === 'boolean') {
                    displayValue = data[key] ? 'Yes' : 'No';
                }
                return (
                    <Card.Text key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: </strong> {displayValue}
                    </Card.Text>
                );
            }
            return null;
        });
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
                    <Card.Body>
                        <Row>
                            <Col>
                                {renderFields(client)}
                            </Col>
                            <Col className='col-md-auto'>
                                <Row>
                                    <Col className='col-md-auto'>
                                        <Button variant="link" onClick={() => setShowClientFieldModal(true)}>
                                            <FontAwesomeIcon icon={faCog} />
                                        </Button>
                                    </Col>
                                    <Col className="col-md-auto">
                                        <Row>
                                            <Button variant="primary" onClick={() => navigate(`/client/edit/${client.id}`)}>
                                                Edit Customer
                                            </Button>
                                        </Row>
                                        <Row>
                                            <Button onClick={handleNavigate} className='mt-2'>See History</Button>
                                        </Row>
                                    </Col>
                                </Row>
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
                        {specificFields.map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleDeviceFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
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
