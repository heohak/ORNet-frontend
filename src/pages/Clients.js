// src/pages/Clients.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:8080/client');
                setClients(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleNavigateWorkers = (clientId) => {
        navigate('/workers', { state: { clientId } });
    };

    const handleNavigateDevices = (clientId) => {
        navigate(`/clients/${clientId}/devices`);
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Clients</h1>
            <Row>
                {clients.map((client) => (
                    <Col md={4} key={client.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{client.fullName}</Card.Title>
                                <Card.Text>
                                    <strong>Short Name:</strong> {client.shortName}<br />
                                    <strong>Third Party IT:</strong> {client.thirdPartyIT}
                                </Card.Text>
                                <Button variant="primary" onClick={() => handleNavigateWorkers(client.id)}>
                                    View Workers
                                </Button>
                                <Button variant="secondary" className="ms-2" onClick={() => handleNavigateDevices(client.id)}>
                                    View Devices
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Clients;
