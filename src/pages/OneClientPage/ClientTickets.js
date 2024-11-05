import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/Customers.css';
import config from '../../config/config';
import NewTicket from '../TicketsPage/SingleTicketModal/NewTicket';

function ClientTickets({ tickets, statusMap, clientId, setTickets }) {
    const navigate = useNavigate();
    const [ticketModal, setTicketModal] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [closedStatusId, setClosedStatusId] = useState("");
    const [locations, setLocations] = useState({});

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const handleTicketClick = (ticket) => {
        setTicket(ticket);
        setTicketModal(true);
        fetchStatuses();
    };
    const fetchTickets = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/client/${clientId}`)
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching Customer Tickets", error);
        }
    }

    const fetchStatuses = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
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
            const response = await axios.get(`${config.API_BASE_URL}/location/all`);
            const locationsData = response.data.reduce((acc, location) => {
                acc[location.id] = location.name;
                return acc;
            }, {});
            setLocations(locationsData);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleClose = () => {
        setTicketModal(false);
    };

    return (
        <>
            <Row className="mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        Tickets
                    </h2>
                </Col>
            </Row>
            {tickets.length > 0 ? (
                <>
                    {/* Table header with columns */}
                    <Row className="font-weight-bold text-center mt-2">
                        <Col md={2}>No</Col>
                        <Col md={2}>Title</Col>
                        <Col md={2}>Date</Col>
                        <Col md={2}>Location</Col>
                        <Col md={2}>Status</Col>
                        <Col md={2}>Priority</Col>
                    </Row>
                    <hr />

                    {/* Tickets row structure */}
                    {tickets.map((ticket, index) => {
                        const status = statusMap[ticket.statusId];
                        const priorityColor = ticket.crisis ? 'red' : 'green';
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

                        return (
                            <Row
                                key={ticket.id}
                                className="align-items-center text-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <Col md={2}>{ticket.baitNumeration || 'N/A'}</Col>
                                <Col md={2}>{ticket.title}</Col>
                                <Col md={2}>{formatDate(ticket.startDateTime)}</Col>
                                <Col md={2}>{locations[ticket.locationId] || 'Unknown Location'}</Col>
                                <Col md={2}>
                                    <Button
                                        style={{
                                            backgroundColor: status?.color || '#007bff',
                                            borderColor: status?.color || '#007bff',
                                        }}
                                        disabled
                                    >
                                        {status?.status || 'Unknown Status'}
                                    </Button>
                                </Col>
                                <Col md={2}>
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
            ) : (
                <Alert variant="info">No tickets found for this client.</Alert>
            )}

            {/* Modal for ticket details */}
            {ticketModal && ticket && statuses.length > 0 && (
                <NewTicket
                    show={ticketModal}
                    onClose={handleClose}
                    firstTicket={ticket}
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                    reFetch={fetchTickets}
                />
            )}
        </>
    );
}

export default ClientTickets;
