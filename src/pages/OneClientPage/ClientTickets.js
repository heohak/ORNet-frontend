import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Alert, Button, Card } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';
import { DateUtils } from "../../utils/DateUtils";
import '../../css/Customers.css';
import '../../css/OneClientPage/OneClient.css';
import NewTicket from '../TicketsPage/SingleTicketModal/NewTicket';
import AddTicketModal from "../TicketsPage/AddTicketModal/AddTicketModal";

function ClientTickets({ tickets, statusMap, clientId, setTickets, isMobile }) {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [ticketModal, setTicketModal] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [closedStatusId, setClosedStatusId] = useState("");
    const [locations, setLocations] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAddTicketModal, setShowAddTicketModal] = useState(false);

    // Load statuses on mount
    useEffect(() => {
        fetchStatuses();
    }, []);

    // When ticketId changes, load ticket data
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
            const closed = fetchedStatuses.find((status) => status.status === 'Closed');
            if (closed) setClosedStatusId(closed.id);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
            const locs = response.data.reduce((acc, location) => {
                acc[location.id] = location.name;
                return acc;
            }, {});
            setLocations(locs);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    // Load locations on mount
    useEffect(() => {
        fetchLocations();
    }, []);

    const handleTicketClick = (ticket) => {
        navigate(`/customer/${clientId}/ticket/${ticket.id}`, { state: { fromPath: `/customer/${clientId}/ticket/${ticket.id}` } });
    };

    const handleClose = () => {
        navigate(`/customer/${clientId}`);
        setTicketModal(false);
    };

    // Helper function to get location name by locationId
    const getLocationName = (locationId) => {
        return locations[locationId] || 'Unknown Location';
    };

    // Retrieve last visited ticket ID from localStorage for highlighting
    const lastVisitedTicketId = localStorage.getItem("lastVisitedTicketId");

    return (
        <>
            {/* Header: Title and Add Ticket button on one line */}
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>Tickets</h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddTicketModal(true)}>
                        Add Ticket
                    </Button>
                </Col>
            </Row>

            {tickets.length > 0 ? (
                isMobile ? (
                    // Mobile view: Render each ticket as a Card
                    tickets.map((ticket) => {
                        const status = statusMap[ticket.statusId];
                        const statusName = status?.status || 'Unknown Status';
                        const statusColor = status?.color || '#007bff';
                        const priorityColor = ticket.crisis ? 'red' : 'green';
                        return (
                            <Card
                                key={ticket.id}
                                className="mb-3"
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: ticket.id.toString() === lastVisitedTicketId ? "#ffffcc" : "inherit"
                                }}
                                onClick={() => {
                                    localStorage.setItem("lastVisitedTicketId", ticket.id);
                                    handleTicketClick(ticket);
                                }}
                            >
                                <Card.Body>
                                    <Card.Title>{ticket.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {DateUtils.formatDate(ticket.startDateTime)} | {ticket.baitNumeration || 'N/A'}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <div>
                                            <strong>Location:</strong> {getLocationName(ticket.locationId)}
                                        </div>
                                        <div className="mt-2">
                                            <strong>Status:</strong>
                                            <span style={{ marginLeft: '10px' }}>
                        <Button
                            style={{
                                minWidth: "75px",
                                backgroundColor: statusColor,
                                borderColor: statusColor
                            }}
                            disabled
                        >
                          {statusName}
                        </Button>
                      </span>
                                        </div>
                                        <div className="mt-2">
                                            <strong>Priority:&nbsp;</strong>
                                            <span style={{ marginLeft: '10px' }}>
                        <Button
                            style={{
                                backgroundColor: priorityColor,
                                borderColor: priorityColor,
                            }}
                            disabled
                        ></Button>
                      </span>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        );
                    })
                ) : (
                    // Desktop view: Render tickets as rows with a header row
                    <>
                        <Row className="fw-bold">
                            <Col md={2}>No</Col>
                            <Col md={3}>Title</Col>
                            <Col md={2}>Date</Col>
                            <Col md={2}>Location</Col>
                            <Col md={2} className="d-flex justify-content-center">Status</Col>
                            <Col md={1} className="d-flex justify-content-center">Priority</Col>
                        </Row>
                        <hr />
                        {tickets.map((ticket, index) => {
                            const status = statusMap[ticket.statusId];
                            const statusName = status?.status || 'Unknown Status';
                            const statusColor = status?.color || '#007bff';
                            const priorityColor = ticket.crisis ? 'red' : 'green';
                            const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                            const rowBgColor = ticket.id.toString() === lastVisitedTicketId ? "#ffffcc" : baseBgColor;
                            return (
                                <Row
                                    key={ticket.id}
                                    className="align-items-center py-1"
                                    style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                    onClick={() => {
                                        localStorage.setItem("lastVisitedTicketId", ticket.id);
                                        handleTicketClick(ticket);
                                    }}
                                >
                                    <Col md={2}>{ticket.baitNumeration || 'N/A'}</Col>
                                    <Col md={3}>{ticket.title}</Col>
                                    <Col md={2}>{DateUtils.formatDate(ticket.startDateTime)}</Col>
                                    <Col md={2}>{getLocationName(ticket.locationId)}</Col>
                                    <Col md={2} className="d-flex justify-content-center">
                                        <Button
                                            style={{
                                                minWidth: "75px",
                                                backgroundColor: statusColor,
                                                borderColor: statusColor
                                            }}
                                            disabled
                                        >
                                            {statusName}
                                        </Button>
                                    </Col>
                                    <Col md={1} className="d-flex justify-content-center">
                                        <Button
                                            style={{
                                                backgroundColor: priorityColor,
                                                borderColor: priorityColor,
                                            }}
                                            disabled
                                        ></Button>
                                    </Col>
                                </Row>
                            );
                        })}
                    </>
                )
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
                statuses={statuses}
            />
        </>
    );
}

export default ClientTickets;
