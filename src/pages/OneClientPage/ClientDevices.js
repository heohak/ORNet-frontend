import React, {useEffect, useState} from 'react';
import {Alert, Badge, Button, Card, Col, Form, ListGroup, Modal, Row, Spinner} from 'react-bootstrap';
import AddClientDevice from './AddClientDevice';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import config from "../../config/config"; // Import axios for making HTTP requests

function ClientDevices({devices, client, clientId, setRefresh, locations}) {
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [classificatorList, setClassificatorList] = useState([]);
    const [classificators, setClassificators] = useState({});
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
            setClassificatorList(response.data);
            const classificatorMap = response.data.reduce((acc, classificator) => {
                acc[classificator.id] = classificator.name;
                return acc;
            }, {});

            setClassificators(classificatorMap);
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
            <Row className="d-flex justify-content-between align-items-center">
                <Col>
                    <h2 className="mb-2">
                        {'Devices'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>Add Device</Button>
                </Col>
            </Row>
        <Form className="mb-e">
            <Row className="align-items-end">
                <Col md={3}>
            <Form.Group controlId="search" className="mt-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </Form.Group>
                </Col>
                <Col md={3}>
            <Form.Group controlId="classificatorFilter" className="mt-3">
                <Form.Label>Filter by Classificator</Form.Label>
                <Form.Control as="select" value={selectedClassificatorId}
                              onChange={(e) => setSelectedClassificatorId(e.target.value)}>
                    <option value="">All Classificators</option>
                    {classificatorList.map((classificator) => (
                        <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>
                </Col>
                <Col md={4}>


            <Form.Group controlId="written-off-filter" className="mt-3">
                <Form.Check
                    type="switch"
                    id="written-off-switch"
                    label="Written-off"
                    checked={writtenOff}
                    onChange={(e) => setWrittenOff(e.target.checked)}
                    className="mb-2"
                />
            </Form.Group>
                </Col>
            </Row>
        </Form>
            <Row className="font-weight-bold text-center mt-2">
                <Col md={3}>
                    Name
                </Col>
                <Col md={2}>
                    Type
                </Col>
                <Col md={3}>
                    Location
                </Col>
                <Col md={4}>
                    Serial Number
                </Col>
            </Row>
            <hr />
            {filteredDevices.length > 0 ? (
                    filteredDevices.map((device, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={device.id}
                                className="align-items-center text-center mb-2"
                                style={{backgroundColor: rowBgColor, cursor: 'pointer'}}
                                onClick={() => navigate(`/device/${device.id}`)}
                            >
                                <Col md={3}>{device.deviceName}</Col>
                                <Col md={2}>{classificators[device.classificatorId] || 'Unknown Type'}</Col>
                                <Col md={3}>{locations[device.locationId] || 'Unknown'}</Col>
                                <Col md={4}>{device.serialNumber}</Col>
                            </Row>
                        );
                    })
            ) : (
                <Alert className="mt-3" variant="info">No devices available.</Alert>
            )}

            <h3 className="mt-2">Device Summary</h3>
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
                    <AddClientDevice clientId={clientId} onClose={() => setShowAddDeviceModal(false)}
                                     setRefresh={setRefresh}/> {/* Pass clientId and setRefresh as props */}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientDevices;
