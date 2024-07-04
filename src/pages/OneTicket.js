// src/pages/OneTicket.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";

function OneTicket() {
    const { ticketId } = useParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/tickets/${ticketId}`);
                setTickets(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [ticketId]);

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
            <h1 className="mb-4">Ticket Details</h1>
            {tickets.length > 0 ? (
                <>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>{tickets[0].description}</Card.Title>
                            <Card.Text>
                                <strong>Client ID:</strong> {tickets[0].clientId}<br />
                                <strong>Main Ticket ID:</strong> {tickets[0].mainTicketId}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    {tickets.length > 1 && (
                        <>
                            <h2 className="mb-4">Previous Tickets</h2>
                            <Row>
                                {tickets.slice(1).map((ticket) => (
                                    <Col md={4} key={ticket.id} className="mb-4">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>{ticket.description}</Card.Title>
                                                <Card.Text>
                                                    <strong>Client ID:</strong> {ticket.clientId}<br />
                                                    <strong>Main Ticket ID:</strong> {ticket.mainTicketId}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <Alert variant="info">No ticket details available.</Alert>
            )}
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default OneTicket;
