import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import config from '../../config/config';

function EditThirdPartyIT() {
    const location = useLocation();
    const navigate = useNavigate();
    const { thirdParty, clientId } = location.state || {};

    const [name, setName] = useState(thirdParty.name);
    const [email, setEmail] = useState(thirdParty.email);
    const [phone, setPhone] = useState(thirdParty.phone);
    const [error, setError] = useState(null);
    const [associatedClients, setAssociatedClients] = useState([]); // State to hold associated clients
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    useEffect(() => {
        if (thirdParty.id) {
            fetchAssociatedClients();
        }
    }, [thirdParty.id]);

    // Fetch clients associated with the Third Party IT entity
    const fetchAssociatedClients = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/search`, {
                params: { thirdPartyId: thirdParty.id }
            });
            setAssociatedClients(response.data); // Assuming API returns list of associated clients
        } catch (error) {
            setError('Error fetching associated clients');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.put(`${config.API_BASE_URL}/third-party/update/${thirdParty.id}`, {
                name,
                email,
                phone,
            });
            if (clientId) {
                // If clientId exists, navigate back to the client profile
                navigate(`/customer/${clientId}`);
            } else {
                // Otherwise, navigate to the global settings page
                navigate('/settings/third-party-its');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/third-party/${thirdParty.id}`);
            if (clientId) {
                // If clientId exists, navigate back to the client profile
                navigate(`/customer/${clientId}`);
            } else {
                // Otherwise, navigate to the global settings page
                navigate('/settings/third-party-its');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Handle showing the delete modal
    const handleShowDeleteModal = () => {
        setShowDeleteModal(true);
    };

    // Close the delete modal
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    return (
        <Container className="mt-5">
            <h1>Edit Third Party IT</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
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
                <Form.Group controlId="formPhone" className="mt-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Update
                </Button>
                <Button variant="danger" onClick={handleShowDeleteModal} className="mt-3 ms-3">
                    Delete
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => clientId ? navigate(`/customer/${clientId}`) : navigate('/settings/third-party-its')}
                    className="mt-3 ms-3"
                >
                    Cancel
                </Button>
            </Form>
            {/* Modal for Delete Confirmation */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Third Party IT Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this third-party IT entity?</p>
                    {associatedClients.length > 0 ? (
                        <>
                            <p>This third-party IT entity is associated with the following clients:</p>
                            <ul>
                                {associatedClients.map((client) => (
                                    <li key={client.id}>Client: {client.shortName}</li>
                                ))}
                            </ul>
                            <p style={{color: 'red'}}>This action will delete the third party from all associated clients and cannot be undone.</p>
                        </>
                    ) : (
                        <p>No clients associated. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default EditThirdPartyIT;
