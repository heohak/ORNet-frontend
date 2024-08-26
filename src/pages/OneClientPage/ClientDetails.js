import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, Accordion, Row, Col } from 'react-bootstrap';
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
    const [clientLocations, setClientLocations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (client) {
            initializeVisibleFields(client);
            fetchClientLocations(client.id);
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

    const fetchClientLocations = async (clientId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
            setClientLocations(response.data);
        } catch (error) {
            setError('Error fetching client locations');
            console.error('Error fetching client locations:', error);
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
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {displayValue}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    return (
        <>
            <div className="mb-4" style={{display: "flex", justifyContent: "space-between"}}>
                <Button style={{width: '9%'}} className='mt-2 mb-2' onClick={() => navigate(-1)}>Back</Button>
                <h1>{client ? `${client.shortName} Details` : 'Client Details'}</h1>
                <Button style={{width: '9%'}} className='mt-2 mb-2'>See History</Button>
            </div>
            {client ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col>
                                {renderFields(client)}
                            </Col>
                            <Col className='col-md-auto'>
                                <Button variant="primary" onClick={() => navigate(`/client/edit/${client.id}`)}>
                                    Edit Client
                                </Button>
                                <Button variant="link" className="float-end" onClick={() => setShowClientFieldModal(true)}>
                                    <FontAwesomeIcon icon={faCog} />
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                    <Accordion className="m-3">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Locations</Accordion.Header>
                            <Accordion.Body>
                                {clientLocations.length > 0 ? (
                                    clientLocations.map(location => (
                                        <Card key={location.id} className="mb-2">
                                            <Card.Body>
                                                <Card.Title>{location.name}</Card.Title>
                                                <Card.Text>
                                                    <strong>Address: </strong>{location.address}<br />
                                                    <strong>Phone: </strong>{location.phone}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    ))
                                ) : (
                                    <Alert variant="info">No locations available.</Alert>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
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
