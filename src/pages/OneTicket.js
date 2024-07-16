import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Card, Container, Spinner, Accordion, Row, Col, Form } from "react-bootstrap";
import config from "../config/config";

function OneTicket() {
    const { ticketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const scrollToId = queryParams.get('scrollTo');

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTickets, setExpandedTickets] = useState(new Set());
    const [expandedSections, setExpandedSections] = useState({});
    const [editFields, setEditFields] = useState({});
    const navigate = useNavigate();

    const ticketRefs = useRef({});

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/main/${ticketId}`);
                const ticketsData = response.data;
                setTickets(ticketsData);
                const initialEditFields = {};
                ticketsData.forEach(ticket => {
                    initialEditFields[ticket.id] = {
                        response: ticket.response || '',
                        insideInfo: ticket.insideInfo || ''
                    };
                });
                setEditFields(initialEditFields);
                if (scrollToId) {
                    setExpandedTickets(new Set([scrollToId]));
                    setExpandedSections({ [scrollToId]: { dates: true, details: true } });
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [ticketId, scrollToId]);

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

    const handleChange = (e, ticketId) => {
        const { name, value } = e.target;
        setEditFields((prevFields) => ({
            ...prevFields,
            [ticketId]: {
                ...prevFields[ticketId],
                [name]: value
            }
        }));
    };

    const handleSave = async (ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/${ticketId}`, {
                response: editFields[ticketId].response,
                insideInfo: editFields[ticketId].insideInfo
            });
            setError(null);
            window.location.reload();
        } catch (error) {
            setError(error.message);
        }
    };

    const toggleTicketExpansion = (id) => {
        setExpandedTickets(prevExpandedTickets => {
            const newExpandedTickets = new Set(prevExpandedTickets);
            if (newExpandedTickets.has(id)) {
                newExpandedTickets.delete(id);
            } else {
                newExpandedTickets.add(id);
            }
            return newExpandedTickets;
        });
        setExpandedSections((prevSections) => ({
            ...prevSections,
            [id]: {
                dates: expandedTickets.has(id) ? !expandedSections[id]?.dates : true,
                details: expandedTickets.has(id) ? !expandedSections[id]?.details : true,
            }
        }));
    };

    const toggleSectionExpansion = (ticketId, section) => {
        setExpandedSections((prevSections) => ({
            ...prevSections,
            [ticketId]: {
                ...prevSections[ticketId],
                [section]: !prevSections[ticketId][section]
            }
        }));
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
                        <Accordion key={ticket.id} activeKey={expandedTickets.has(ticket.id.toString()) ? ticket.id.toString() : null}>
                            <Card ref={(el) => (ticketRefs.current[ticket.id] = el)} className="mb-4">
                                <Accordion.Item eventKey={ticket.id.toString()}>
                                    <Accordion.Header onClick={() => toggleTicketExpansion(ticket.id.toString())}>
                                        Ticket ID: {ticket.id}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Card.Body>
                                            <Accordion activeKey={expandedSections[ticket.id]?.dates ? "0" : null}>
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'dates')}>Dates</Accordion.Header>
                                                    <Accordion.Body>
                                                        <Row>
                                                            <Col>
                                                                <p><strong>Start Date Time:</strong> {ticket.startDateTime}</p>
                                                                <p><strong>End Date Time:</strong> {ticket.endDateTime}</p>
                                                                <p><strong>Response Date Time:</strong> {ticket.responseDateTime}</p>
                                                                <p><strong>Update Time:</strong> {ticket.update_time}</p>
                                                            </Col>
                                                        </Row>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                            <Accordion activeKey={expandedSections[ticket.id]?.details ? "1" : null}>
                                                <Accordion.Item eventKey="1">
                                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'details')}>Details</Accordion.Header>
                                                    <Accordion.Body>
                                                        <Row>
                                                            <Col md={6}>
                                                                <p><strong>Crisis:</strong> {ticket.crisis ? 'True' : 'False'}</p>
                                                                <p><strong>Remote:</strong> {ticket.remote ? 'True' : 'False'}</p>
                                                                <p><strong>Work Type:</strong> {ticket.workType}</p>
                                                                <p><strong>Responsible ID:</strong> {ticket.baitWorkerId}</p>
                                                            </Col>
                                                            <Col md={6}>
                                                                <p><strong>Client ID:</strong> {ticket.clientId}</p>
                                                                <p><strong>Location ID:</strong> {ticket.locationId}</p>
                                                                <p><strong>Status ID:</strong> {ticket.statusId}</p>
                                                                <p><strong>Root Cause:</strong> {ticket.rootCause}</p>
                                                            </Col>
                                                        </Row>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                            <Card.Title className="mt-4">Description</Card.Title>
                                            <Card className="mb-4 mt-1">
                                                <Card.Body>
                                                    <Card.Text>{ticket.description}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                            <Card.Title className="mt-4">Response</Card.Title>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="response"
                                                value={editFields[ticket.id]?.response || ''}
                                                onChange={(e) => handleChange(e, ticket.id)}
                                                placeholder="Enter your response here..."
                                            />
                                            <Card.Title className="mt-4">Inside Info</Card.Title>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="insideInfo"
                                                value={editFields[ticket.id]?.insideInfo || ''}
                                                onChange={(e) => handleChange(e, ticket.id)}
                                                placeholder="Enter inside info here..."
                                            />
                                            <Button className="mt-3" variant="primary" onClick={() => handleSave(ticket.id)}>
                                                Save
                                            </Button>
                                        </Card.Body>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Card>
                        </Accordion>
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

