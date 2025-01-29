import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import axiosInstance from "../../config/axiosInstance";

function EditThirdPartyITModal({ show, onHide, thirdParty, onUpdate }) {
    const [name, setName] = useState(thirdParty.name || '');
    const [email, setEmail] = useState(thirdParty.email || '');
    const [phone, setPhone] = useState(thirdParty.phone || '');
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
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/search`, {
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
            await axiosInstance.put(`${config.API_BASE_URL}/third-party/update/${thirdParty.id}`, {
                name,
                email,
                phone,
            });
            onUpdate(); // Notify parent to update the list
            onHide(); // Close the modal
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/third-party/${thirdParty.id}`);
            onUpdate(); // Notify parent to update the list
            onHide(); // Close the modal
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
        <>
            <Modal backdrop="static" show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Third Party IT</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdate}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>Delete</Button>
                        <Button variant="primary" type="submit">Update</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Third Party IT Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this third-party IT entity?</p>
                    {associatedClients.length > 0 ? (
                        <>
                            <p>This third-party IT entity is associated with the following customers:</p>
                            <ul>
                                {associatedClients.map((client) => (
                                    <li key={client.id}>Customer: {client.shortName}</li>
                                ))}
                            </ul>
                            <p style={{color: 'red'}}>This action will delete the third party from all associated customers and cannot be undone.</p>
                        </>
                    ) : (
                        <p>No customers associated. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditThirdPartyITModal;
