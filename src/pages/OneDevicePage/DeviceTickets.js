// src/pages/OneDevicePage/DeviceTickets.js

import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import config from '../../config/config';
import NewTicket from '../TicketsPage/SingleTicketModal/NewTicket';

function DeviceTickets({ deviceId }) {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [ticketModal, setTicketModal] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [closedStatusId, setClosedStatusId] = useState('');
    const [locations, setLocations] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    const { ticketId } = useParams();

    useEffect(() => {
        fetchData();
    }, [deviceId]);

    useEffect(() => {
        if (ticketId) {
            loadTicketDataById(ticketId);
        } else {
            setTicketModal(false);
            setTicket(null);
        }
    }, [ticketId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, statusesRes, locationsRes] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/device/tickets/${deviceId}`),
                axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                axios.get(`${config.API_BASE_URL}/location/all`)
            ]);

            const fetchedTickets = ticketsRes.data;
            const fetchedStatuses = statusesRes.data;
            const fetchedLocations = locationsRes.data;

            // Create status map
            const mappedStatuses = fetchedStatuses.reduce((acc, status) => {
                acc[status.id] = status;
                return acc;
            }, {});

            // Create locations map
            const locationMap = fetchedLocations.reduce((acc, loc) => {
                acc[loc.id] = loc.name;
                return acc;
            }, {});

            // Identify closed status if needed
            const closed = fetchedStatuses.find((s) => s.status === 'Closed');
            const closedId = closed ? closed.id : '';

            setTickets(fetchedTickets);
            setStatuses(fetchedStatuses);
            setStatusMap(mappedStatuses);
            setLocations(locationMap);
            setClosedStatusId(closedId);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchTickets = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/tickets/${deviceId}`)
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets", error);
        }
    }

    const loadTicketDataById = async (id) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/${id}`);
            setTicket(response.data);
            if (statuses.length === 0) await fetchData(); // Ensure statuses and maps are loaded
            setTicketModal(true);
        } catch (err) {
            console.error('Error fetching ticket by ID:', err);
        }
    };

    const handleClose = () => {
        // Navigate back to device page without the ticketId in the URL
        navigate(`/device/${deviceId}`, {state: {fromPath: location.state?.fromPath}});
        setTicketModal(false);
        setTicket(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const handleTicketClick = (ticket) => {
        navigate(`/device/${deviceId}/ticket/${ticket.id}`, {state: {fromPath: location.state?.fromPath}});
        setTicketModal(true);
    };

    if (loading) {
        return (
            <div className="text-center mt-3">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">Error: {error}</Alert>;
    }

    return (
        <>
            <Row className="row-margin-0 mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>Tickets</h2>
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
                <Alert variant="info">No tickets found for this device.</Alert>
            )}

            {ticketModal && ticket && statuses.length > 0 && !loading && (
                <NewTicket
                    show={ticketModal}
                    onClose={handleClose}
                    firstTicket={ticket}
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                    reFetch={fetchTickets} // Re-fetch device tickets after update
                    clientId={ticket.clientId} // Or pass deviceId if needed
                />
            )}
        </>
    );
}

export default DeviceTickets;
