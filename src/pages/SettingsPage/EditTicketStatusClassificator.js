import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../../config/config';

function EditTicketStatusClassificator() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassificator = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/${id}`);
                setStatus(response.data.status);
            } catch (error) {
                setError('Error fetching ticket status classificator');
            }
        };

        fetchClassificator();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/classificator/update/${id}`, { status });
            navigate('/settings/ticket-status-classificators');
        } catch (error) {
            setError('Error updating ticket status classificator');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/ticket/classificator/${id}`);
            navigate('/settings/ticket-status-classificators');
        } catch (error) {
            setError('Error deleting ticket status classificator');
        }
    };

    return (
        <Container className="mt-5">
            <h1>Edit Ticket Status Classificator</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form>
                <Form.Group controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                        type="text"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="Enter status"
                        required
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" onClick={handleUpdate}>Update</Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleDelete}>Delete</Button>
            </Form>
            <Button variant="secondary" className="mt-3" onClick={() => navigate('/settings/ticket-status-classificators')}>
                Back
            </Button>
        </Container>
    );
}

export default EditTicketStatusClassificator;
