import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../config/config";

function AddClassificatorModal({ show, onHide, onClassificatorAdded }) {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!name) {
            setError("Please provide a name for the device classificator.");
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/device/classificator/add`, {
                name
            });

            onClassificatorAdded(response.data); // Pass the newly added classificator to the parent component
            onHide();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Device Classificator</Modal.Title>
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
                        <Form.Label>Device Classificator Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="success" type="submit">
                        Add Classificator
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AddClassificatorModal;
