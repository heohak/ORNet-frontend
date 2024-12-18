import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import axiosInstance from "../../config/axiosInstance";

function AddThirdPartyITModal({ show, onHide, onNewThirdPartyIT }) {
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });
    const [error, setError] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddThirdParty = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const trimmedPhoneNumber = newThirdParty.phone.trim();

        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            setIsSubmitting(false);
            return;
        }

        const { name, email, phone } = newThirdParty;
        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new third-party IT.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/third-party/add`, {
                name,
                email,
                phone,
            });

            const addedThirdParty = response.data;

            // Send the newly added third-party IT object back to the parent component
            onNewThirdPartyIT(addedThirdParty);

            // Reset form and close modal
            setNewThirdParty({ name: '', email: '', phone: '' });
            onHide();
        } catch (error) {
            setError('Error adding third-party IT.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Third-Party IT</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddThirdParty}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Third-Party Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newThirdParty.name}
                            onChange={(e) => setNewThirdParty({ ...newThirdParty, name: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={newThirdParty.email}
                            onChange={(e) => setNewThirdParty({ ...newThirdParty, email: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={newThirdParty.phone}
                            onChange={(e) => setNewThirdParty({ ...newThirdParty, phone: e.target.value })}
                            required
                            isInvalid={!!phoneNumberError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {phoneNumberError}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Third-Party IT'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AddThirdPartyITModal;
