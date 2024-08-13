import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewLinkedDevices() {
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [productCode, setProductCode] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLinkedDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/linked/device/all`);
                setLinkedDevices(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLinkedDevices();
    }, []);

    const handleAddLinkedDevice = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/linked/device/add`, {
                name,
                manufacturer,
                productCode,
                serialNumber,
            });
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(response.data);
            setShowAddModal(false);
            setName('');
            setManufacturer('');
            setProductCode('');
            setSerialNumber('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (linkedDevice) => {
        navigate(`/settings/linked-devices/edit/${linkedDevice.id}`, { state: { linkedDevice } });
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Linked Devices</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Linked Device</Button>
            </div>
            <Row>
                {linkedDevices.map((linkedDevice) => (
                    <Col md={4} key={linkedDevice.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{linkedDevice.name}</Card.Title>
                                <Card.Text>
                                    <strong>Manufacturer:</strong> {linkedDevice.manufacturer}<br />
                                    <strong>Product Code:</strong> {linkedDevice.productCode}<br />
                                    <strong>Serial Number:</strong> {linkedDevice.serialNumber}
                                </Card.Text>
                                <Button variant="secondary" onClick={() => handleEdit(linkedDevice)}>Edit</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Linked Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formManufacturer">
                            <Form.Label>Manufacturer</Form.Label>
                            <Form.Control
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                placeholder="Enter manufacturer"
                            />
                        </Form.Group>
                        <Form.Group controlId="formProductCode">
                            <Form.Label>Product Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="Enter product code"
                            />
                        </Form.Group>
                        <Form.Group controlId="formSerialNumber">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                placeholder="Enter serial number"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddLinkedDevice}>Add Linked Device</Button>
                </Modal.Footer>
            </Modal>
            <Button onClick={() => navigate('/settings')}>Back</Button>
        </Container>
    );
}

export default ViewLinkedDevices;
