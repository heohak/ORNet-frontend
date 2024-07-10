import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import config from "../config/config";

function OneDevice() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState("");
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

        fetchDevice();
        fetchLinkedDevices();
        fetchAvailableLinkedDevices();
    }, [deviceId]);

    const handleLinkDevice = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`);
            // Fetch updated linked devices
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(response.data);
            setShowModal(false);
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
                            <strong>Serial Number:</strong> {device.serialNumber}<br />
                            <strong>Description:</strong> {device.description}
                        </Card.Text>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
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
        </Container>
    );
}

export default OneDevice;
