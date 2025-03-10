import React, { useEffect, useState } from 'react';
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
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        fetchClassificators();
    }, []);

    const fetchClassificators = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
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
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.post(`${config.API_BASE_URL}/device/classificator/add`, { name: newName });
            setShowAddModal(false);
            setNewName('');
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error adding device type');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (classificator) => {
        setSelectedClassificator(classificator);
        setEditName(classificator.name);
        setShowEditModal(true);
    };

    const handleUpdateClassificator = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/device/classificator/update/${selectedClassificator.id}`,
                { name: editName }
            );
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error updating device type');
        } finally {
            setIsSubmitting(false);
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
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, {
                params: { classificatorId: selectedClassificator.id },
            });
            setRelatedDevices(response.data);
        } catch (error) {
            setError('Error fetching related devices');
        }
    };

    const handleDeleteClassificator = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/device/classificator/${selectedClassificator.id}`);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error deleting device type');
        } finally {
            setIsDeleting(false);
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
                <h1>Device Types</h1>
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
                                <Col xs={9} md={10}>Device Type</Col>
                                <Col xs={3} md={2}>Actions</Col>
                            </Row>
                            <hr />
                            {/* Device Type rows */}
                            {classificators.map((classificator, index) => {
                                const rowBgColor =
                                    index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={classificator.id}
                                        className="align-items-center py-1"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col xs={9} md={10}>{classificator.name}</Col>
                                        <Col xs={3} md={2}>
                                            <Button
                                                variant="link"
                                                className="d-flex p-0"
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
            <Modal backdrop="static" show={showAddModal} onHide={() => setShowAddModal(false)}>
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
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Type"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Device Type Modal */}
            <Modal backdrop="static" show={showEditModal} onHide={() => setShowEditModal(false)}>
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
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Type"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={handleCloseDeleteModal}>
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
                        <Button variant="danger" onClick={handleDeleteClassificator} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Type"}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewDeviceClassificators;
