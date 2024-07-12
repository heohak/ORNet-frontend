import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import config from "../config/config";

function OneDevice() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [maintenanceInfo, setMaintenanceInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [showMaintenanceFieldModal, setShowMaintenanceFieldModal] = useState(false);
    const [showLinkedDeviceFieldModal, setShowLinkedDeviceFieldModal] = useState(false);
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState("");
    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [maintenanceComment, setMaintenanceComment] = useState("");
    const [visibleDeviceFields, setVisibleDeviceFields] = useState({});
    const [visibleMaintenanceFields, setVisibleMaintenanceFields] = useState({});
    const [visibleLinkedDeviceFields, setVisibleLinkedDeviceFields] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/${deviceId}`);
                setDevice(response.data);
                initializeVisibleFields(response.data, setVisibleDeviceFields, 'device');
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchLinkedDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
                setLinkedDevices(response.data);
                if (response.data.length > 0) {
                    initializeVisibleFields(response.data[0], setVisibleLinkedDeviceFields, 'linkedDevice');
                }
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchAvailableLinkedDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/linked/device/all`);
                setAvailableLinkedDevices(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchMaintenanceInfo = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`);
                setMaintenanceInfo(response.data);
                if (response.data.length > 0) {
                    initializeVisibleFields(response.data[0], setVisibleMaintenanceFields, 'maintenance');
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDevice();
        fetchLinkedDevices();
        fetchAvailableLinkedDevices();
        fetchMaintenanceInfo();
    }, [deviceId]);

    const initializeVisibleFields = (data, setVisibleFields, keyPrefix) => {
        const savedVisibilityState = localStorage.getItem(`${keyPrefix}VisibilityState`);
        if (savedVisibilityState) {
            setVisibleFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = Object.keys(data).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (field, setVisibleFields, keyPrefix) => {
        setVisibleFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem(`${keyPrefix}VisibilityState`, JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const handleLinkDevice = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`);
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(response.data);
            setShowModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddMaintenance = async () => {
        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment: maintenanceComment,
            });
            const maintenanceId = maintenanceResponse.data.token;

            await axios.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`);
            const response = await axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`);
            setMaintenanceInfo(response.data);
            setShowMaintenanceModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const renderFields = (data, visibleFields) => {
        return Object.keys(data).map(key => {
            if (data[key] !== null && visibleFields[key]) {
                return (
                    <Card.Text key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {data[key]}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
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
        <Container className="mt-5">
            <h1 className="mb-4">Device Details
                <Button variant="link" className="float-end" onClick={() => setShowDeviceFieldModal(true)}>Edit Fields</Button></h1>
            {device ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{device.deviceName}</Card.Title>
                        {renderFields(device, visibleDeviceFields)}
                        <Button onClick={() => navigate(-1)}>Back</Button>

                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}

            <h2 className="mb-4">Maintenance Information</h2>
            <Button variant="primary" onClick={() => setShowMaintenanceModal(true)} className="mb-3">Add Maintenance</Button>
            <Button variant="link" className="float-end mb-3" onClick={() => setShowMaintenanceFieldModal(true)}>Edit Fields</Button>
            {maintenanceInfo.length > 0 ? (
                maintenanceInfo.map((maintenance, index) => (
                    <Card key={index} className="mb-4">
                        <Card.Body>
                            <Card.Title>Maintenance Details</Card.Title>
                            {renderFields(maintenance, visibleMaintenanceFields)}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <Alert variant="info">No maintenance information available.</Alert>
            )}

            <h2 className="mb-4">Linked Devices</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>Link Device</Button>
            <Button variant="link" className="float-end mb-3" onClick={() => setShowLinkedDeviceFieldModal(true)}>Edit Fields</Button>
            {linkedDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{linkedDevice.name}</Card.Title>
                                    {renderFields(linkedDevice, visibleLinkedDeviceFields)}
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No linked devices available.</Alert>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectDevice">
                        <Form.Label>Select Device to Link</Form.Label>
                        <Form.Control as="select" value={selectedLinkedDeviceId} onChange={(e) => setSelectedLinkedDeviceId(e.target.value)}>
                            <option value="">Select a device...</option>
                            {availableLinkedDevices.map((linkedDevice) => (
                                <option key={linkedDevice.id} value={linkedDevice.id}>
                                    {linkedDevice.name} (Serial: {linkedDevice.serialNumber})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleLinkDevice}>Link Device</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="maintenanceName">
                        <Form.Label>Maintenance Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={maintenanceName}
                            onChange={(e) => setMaintenanceName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceDate">
                        <Form.Label>Maintenance Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceComment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={maintenanceComment}
                            onChange={(e) => setMaintenanceComment(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddMaintenance}>Add Maintenance</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeviceFieldModal} onHide={() => setShowDeviceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {device && Object.keys(device).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleDeviceFields[key]}
                                onChange={() => handleFieldToggle(key, setVisibleDeviceFields, 'device')}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeviceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMaintenanceFieldModal} onHide={() => setShowMaintenanceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Maintenance Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {maintenanceInfo[0] && Object.keys(maintenanceInfo[0]).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleMaintenanceFields[key]}
                                onChange={() => handleFieldToggle(key, setVisibleMaintenanceFields, 'maintenance')}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showLinkedDeviceFieldModal} onHide={() => setShowLinkedDeviceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Linked Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {linkedDevices[0] && Object.keys(linkedDevices[0]).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleLinkedDeviceFields[key]}
                                onChange={() => handleFieldToggle(key, setVisibleLinkedDeviceFields, 'linkedDevice')}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLinkedDeviceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default OneDevice;
