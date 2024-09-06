import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';

function AddThirdPartyIT({ clientId, onClose, setRefresh }) {
    const [thirdParties, setThirdParties] = useState([]);
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [error, setError] = useState(null);

    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const fetchThirdParties = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
                setThirdParties(response.data.map(thirdParty => ({ value: thirdParty.id, label: thirdParty.name })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchThirdParties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedThirdParty) {
            setError("Please select a third-party IT.");
            return;
        }

        try {
            await axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${selectedThirdParty.value}`);
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            onClose(); // Close the modal after adding the third-party IT
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddThirdParty = async (e) => {
        e.preventDefault();
        const trimmedPhoneNumber = newThirdParty.phone.trim();

        // Check if the phone number contains only digits and allowed characters
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return false;
        }

        // Reset the error message if validation passes
        setPhoneNumberError('');
        setNewThirdParty({ ...newThirdParty, phone: trimmedPhoneNumber });

        const { name, email, phone } = newThirdParty;

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new third-party IT.');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/third-party/add`, {
                name,
                email,
                phone,
            });

            const addedThirdParty = response.data;
            const newThirdPartyOption = { value: addedThirdParty.id, label: addedThirdParty.name };
            setThirdParties(prevThirdParties => [...prevThirdParties, newThirdPartyOption]);
            setSelectedThirdParty(newThirdPartyOption); // Automatically select the new third-party IT
            setNewThirdParty({ name: '', email: '', phone: '' });
            setShowThirdPartyModal(false);
        } catch (error) {
            setError('Error adding third-party IT.');
            console.error('Error adding third-party IT:', error);
        }
    };

    return (
        <Container>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Select Third-Party IT</Form.Label>
                    <Select
                        options={thirdParties}
                        value={selectedThirdParty}
                        onChange={setSelectedThirdParty}
                        placeholder="Select a third-party IT"
                    />
                    <Form.Text className="text-muted">
                        Can't find the third-party IT? <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Third-Party IT
                </Button>
            </Form>

            {/* Modal for adding a new third-party IT */}
            <Modal show={showThirdPartyModal} onHide={() => setShowThirdPartyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Third-Party IT</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddThirdParty}>
                    <Modal.Body>
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
                                isInvalid={!!phoneNumberError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowThirdPartyModal(false)}>Cancel</Button>
                        <Button variant="primary" type='submit'>Add Third-Party IT</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default AddThirdPartyIT;
