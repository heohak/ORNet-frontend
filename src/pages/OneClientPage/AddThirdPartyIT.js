import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';
import '../../css/DarkenedModal.css';

function AddThirdPartyIT({ clientId, show, onClose, setRefresh, clientThirdParties }) {
    const [availableThirdParties, setAvailableThirdParties] = useState([]);
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [error, setError] = useState(null);

    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });
    const [isSubmittingMainForm, setIsSubmittingMainForm] = useState(false);
    const [isSubmittingModalForm, setIsSubmittingModalForm] = useState(false);


    useEffect(() => {
        const fetchThirdParties = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);

                // Create a Set of IDs from clientThirdParties for faster lookups
                const clientThirdPartySet = new Set(clientThirdParties.map(item => item.id));

                // Filter out objects in response.data whose IDs are in clientThirdParties
                const filteredList = response.data.filter(item => !clientThirdPartySet.has(item.id));

                // Map the filtered list to the desired format for the dropdown
                setAvailableThirdParties(filteredList.map(thirdParty => ({
                    value: thirdParty.id,
                    label: thirdParty.name
                })));
            } catch (error) {
                setError(error.message);
            }

        };

        fetchThirdParties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmittingMainForm) return;
        setIsSubmittingMainForm(true);
        setError(null);

        if (!selectedThirdParty) {
            setError("Please select a third-party IT.");
            setIsSubmittingMainForm(false);
            return;
        }

        try {
            await axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${selectedThirdParty.value}`);
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            onClose(); // Close the modal after adding the third-party IT
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmittingMainForm(false);
            setAvailableThirdParties(prev => prev.filter(item => item.value !== selectedThirdParty.value));
            setSelectedThirdParty(null);
        }
    };

    const handleAddThirdParty = async (e) => {
        e.preventDefault();
        if (isSubmittingModalForm) return;
        setIsSubmittingModalForm(true);
        const trimmedPhoneNumber = newThirdParty.phone.trim();

        // Check if the phone number contains only digits and allowed characters
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            setIsSubmittingModalForm(false);
            return false;
        }

        // Reset the error message if validation passes
        setPhoneNumberError('');
        setNewThirdParty({ ...newThirdParty, phone: trimmedPhoneNumber });

        const { name, email, phone } = newThirdParty;

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new third-party IT.');
            setIsSubmittingModalForm(false);
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
            setAvailableThirdParties(prevThirdParties => [...prevThirdParties, newThirdPartyOption]);
            setSelectedThirdParty(newThirdPartyOption); // Automatically select the new third-party IT
            setNewThirdParty({ name: '', email: '', phone: '' });
            setShowThirdPartyModal(false);
        } catch (error) {
            setError('Error adding third-party IT.');
            console.error('Error adding third-party IT:', error);
        } finally {
            setIsSubmittingModalForm(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            dialogClassName={showThirdPartyModal ? 'dimmed' : ''}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add Third-Party IT</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Third-Party IT</Form.Label>
                        <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>
                            Add New
                        </Button>
                        <Select
                            options={availableThirdParties}
                            value={selectedThirdParty}
                            onChange={setSelectedThirdParty}
                            placeholder="Select a third-party IT"
                        />
                        <Form.Text className="text-muted">

                        </Form.Text>
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onClose}>
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit" disabled={isSubmittingMainForm}>
                            {isSubmittingMainForm ? 'Adding...' : 'Add Third-Party IT'}
                        </Button>

                    </Modal.Footer>
                </Form>
            </Modal.Body>

            <Modal show={showThirdPartyModal} onHide={() => setShowThirdPartyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Third-Party IT</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddThirdParty}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Name"
                                value={newThirdParty.name}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                value={newThirdParty.email}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Phone Number"
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
                        <Button variant="outline-info" onClick={() => setShowThirdPartyModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingModalForm}>
                            {isSubmittingModalForm ? 'Adding...' : 'Add Third-Party IT'}
                        </Button>

                    </Modal.Footer>
                </Form>
            </Modal>
        </Modal>
    );
}

export default AddThirdPartyIT;
