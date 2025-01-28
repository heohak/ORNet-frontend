import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
} from 'react-bootstrap';
import config from '../../config/config';
import {FaArrowLeft, FaTrash} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

function ViewPredefinedDeviceNames() {
    const [deviceNames, setDeviceNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');

    // State for Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDeviceName, setSelectedDeviceName] = useState(null);

    useEffect(() => {
        fetchDeviceNames();
    }, []);

    const fetchDeviceNames = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/predefined/names`);
            setDeviceNames(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching predefined device names');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDeviceName = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`${config.API_BASE_URL}/predefined/add`, null, {
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

    // Function to handle delete confirmation
    const handleShowDeleteModal = (deviceName) => {
        setSelectedDeviceName(deviceName);
        setShowDeleteModal(true);
    };

    // Function to delete the device name
    const handleDeleteDeviceName = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/predefined/delete/${selectedDeviceName.id}`);
            fetchDeviceNames(); // Refresh the list
            setShowDeleteModal(false);
            setSelectedDeviceName(null);
        } catch (error) {
            setError('Error deleting predefined device name');
        }
    };

    return (
        <Container className="mt-4">
            <Button
                variant="link"
                onClick={() => window.history.back()}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }} // Adjust styling as desired
            >
                <FaArrowLeft title="Go back" />
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Predefined Device Names</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Device Name
                </Button>
            </div>

            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : deviceNames.length === 0 ? (
                <Alert variant="info">No device names found.</Alert>
            ) : (
                <>
                    {/* Table header */}
                    <Row className="fw-bold mt-2">
                        <Col md={10}>Device Name</Col>
                        <Col md={2}>Actions</Col>
                    </Row>
                    <hr />
                    {/* Device Name rows */}
                    {deviceNames.map((deviceName, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={deviceName.id}
                                className="align-items-center py-1"
                                style={{ backgroundColor: rowBgColor }}
                            >
                                <Col md={10}>{deviceName.name}</Col>
                                <Col md={2}>
                                    <Button
                                        variant="link"
                                        className="d-flex p-0"
                                        onClick={() => handleShowDeleteModal(deviceName)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}

            {/* Add Device Name Modal */}
            <Modal backdrop="static" show={showAddModal} onHide={() => setShowAddModal(false)}>
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
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Device Name
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDeviceName && (
                        <p>
                            Are you sure you want to delete the device name "
                            <strong>{selectedDeviceName.name}</strong>"?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteDeviceName}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewPredefinedDeviceNames;
