import React, { useState, useEffect } from 'react';
import {Card, ListGroup, Alert, Button, Modal, Form, Spinner, Badge, Col, Row} from 'react-bootstrap';
import AddClientDevice from './AddClientDevice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config/config"; // Import axios for making HTTP requests

function ClientDevices({ devices, client, clientId, setRefresh, locations }) {
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [classificators, setClassificators] = useState([]);
    const [selectedClassificatorId, setSelectedClassificatorId] = useState('');
    const [writtenOff, setWrittenOff] = useState(false);
    const [filteredDevices, setFilteredDevices] = useState(devices);
    const [searchQuery, setSearchQuery] = useState('');
    const [deviceSummary, setDeviceSummary] = useState({});
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [errorSummary, setErrorSummary] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassificators();
        fetchDeviceSummary();
    }, []);

    useEffect(() => {
        filterDevices();
    }, [selectedClassificatorId, searchQuery, writtenOff]);

    const fetchClassificators = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
            setClassificators(response.data);
        } catch (error) {
            console.error('Error fetching classificators:', error);
        }
    };

    const fetchDeviceSummary = async () => {
        setLoadingSummary(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/client/summary/${clientId}`);
            setDeviceSummary(response.data);
        } catch (error) {
            setErrorSummary(error.message);
        } finally {
            setLoadingSummary(false);
        }
    };

    const filterDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    q: searchQuery,
                    classificatorId: selectedClassificatorId || null,
                    clientId: clientId,
                    writtenOff: writtenOff
                }
            });
            setFilteredDevices(response.data);
        } catch (error) {
            console.error('Error filtering devices:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
            <h2 className="mb-4">
                {'Devices'}
            </h2>
            <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>Add Device</Button>

            <Form.Group controlId="search" className="mt-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </Form.Group>
            <Form.Group controlId="classificatorFilter" className="mt-3">
                <Form.Label>Filter by Classificator</Form.Label>
                <Form.Control as="select" value={selectedClassificatorId} onChange={(e) => setSelectedClassificatorId(e.target.value)}>
                    <option value="">All Classificators</option>
                    {classificators.map((classificator) => (
                        <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="written-off-filter" className="mt-3">
                <Form.Check
                    type="switch"
                    id="written-off-switch"
                    label="Written-off"
                    checked={writtenOff}
                    onChange={(e) => setWrittenOff(e.target.checked)}
                    className="mb-4"
                />
            </Form.Group>



            {filteredDevices.length > 0 ? (
                <Row className="mt-3">
                    {filteredDevices.map((device, index) => (
                        <Col md={4} key={device.id} className="mb-4"> {/* Adjust column size as needed */}
                            <Card className="h-100 position-relative all-page-card">
                                <Card.Body className="all-page-cardBody">
                                    <Card.Title
                                        className='all-page-cardTitle'
                                        style={{cursor: "pointer"}}
                                        onClick={() => navigate(`/device/${device.id}`)}
                                    >
                                        {index + 1}. {device.deviceName}
                                        {device.writtenOffDate && (
                                            <Badge bg="danger" className="ms-2">Written Off</Badge> // Written-off indicator
                                        )}
                                    </Card.Title>
                                    <Card.Text className="all-page-cardText">
                                        <strong>Location:</strong> {locations[device.locationId] || 'Unknown'}<br />
                                        <strong>Room:</strong> {device.room ? device.room : 'N/A'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert className="mt-3" variant="info">No devices available.</Alert>
            )}

            <h3 className="mt-4">Device Summary</h3>
            {loadingSummary ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : errorSummary ? (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{errorSummary}</p>
                </Alert>
            ) : (
                <ListGroup className="mt-3">
                    {Object.keys(deviceSummary).map(key => (
                        <ListGroup.Item key={key}>
                            {key}: {deviceSummary[key]}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            <Modal show={showAddDeviceModal} onHide={() => setShowAddDeviceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Device to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddClientDevice clientId={clientId} onClose={() => setShowAddDeviceModal(false)} setRefresh={setRefresh} /> {/* Pass clientId and setRefresh as props */}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientDevices;
