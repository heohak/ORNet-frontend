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
import { FaEdit } from 'react-icons/fa';

function ViewDeviceClassificators() {
    const [classificators, setClassificators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClassificator, setSelectedClassificator] = useState(null);
    const [editName, setEditName] = useState('');

    // State for Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [relatedDevices, setRelatedDevices] = useState([]);

    useEffect(() => {
        fetchClassificators();
    }, []);

    const fetchClassificators = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
            setClassificators(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching device types');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassificator = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/device/classificator/add`, { name: newName });
            setShowAddModal(false);
            setNewName('');
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error adding device type');
        }
    };

    const handleEdit = (classificator) => {
        setSelectedClassificator(classificator);
        setEditName(classificator.name);
        setShowEditModal(true);
    };

    const handleUpdateClassificator = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${config.API_BASE_URL}/device/classificator/update/${selectedClassificator.id}`,
                { name: editName }
            );
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error updating device type');
        }
    };

    const handleShowDeleteModal = async () => {
        await fetchRelatedDevices();
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const fetchRelatedDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: { classificatorId: selectedClassificator.id },
            });
            setRelatedDevices(response.data);
        } catch (error) {
            setError('Error fetching related devices');
        }
    };

    const handleDeleteClassificator = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/device/classificator/${selectedClassificator.id}`);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error deleting device type');
        }
    };

    return (
        <Container className="mt-5">
            <h1>Device Types</h1>
            <Button
                variant="primary"
                className="mb-4"
                onClick={() => window.history.back()}
            >
                Back
            </Button>
            <div className="d-flex justify-content-end align-items-center mb-4">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Type
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
            ) : (
                <>
                    {classificators.length === 0 ? (
                        <Alert variant="info">No device types found.</Alert>
                    ) : (
                        <>
                            {/* Table header */}
                            <Row className="fw-bold mt-2">
                                <Col md={10}>Device Type</Col>
                                <Col md={2}>Actions</Col>
                            </Row>
                            <hr />
                            {/* Device Type rows */}
                            {classificators.map((classificator, index) => {
                                const rowBgColor =
                                    index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={classificator.id}
                                        className="align-items-center"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col md={10}>{classificator.name}</Col>
                                        <Col md={2}>
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={() => handleEdit(classificator)}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    )}
                </>
            )}

            {/* Add Device Type Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Device Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddClassificator}>
                    <Modal.Body>
                        <Form.Group controlId="formNewName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Type
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Device Type Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Device Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateClassificator}>
                    <Modal.Body>
                        <Form.Group controlId="formEditName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Type
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Type
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Type Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {relatedDevices.length > 0 ? (
                        <>
                            <p>
                                This type is associated with the following devices and cannot be
                                deleted:
                            </p>
                            <ul>
                                {relatedDevices.map((device) => (
                                    <li key={device.id}>
                                        <strong>Device Name:</strong> {device.deviceName} <br />
                                        <strong>Serial Number:</strong> {device.serialNumber} <br />
                                        <strong>License Number:</strong>{' '}
                                        {device.licenseNumber || 'N/A'}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No devices are linked to this type. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    {relatedDevices.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteClassificator}>
                            Delete Type
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewDeviceClassificators;
