import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import config from "../config/config";

function AddTicket() {
    const { mainTicketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const clientIdParam = queryParams.get('clientId');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState(clientIdParam || '');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const newTicket = {
                description,
                clientId,
                ...(mainTicketId && { mainTicketId })  // Include mainTicketId only if it's provided
            };
            await axios.post(`${config.API_BASE_URL}/ticket/add`, newTicket);
            if (!mainTicketId) {
                navigate(`/tickets`);
            } else {
                navigate(`/ticket/${mainTicketId}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Ticket</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                {!clientIdParam && (
                    <Form.Group controlId="clientId" className="mb-3">
                        <Form.Label>Client ID</Form.Label>
                        <Form.Control
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        />
                    </Form.Group>
                )}
                <Button variant="success" type="submit">
                    Submit
                </Button>
                <Button className="gy-5" onClick={() => navigate(-1)}>Back</Button>
            </Form>
        </Container>
    );
}

export default AddTicket;