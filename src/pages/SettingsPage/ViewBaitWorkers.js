import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    Spinner,
    Alert,
    Form,
    Modal,
    Container,
} from 'react-bootstrap';
import config from '../../config/config';
import {
    FaEnvelope,
    FaPhone,
    FaBriefcase,
    FaEdit, FaArrowLeft,
} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

function ViewBaitWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhoneNumber, setEditPhoneNumber] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editPhoneNumberError, setEditPhoneNumberError] = useState('');
    const [relatedTickets, setRelatedTickets] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`);
                setWorkers(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, []);

    const handleAddWorker = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        const trimmedPhoneNumber = phoneNumber.trim();
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return;
        }
        setPhoneNumberError('');
        setPhoneNumber(trimmedPhoneNumber);

        try {
            await axiosInstance.post(`${config.API_BASE_URL}/bait/worker/add`, {
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
            });
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`);
            setWorkers(response.data);
            setShowAddModal(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhoneNumber('');
            setTitle('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (worker) => {
        setSelectedWorker(worker);
        setEditFirstName(worker.firstName);
        setEditLastName(worker.lastName);
        setEditEmail(worker.email);
        setEditPhoneNumber(worker.phoneNumber);
        setEditTitle(worker.title);
        setShowEditModal(true);
    };

    const handleUpdateWorker = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        const trimmedPhoneNumber = editPhoneNumber.trim();
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setEditPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return;
        }
        setEditPhoneNumberError('');
        setEditPhoneNumber(trimmedPhoneNumber);

        try {
            await axiosInstance.put(`${config.API_BASE_URL}/bait/worker/update/${selectedWorker.id}`, {
                firstName: editFirstName,
                lastName: editLastName,
                email: editEmail,
                phoneNumber: editPhoneNumber,
                title: editTitle,
            });
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`);
            setWorkers(response.data);
            setShowEditModal(false);
            setSelectedWorker(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchRelatedTickets = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/search`, {
                params: { baitWorkerId: selectedWorker.id },
            });
            setRelatedTickets(response.data);
        } catch (error) {
            setError('Error fetching related tickets');
        }
    };

    const handleShowDeleteModal = async () => {
        await fetchRelatedTickets();
        setShowDeleteModal(true);
    };

    const handleDeleteWorker = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/bait/worker/${selectedWorker.id}`);
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`);
            setWorkers(response.data);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedWorker(null);
        } catch (error) {
            setError('Error deleting worker');
        } finally {
            setIsSubmitting(false);
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
                <h1>Bait Workers</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Worker
                </Button>
            </div>

            <Row>
                {workers.map((worker) => (
                    <Col md={4} key={worker.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <Card.Title>
                                        {worker.firstName} {worker.lastName}
                                    </Card.Title>
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        onClick={() => handleEdit(worker)}
                                    >
                                        <FaEdit />
                                    </Button>
                                </div>
                                <Card.Text>
                                    <FaEnvelope className="me-2" />
                                    {worker.email}
                                    <br />
                                    <FaPhone className="me-2" />
                                    {worker.phoneNumber}
                                    <br />
                                    <FaBriefcase className="me-2" />
                                    {worker.title}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


            {/* Add Worker Modal */}
            <Modal backdrop="static" show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Worker</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddWorker}>
                    <Modal.Body>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName" className="mt-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhoneNumber" className="mt-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                                required
                                isInvalid={!!phoneNumberError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formTitle" className="mt-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Worker"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Worker Modal */}
            <Modal
                dialogClassName={showDeleteModal ? "dimmed" : ""}
                backdrop="static"
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Worker</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateWorker}>
                    <Modal.Body>
                        <Form.Group controlId="editFormFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                placeholder="Enter first name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormLastName" className="mt-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                placeholder="Enter last name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormPhoneNumber" className="mt-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={editPhoneNumber}
                                onChange={(e) => setEditPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                                required
                                isInvalid={!!editPhoneNumberError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {editPhoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="editFormTitle" className="mt-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Enter title"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Worker
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Worker"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Bait Worker Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this worker?</p>
                    {relatedTickets.length > 0 ? (
                        <>
                            <p>
                                This worker is linked to the following tickets and cannot be
                                deleted:
                            </p>
                            <ul>
                                {relatedTickets.map((ticket) => (
                                    <li key={ticket.id}>
                                        Ticket ID: {ticket.id}, Name: {ticket.title}, Customer:{' '}
                                        {ticket.clientName}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No related tickets found. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowDeleteModal(false)}>
                        Close
                    </Button>
                    {relatedTickets.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteWorker} disabled={isSubmitting}>
                            {isSubmitting ? "Deleting..." : "Delete Worker"}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewBaitWorkers;
