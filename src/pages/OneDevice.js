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
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState("");
    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [maintenanceComment, setMaintenanceComment] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/${deviceId}`);
                setDevice(response.data);
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
                setMaintenanceInfo(response.data); // Set the array of maintenance records
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDevice();
        fetchLinkedDevices();
        fetchAvailableLinkedDevices();
        fetchMaintenanceInfo();
    }, [deviceId]);

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
            console.log('Maintenance response:', maintenanceResponse.data);

            const maintenanceId = maintenanceResponse.data.token;

            await axios.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`);
            const response = await axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`);
            setMaintenanceInfo(response.data);
            setShowMaintenanceModal(false);
        } catch (error) {
            setError(error.message);
        }
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
            <h1 className="mb-4">Device Details</h1>
            {device ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{device.deviceName}</Card.Title>
                        <Card.Text>
                            <strong>Device name:</strong> {device.deviceName}<br />
                            <strong>Department:</strong> {device.department}<br />
                            <strong>Room:</strong> {device.room}<br />
                            <strong>Serial number:</strong> {device.serialNumber}<br />
                            <strong>License Number:</strong> {device.licenseNumber}<br />
                            <strong>Version:</strong> {device.version}<br />
                            <strong>Version Update Date:</strong> {device.versionUpdateDate}<br />
                            <strong>First IP Address:</strong> {device.firstIPAddress}<br />
                            <strong>Second IP Address:</strong> {device.secondIPAddress}<br />
                            <strong>Software Key:</strong> {device.softwareKey}<br />
                            <strong>Introduced Date:</strong> {device.introducedDate}<br />
                            <strong>Written Off Date:</strong> {device.writtenOffDate}<br />
                            <strong>Comment:</strong> {device.comment}<br />
                        </Card.Text>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}

            <h2 className="mb-4">Maintenance Information</h2>
            <Button variant="primary" onClick={() => setShowMaintenanceModal(true)}>Add Maintenance</Button>
            {maintenanceInfo.length > 0 ? (
                maintenanceInfo.map((maintenance, index) => (
                    <Card key={index} className="mb-4">
                        <Card.Body>
                            <Card.Title>Maintenance Details</Card.Title>
                            <Card.Text>
                                <strong>Maintenance Name:</strong> {maintenance.maintenanceName}<br />
                                <strong>Maintenance Date:</strong> {maintenance.maintenanceDate}<br />
                                <strong>Comment:</strong> {maintenance.comment}<br />
                                <strong>Files:</strong> {maintenance.comments}<br />
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <Alert variant="info">No maintenance information available.</Alert>
            )}

            <h2 className="mb-4">Linked Devices</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>Link Device</Button>
            {linkedDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{linkedDevice.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Manufacturer:</strong> {linkedDevice.manufacturer}<br />
                                        <strong>Product Code:</strong> {linkedDevice.productCode}<br />
                                        <strong>Serial Number:</strong> {linkedDevice.serialNumber}<br />
                                        <strong>Comment:</strong> {linkedDevice.comment}
                                    </Card.Text>
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
        </Container>
    );
}

export default OneDevice;
