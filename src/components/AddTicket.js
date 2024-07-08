import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function AddTicket() {
    const navigate = useNavigate();
    const location = useLocation();


    const [description, setDescription] = useState('');
    const [clientId, setclientId] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.post('http://localhost:8080/ticket', {
                description,
                clientId,
            });
            navigate(-1); // Go back to the previous page
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Ticket</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Client ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={clientId}
                        onChange={(e) => setclientId(e.target.value)}
                    />
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Ticket
                </Button>
            </Form>
        </Container>
    );
}

export default AddTicket;
