import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../../css/Customers.css';
import '../../css/OneClientPage/OneClient.css';
import config from '../../config/config';
import NewTicket from '../TicketsPage/SingleTicketModal/NewTicket';
import AddTicketModal from "../TicketsPage/AddTicketModal/AddTicketModal";
import axiosInstance from "../../config/axiosInstance";

function ClientTickets({ tickets, statusMap, clientId, setTickets }) {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [ticketModal, setTicketModal] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [closedStatusId, setClosedStatusId] = useState("");
    const [locations, setLocations] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAddTicketModal, setShowAddTicketModal] = useState(false);

    // Load ticket and statuses if ticketId is present
    useEffect(() => {
        const loadTicketData = async () => {
            if (ticketId) {
                setLoading(true);
                await fetchTicketById(ticketId);
                if (statuses.length === 0) await fetchStatuses();
                setTicketModal(true);
                setLoading(false);
            } else {
                setTicketModal(false);
                setTicket(null);
            }
        };
        loadTicketData();
    }, [ticketId]);

    const fetchTicketById = async (id) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/${id}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Error fetching ticket by ID:', error);
        }
    };

    const fetchTickets = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/client/${clientId}`);
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching Customer Tickets:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            const fetchedStatuses = response.data;
            setStatuses(fetchedStatuses);

            const closedStatus = fetchedStatuses.find((status) => status.status === 'Closed');
            if (closedStatus) setClosedStatusId(closedStatus.id);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
            const locationsData = response.data.reduce((acc, location) => {
                acc[location.id] = location.name;
                return acc;
            }, {});
            setLocations(locationsData);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    // Load locations on mount
    useEffect(() => {
        fetchLocations();
    }, []);

    const handleTicketClick = (ticket) => {
        navigate(`/customer/${clientId}/ticket/${ticket.id}`, {state: {fromPath: `/customer/${clientId}/ticket/${ticket.id}`}});
    };

    const handleClose = () => {
        navigate(`/customer/${clientId}`);
        setTicketModal(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        {'Tickets'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddTicketModal(true)}>Add Ticket</Button>
                </Col>
            </Row>

            {tickets.length > 0 ? (
                <>
                    <Row className="row-margin-0 fw-bold mt-2">
                        <Col md={2}>No</Col>
                        <Col md={3}>Title</Col>
                        <Col md={2}>Date</Col>
                        <Col md={2}>Location</Col>
                        <Col className="d-flex justify-content-center" md={2}>Status</Col>
                        <Col className="d-flex justify-content-center" md={1}>Priority</Col>
                    </Row>
                    <hr />
                    {tickets.map((ticket, index) => {
                        const status = statusMap[ticket.statusId];
                        const priorityColor = ticket.crisis ? 'red' : 'green';
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

                        return (
                            <Row
                                key={ticket.id}
                                className="align-items-center"
                                style={{ cursor: 'pointer', margin: "0 0" }}
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <Col className="py-1" style={{ backgroundColor: rowBgColor }}>
                                    <Row className="align-items-center">
                                        <Col md={2}>{ticket.baitNumeration || 'N/A'}</Col>
                                        <Col md={3}>{ticket.title}</Col>
                                        <Col md={2}>{formatDate(ticket.startDateTime)}</Col>
                                        <Col md={2}>{locations[ticket.locationId] || 'Unknown Location'}</Col>
                                        <Col className="d-flex justify-content-center" md={2}>
                                            <Button
                                                style={{
                                                    minWidth: "75px",
                                                    backgroundColor: status?.color || '#007bff',
                                                    borderColor: status?.color || '#007bff',
                                                }}
                                                disabled
                                            >
                                                {status?.status || 'Unknown Status'}
                                            </Button>
                                        </Col>
                                        <Col className="d-flex justify-content-center" md={1}>
                                            <Button
                                                style={{
                                                    backgroundColor: priorityColor,
                                                    borderColor: priorityColor,
                                                }}
                                                disabled
                                            ></Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            ) : (
                <Alert variant="info">No tickets found for this client.</Alert>
            )}

            {ticketModal && ticket && statuses.length > 0 && !loading && (
                <NewTicket
                    show={ticketModal}
                    onClose={handleClose}
                    firstTicket={ticket}
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                    reFetch={fetchTickets}
                    clientId={clientId}
                />
            )}
            <AddTicketModal
                show={showAddTicketModal}
                handleClose={() => setShowAddTicketModal(false)}
                reFetch={fetchTickets}
                clientId={clientId}
            />
        </>
    );
}

export default ClientTickets;
