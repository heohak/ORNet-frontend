import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import config from "../../../config/config";
import TicketDetails from './TicketDetails';

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
    const [refresh, setRefresh] = useState(false);
    const [clientName, setClientName] = useState(null);
    const navigate = useNavigate();

    const ticketRefs = useRef({});

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/main/${ticketId}`);
                const ticketsData = response.data;
                if (ticketsData.length > 0) {
                    fetchClientName(ticketsData[0].clientId);
                }
                setTickets(ticketsData);
                const initialEditFields = {};
                ticketsData.forEach(ticket => {
                    initialEditFields[ticket.id] = {
                        title: ticket.title || '',
                        response: ticket.response || '',
                        insideInfo: ticket.insideInfo || '',
                        description: ticket.description || '',
                        workType: ticket.workType || '',
                        clientId: ticket.clientId || '',
                        mainTicketId: ticket.mainTicketId || '',
                        statusId: ticket.statusId || '',
                        createdAt: ticket.createdAt || '',
                        updatedAt: ticket.updatedAt || '',
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
    }, [ticketId, scrollToId, refresh]);

    useEffect(() => {
        if (!loading && scrollToId && ticketRefs.current[scrollToId]) {
            ticketRefs.current[scrollToId].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, scrollToId]);

    const fetchClientName = async (clientId) => {
        try {
            const clientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            setClientName(clientResponse.data.fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const handleAddTicket = () => {
        const currentTicket = tickets.find(ticket => ticket.id === parseInt(ticketId));
        if (currentTicket) {
            navigate(`/add-ticket/${ticketId}?clientId=${currentTicket.clientId}`); // Passes along the client id
        } else {
            navigate(`/add-ticket/${ticketId}`);
        }
    };

    const handleSave = async (ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticketId}`, {
                ...editFields[ticketId]
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
                paid: expandedTickets.has(id) ? !expandedSections[id]?.paid : true,

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

    const handleUploadSuccess = () => {
        setRefresh(!refresh); // Toggle refresh state to trigger re-fetch
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
                <h1 className="mb-4">{clientName} - Ticket Details</h1>
                <Button variant="success" onClick={handleAddTicket} className="mb-4">Add Ticket</Button>
            </div>
            {tickets.length > 0 ? (
                <>
                    {tickets.map((ticket) => (
                        <TicketDetails
                            key={ticket.id}
                            ticket={ticket}
                            expandedTickets={expandedTickets}
                            expandedSections={expandedSections}
                            toggleTicketExpansion={toggleTicketExpansion}
                            toggleSectionExpansion={toggleSectionExpansion}
                            editFields={editFields}
                            setEditFields={setEditFields}
                            handleSave={handleSave}
                            ticketRefs={ticketRefs}
                            onUploadSuccess={handleUploadSuccess}
                        />
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
