import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../config/config";

const AddContactModal = ({ show, handleClose, onAdd, locations, clientId }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [locationId, setLocationId] = useState('');
    const [title, setTitle] = useState('');


    const handleAddContact = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/worker/add`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                locationId,
                title
            });
            onAdd(response.data); // Pass the new contact back to the parent component
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhoneNumber('');
            setLocationId('');
            handleClose();
        } catch (error) {
            console.error('Error adding new contact:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Contact</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="newContact">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddContact}>
                    Add Contact
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddContactModal;
