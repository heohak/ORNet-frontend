import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import config from "../config/config";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/all`);
                setTickets(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleNavigate = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    const handleAddTicket = () => {
        navigate('/add-ticket', { state: { from: 'tickets' } });
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Tickets</h1>
                <Button variant="success" onClick={handleAddTicket}>Add Ticket</Button>
            </div>
            <Row>
                {tickets.map((ticket) => (
                    <Col md={4} key={ticket.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Button
                                        variant={ticket.statusId === 1 ? "success" : "danger"}
                                        size=""
                                        disabled
                                    >
                                        {ticket.statusId === 1 ? "open" : "closed"}
                                    </Button>
                                </div>
                                <Card.Title>{ticket.description}</Card.Title>
                                <Card.Text>
                                    <strong>Client ID:</strong> {ticket.clientId}<br />
                                    <strong>Main Ticket ID:</strong> {ticket.mainTicketId}
                                </Card.Text>
                                <Button onClick={() => handleNavigate(ticket.id)}>View Ticket</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Tickets;
