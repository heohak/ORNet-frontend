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

function ViewTicketStatusClassificators() {
    const [classificators, setClassificators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newColor, setNewColor] = useState('#007bff');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClassificator, setSelectedClassificator] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editColor, setEditColor] = useState('');

    // State for Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [relatedTickets, setRelatedTickets] = useState([]);

    useEffect(() => {
        fetchClassificators();
    }, []);

    const fetchClassificators = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            setClassificators(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching ticket status classificators');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassificator = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/ticket/classificator/add`, {
                status: newStatus,
                color: newColor,
            });
            setShowAddModal(false);
            setNewStatus('');
            setNewColor('#007bff');
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error adding ticket status classificator');
        }
    };

    const handleEdit = (classificator) => {
        setSelectedClassificator(classificator);
        setEditStatus(classificator.status);
        setEditColor(classificator.color || '#007bff');
        setShowEditModal(true);
    };

    const handleUpdateClassificator = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${config.API_BASE_URL}/ticket/classificator/update/${selectedClassificator.id}`,
                { status: editStatus, color: editColor }
            );
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error updating ticket status classificator');
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
            const response = await axios.get(`${config.API_BASE_URL}/ticket/search`, {
                params: { statusId: selectedClassificator.id },
            });
            setRelatedTickets(response.data);
        } catch (error) {
            setError('Error fetching related tickets');
        }
    };

    const handleDeleteClassificator = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/ticket/classificator/${selectedClassificator.id}`);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedClassificator(null);
            fetchClassificators(); // Refresh the list
        } catch (error) {
            setError('Error deleting ticket status classificator');
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
                <h1>Ticket Status Classificators</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Classificator
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
                        <Alert variant="info">No ticket status classificators found.</Alert>
                    ) : (
                        <>
                            {/* Table header */}
                            <Row className="fw-bold mt-2">
                                <Col md={9}>Status</Col>
                                <Col md={1}>Color</Col>
                                <Col md={2}>Actions</Col>
                            </Row>
                            <hr />
                            {/* Status rows */}
                            {classificators.map((classificator, index) => {
                                const rowBgColor =
                                    index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={classificator.id}
                                        className="align-items-center"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col md={9}>{classificator.status}</Col>
                                        <Col md={1}>
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: classificator.color || '#007bff',
                                                    border: '1px solid #000',
                                                    borderRadius: '4px',
                                                }}
                                            ></div>
                                        </Col>
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

            {/* Add Classificator Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Ticket Status</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddClassificator}>
                    <Modal.Body>
                        <Form.Group controlId="formNewStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                type="text"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                placeholder="Enter status"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formNewColor" className="mt-3">
                            <Form.Label>Color</Form.Label>
                            <Form.Control
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                title="Choose a color"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Status
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Classificator Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ticket Status</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateClassificator}>
                    <Modal.Body>
                        <Form.Group controlId="formEditStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                type="text"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                placeholder="Enter status"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEditColor" className="mt-3">
                            <Form.Label>Color</Form.Label>
                            <Form.Control
                                type="color"
                                value={editColor}
                                onChange={(e) => setEditColor(e.target.value)}
                                title="Choose a color"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Status
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Status
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Status Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {relatedTickets.length > 0 ? (
                        <>
                            <p>
                                This status is associated with the following tickets and cannot be
                                deleted:
                            </p>
                            <ul>
                                {relatedTickets.map((ticket) => (
                                    <li key={ticket.id}>
                                        <strong>Ticket ID:</strong> {ticket.id} <br />
                                        <strong>Title:</strong> {ticket.title} <br />
                                        <strong>Customer:</strong> {ticket.clientName}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No tickets are linked to this status. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    {relatedTickets.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteClassificator}>
                            Delete Status
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewTicketStatusClassificators;
