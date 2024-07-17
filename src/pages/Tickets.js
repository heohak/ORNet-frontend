import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, ButtonGroup, FormControl, InputGroup } from "react-bootstrap";
import config from "../config/config";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const navigate = useNavigate();

    // Debounce the search query input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 300ms delay
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `${config.API_BASE_URL}/ticket/all`;
                if (filter === 'open') {
                    url = `${config.API_BASE_URL}/ticket/status/1`;
                } else if (filter === 'closed') {
                    url = `${config.API_BASE_URL}/ticket/status/2`;
                } else if (debouncedSearchQuery.trim()) {
                    url = `${config.API_BASE_URL}/ticket/search?q=${debouncedSearchQuery}`;
                }
                const response = await axios.get(url);
                setTickets(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [filter, debouncedSearchQuery]);

    const handleNavigate = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    const handleAddTicket = () => {
        navigate('/add-ticket', { state: { from: 'tickets' } });
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setSearchQuery(''); // Clear search query when filter changes
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
            <InputGroup className="mb-4">
                <FormControl
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                />
            </InputGroup>
            <ButtonGroup className="mb-4">
                <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('all')}
                >
                    All Tickets
                </Button>
                <Button
                    variant={filter === 'open' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('open')}
                >
                    Open Tickets
                </Button>
                <Button
                    variant={filter === 'closed' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('closed')}
                >
                    Closed Tickets
                </Button>
            </ButtonGroup>
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
