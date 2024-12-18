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
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

function ViewWorkTypes() {
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newWorkType, setNewWorkType] = useState('');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [editWorkTypeName, setEditWorkTypeName] = useState('');

    // State for Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [relatedTickets, setRelatedTickets] = useState([]);

    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        fetchWorkTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);

    const fetchWorkTypes = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`);
            setWorkTypes(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching work types');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorkType = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`${config.API_BASE_URL}/work-type/classificator/add`, { workType: newWorkType });
            setShowAddModal(false);
            setNewWorkType('');
            setRefresh((prev) => !prev); // Refresh the list
        } catch (error) {
            setError('Error adding work type');
        }
    };

    const handleEdit = (workType) => {
        setSelectedWorkType(workType);
        setEditWorkTypeName(workType.workType);
        setShowEditModal(true);
    };

    const handleUpdateWorkType = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/work-type/classificator/update/${selectedWorkType.id}`,
                { workType: editWorkTypeName }
            );
            setShowEditModal(false);
            setSelectedWorkType(null);
            setRefresh((prev) => !prev); // Refresh the list
        } catch (error) {
            setError('Error updating work type');
        }
    };

    const handleShowDeleteModal = async () => {
        await fetchRelatedTickets();
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const fetchRelatedTickets = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/search`, {
                params: { workTypeId: selectedWorkType.id },
            });
            setRelatedTickets(response.data);
        } catch (error) {
            setError('Error fetching related tickets');
        }
    };

    const handleDeleteWorkType = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/work-type/classificator/${selectedWorkType.id}`);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedWorkType(null);
            setRefresh((prev) => !prev); // Refresh the list
        } catch (error) {
            setError('Error deleting work type');
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
                <h1>Work Types</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Work Type
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
                    {workTypes.length === 0 ? (
                        <Alert variant="info">No work types found.</Alert>
                    ) : (
                        <>
                            {/* Table header */}
                            <Row className="fw-bold mt-2">
                                <Col md={10}>Work Type</Col>
                                <Col md={2}>Actions</Col>
                            </Row>
                            <hr />
                            {/* Work Type rows */}
                            {workTypes.map((workType, index) => {
                                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={workType.id}
                                        className="align-items-center py-1"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col md={10}>{workType.workType}</Col>
                                        <Col md={2}>
                                            <Button
                                                variant="link"
                                                className="d-flex p-0"
                                                onClick={() => handleEdit(workType)}
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

            {/* Add Work Type Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Work Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddWorkType}>
                    <Modal.Body>
                        <Form.Group controlId="formNewWorkType">
                            <Form.Label>Work Type</Form.Label>
                            <Form.Control
                                type="text"
                                value={newWorkType}
                                onChange={(e) => setNewWorkType(e.target.value)}
                                placeholder="Enter work type"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Work Type
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Work Type Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Work Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateWorkType}>
                    <Modal.Body>
                        <Form.Group controlId="formEditWorkType">
                            <Form.Label>Work Type</Form.Label>
                            <Form.Control
                                type="text"
                                value={editWorkTypeName}
                                onChange={(e) => setEditWorkTypeName(e.target.value)}
                                placeholder="Enter work type"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Work Type
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Work Type
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Work Type Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {relatedTickets.length > 0 ? (
                        <>
                            <p>
                                This work type is associated with the following tickets and cannot be deleted:
                            </p>
                            <ul>
                                {relatedTickets.map((ticket) => (
                                    <li key={ticket.id}>
                                        <strong>Ticket ID:</strong> {ticket.id} <br />
                                        <strong>Title:</strong> {ticket.title} <br />
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No tickets are linked to this work type. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    {relatedTickets.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteWorkType}>
                            Delete Work Type
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewWorkTypes;
