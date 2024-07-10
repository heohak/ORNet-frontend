import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import config from "../config/config";

function OneTicket() {
    const { ticketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const scrollToId = queryParams.get('scrollTo');

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const ticketRefs = useRef({});

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/tickets/main/${ticketId}`);
                setTickets(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [ticketId]);

    useEffect(() => {
        if (!loading && scrollToId && ticketRefs.current[scrollToId]) {
            ticketRefs.current[scrollToId].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, scrollToId]);

    const handleAddTicket = () => {
        const currentTicket = tickets.find(ticket => ticket.id === parseInt(ticketId));
        if (currentTicket) {
            navigate(`/add-ticket/${ticketId}?clientId=${currentTicket.clientId}`);
        } else {
            navigate(`/add-ticket/${ticketId}`);
        }
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
                <h1 className="mb-4">Ticket Details</h1>
                <Button variant="success" onClick={handleAddTicket} className="mb-4">Add Ticket</Button>
            </div>
            {tickets.length > 0 ? (
                <>
                    {tickets.map((ticket) => (
                        <Card
                            key={ticket.id}
                            ref={(el) => (ticketRefs.current[ticket.id] = el)}
                            className="mb-4"
                        >
                            <Card.Body>
                                <Card.Title>{ticket.description}</Card.Title>
                                <Card.Text>
                                    <strong>Client ID:</strong> {ticket.clientId}<br />
                                    <strong>Main Ticket ID:</strong> {ticket.mainTicketId}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
                </>
            ) : (
                <Alert variant="info">No ticket details available.</Alert>
            )}
            <Button onClick={() => navigate(`/tickets`)}>Back</Button>
        </Container>
    );
}

export default OneTicket;
