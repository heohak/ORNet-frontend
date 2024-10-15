import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../config/config";

const AddLocationModal = ({ show, handleClose, onAdd, clientId }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');


    const handleAddLocation = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address,
                phone
            });
            const locationId = response.data.id
            await axios.put(`${config.API_BASE_URL}/client/${clientId}/${locationId}`)
            setName('');
            setAddress('');
            setPhone('');
            onAdd(); // Refresh location list in parent component
            handleClose();
        } catch (error) {
            console.error('Error adding new work type:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="newWorkType">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="location"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="location"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="location"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddLocation}>
                    Add Location
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddLocationModal;
