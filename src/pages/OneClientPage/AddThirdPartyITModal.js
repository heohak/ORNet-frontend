// src/components/AddThirdPartyITModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';
import AddClientWorker from "./AddClientWorker"; // <--- We'll call this modal

function AddThirdPartyITModal({ show, onHide, onNewThirdPartyIT, clientId }) {
    const [newThirdParty, setNewThirdParty] = useState({
        name: '',
        country: '',
        city: '',
        streetAddress: '',
        contactId: null,
        email: '',
        phone: ''
        // fileIds: [] // if you want to handle files, handle similarly
    });

    const [error, setError] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For "Add contact" sub-modal
    const [showAddContactModal, setShowAddContactModal] = useState(false);

    // For listing existing contacts to pick from (optional):
    const [availableContacts, setAvailableContacts] = useState([]);
    const [selectedContactOption, setSelectedContactOption] = useState(null);

    // 1. Possibly fetch existing contacts (if you want a dropdown to select a contact)
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/${clientId}`);
                // Convert to react-select format
                const contactOptions = response.data.map((contact) => ({
                    value: contact.id,
                    label: `${contact.firstName} ${contact.lastName}`
                }));
                setAvailableContacts(contactOptions);
            } catch (err) {
                setError(err.message);
            }
        };

        // You may choose to fetch only if you want to let user pick from existing client workers
        if (clientId) {
            fetchContacts();
        }
    }, [clientId]);

    // 2. Handle "Add New Third Party IT"
    const handleAddThirdParty = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        // 2a. Validate phone
        const trimmedPhoneNumber = newThirdParty.phone.trim();
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            setIsSubmitting(false);
            return;
        }
        setPhoneNumberError('');

        // 2b. Check required fields
        const { name, email, phone, country, city, streetAddress, contactId } = newThirdParty;
        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError('Please fill in all required fields (Name, Email, Phone).');
            setIsSubmitting(false);
            return;
        }
        // (If country/city/streetAddress/contact are optional, no need to check)

        try {
            // 2c. Construct the final payload for your new ThirdPartyITDTO
            const payload = {
                name,
                email,
                phone: trimmedPhoneNumber,
                country,
                city,
                streetAddress,
                contactId // might be null if none selected
                // fileIds: ...
            };

            const response = await axiosInstance.post(`${config.API_BASE_URL}/third-party/add`, payload);
            // 2d. Callback up to parent
            onNewThirdPartyIT(response.data);

            // 2e. Reset & close
            setNewThirdParty({
                name: '',
                country: '',
                city: '',
                streetAddress: '',
                contactId: null,
                email: '',
                phone: ''
            });
            setSelectedContactOption(null);
            onHide();
        } catch (error) {
            setError('Error adding third-party IT.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. If user wants to "Add new contact," open the `AddClientWorker` sub-modal
    //    We'll pass a callback: once a new contact is created, we can set it as our chosen contact
    const handleAddContactSuccess = (newWorker) => {
        // newWorker = { id, firstName, lastName, ... }
        // Insert it into availableContacts
        const newContactOption = {
            value: newWorker.id,
            label: `${newWorker.firstName} ${newWorker.lastName}`
        };
        setAvailableContacts((prev) => [...prev, newContactOption]);
        // Auto-select
        setSelectedContactOption(newContactOption);
        // Update the state in newThirdParty with the new contact ID
        setNewThirdParty((prev) => ({ ...prev, contactId: newWorker.id }));
        // close sub-modal
        setShowAddContactModal(false);
    };

    // 4. If user picks an existing contact from the dropdown:
    const handleContactChange = (option) => {
        setSelectedContactOption(option);
        setNewThirdParty((prev) => ({
            ...prev,
            contactId: option ? option.value : null
        }));
    };

    return (
        <>
            <Modal backdrop="static" show={show} onHide={onHide}>
                <Form onSubmit={handleAddThirdParty}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Third-Party IT</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        {/* Name */}
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

                        {/* Email */}
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

                        {/* Phone */}
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Phone"
                                value={newThirdParty.phone}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, phone: e.target.value })}
                                required
                                isInvalid={!!phoneNumberError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Country */}
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Country"
                                value={newThirdParty.country}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, country: e.target.value })}
                            />
                        </Form.Group>

                        {/* City */}
                        <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter City"
                                value={newThirdParty.city}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, city: e.target.value })}
                            />
                        </Form.Group>

                        {/* Street Address */}
                        <Form.Group className="mb-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Street Address"
                                value={newThirdParty.streetAddress}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, streetAddress: e.target.value })}
                            />
                        </Form.Group>

                        {/* Contact ID (optional) - existing or new contact */}
                        <Form.Group className="mb-3">
                            <Form.Label>Contact</Form.Label>
                            <Button
                                variant="link"
                                onClick={() => setShowAddContactModal(true)}
                                className="px-0 py-0"
                            >
                                Add New Contact
                            </Button>
                            <Select
                                options={availableContacts}
                                value={selectedContactOption}
                                onChange={handleContactChange}
                                placeholder="Select existing contact"
                                isClearable
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Third-Party IT'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Sub-modal for "Add Client Worker" (Contact) */}
            <AddClientWorker
                show={showAddContactModal}
                onClose={() => setShowAddContactModal(false)}
                onSuccess={handleAddContactSuccess}
                reFetchRoles={() => {}}
                // Since we're adding a contact for a third-party (not a client):
                showLocationField={false}
                modalTitle="Add Third-Party Contact"
            />

        </>
    );
}

export default AddThirdPartyITModal;
