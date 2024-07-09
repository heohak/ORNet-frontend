import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:8080/tickets');
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

    const handleDeleteTicket = async (ticketId) => {
        setDeleteError(null);
        try {
            await axios.delete(`http://localhost:8080/ticket/${ticketId}`);
            setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        } catch (error) {
            setDeleteError(error.message);
        }
    };

    const handleAddTicket = () => {
        navigate('/add-ticket');
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
            {deleteError && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{deleteError}</p>
                </Alert>
            )}
            <Row>
                {tickets.map((ticket) => (
                    <Col md={4} key={ticket.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Button variant="danger" className="position-absolute top-0 end-0 m-2" onClick={() => handleDeleteTicket(ticket.id)}>
                                    Delete
                                </Button>
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
