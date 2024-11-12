import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config/config";

function EditBaitWorker() {
    const { baitWorkerId } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedTickets, setRelatedTickets] = useState([]); // State to hold related tickets
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal for delete confirmation
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/bait/worker/${baitWorkerId}`);
                const workerData = response.data;
                setFirstName(workerData.firstName);
                setLastName(workerData.lastName);
                setEmail(workerData.email);
                setPhoneNumber(workerData.phoneNumber);
                setTitle(workerData.title);
            } catch (error) {
                setError('Error fetching worker data');
            } finally {
                setLoading(false);
            }
        };

        fetchWorker();
    }, [baitWorkerId]);

    const handleUpdateWorker = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/bait/worker/update/${baitWorkerId}`, {
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
            });
            navigate('/view-bait-workers');
        } catch (error) {
            setError('Error updating worker');
        }
    };

    const handleDeleteWorker = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/bait/worker/${baitWorkerId}`);
            navigate('/view-bait-workers');
        } catch (error) {
            setError('Error deleting worker');
        }
    };

    // Fetch related tickets based on baitWorkerId
    const fetchRelatedTickets = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/search`, {
                params: { baitWorkerId }
            });
            setRelatedTickets(response.data); // Assuming the API returns a list of related tickets with IDs, names, and clients
        } catch (error) {
            setError('Error fetching related tickets');
        }
    };

// Show the delete modal and fetch related tickets
    const handleShowDeleteModal = async () => {
        await fetchRelatedTickets(); // Fetch the related tickets before showing the modal
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
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

    return (
        <Container className="mt-5">
            <h1>Edit Worker</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleUpdateWorker}>
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
                    />
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
                <Button variant="primary" className="mt-3" type="submit">
                    Update Worker
                </Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleShowDeleteModal}>
                    Delete Worker
                </Button>
                <Button variant="secondary" className="mt-3 ms-3" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>

            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Bait Worker Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this worker?</p>
                    {relatedTickets.length > 0 ? (
                        <>
                            <p>This worker is linked to the following tickets and cannot be deleted:</p>
                            <ul>
                                {relatedTickets.map((ticket) => (
                                    <li key={ticket.id}>
                                        Ticket ID: {ticket.id}, Name: {ticket.title}, Customer: {ticket.clientName}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No related tickets found. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    {/* Conditionally render Delete button based on whether related tickets exist */}
                    {relatedTickets.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteWorker}>
                            Delete Worker
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>



        </Container>
    );
}

export default EditBaitWorker;
