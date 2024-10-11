import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import config from "../../../config/config";
import TicketDetails from "./TicketDetails/TicketDetails";

function OneTicket() {
    const { ticketId } = useParams();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [editFields, setEditFields] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/${ticketId}`);
                setTicket(response.data);
                setEditFields( {
                    // response: response.data.response || '',
                    insideInfo: response.data.insideInfo || '',
                    description: response.data.description || '',
                    workType: response.data.workType || '',
                    clientId: response.data.clientId || '',
                    statusId: response.data.statusId || '',
                    createdAt: response.data.createdAt || '',
                    updatedAt: response.data.updatedAt || '',
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId]);


    const handleSave = async (ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticketId}`, {
                ...editFields
            });
            setError(null);
            window.location.reload();
        } catch (error) {
            setError(error.message);
        }
    };


    const toggleSectionExpansion = (section) => {
        setExpandedSections((prevSections) => ({
            ...prevSections,
            [section]: !prevSections[section]
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
            {ticket ? (
                <TicketDetails
                    ticket={ticket}
                    expandedSections={expandedSections}
                    toggleSectionExpansion={toggleSectionExpansion}
                    editFields={editFields}
                    setEditFields={setEditFields}
                    handleSave={handleSave}
                />
            ) : (
                <Alert variant="info">No ticket details available.</Alert>
            )}
            <Button
                onClick={() => {
                    if (location.state && location.state.from === 'tickets') {
                        navigate('/devices');
                    } else if (ticket.id && ticket.clientId) {
                        navigate(`/customer/${ticket.clientId}`);
                    } else {
                        navigate(-1);
                    }
                }}
            >
                Back
            </Button>
        </Container>
    );
}

export default OneTicket;
