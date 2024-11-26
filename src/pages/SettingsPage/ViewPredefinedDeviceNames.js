import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function ViewPredefinedDeviceNames() {
    const [deviceNames, setDeviceNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeviceNames();
    }, []);

    const fetchDeviceNames = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/predefined/names`);
            setDeviceNames(response.data);
        } catch (error) {
            setError('Error fetching predefined device names');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDeviceName = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/predefined/add`, null, {
                params: {
                    deviceName: newDeviceName,
                },
            });
            setShowAddModal(false);
            setNewDeviceName('');
            fetchDeviceNames(); // Refresh the list
        } catch (error) {
            setError('Error adding predefined device name');
        }
    };

    const handleDeleteDeviceName = async (nameId) => {
        try {
            await axios.delete(`${config.API_BASE_URL}/predefined/delete/${nameId}`);
            fetchDeviceNames(); // Refresh the list
        } catch (error) {
            setError('Error deleting predefined device name');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col className="col-md-auto">
                    <h1>Predefined Device Names</h1>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Device Name
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Row>
                    {deviceNames.map((deviceName) => (
                        <Col md={3} key={deviceName.id} className="mb-4">
                            <Card>
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>{deviceName.name}</div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteDeviceName(deviceName.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Add Device Name Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Predefined Device Name</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddDeviceName}>
                    <Modal.Body>
                        <Form.Group controlId="formDeviceName">
                            <Form.Label>Device Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newDeviceName}
                                onChange={(e) => setNewDeviceName(e.target.value)}
                                placeholder="Enter device name"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Device Name
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Button onClick={() => navigate('/settings')}>Back</Button>
        </Container>
    );
}

export default ViewPredefinedDeviceNames;
