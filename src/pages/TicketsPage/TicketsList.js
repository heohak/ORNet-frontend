import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

const TicketsList = ({ tickets, loading, onNavigate, error, statuses }) => {
    const [clientDetails, setClientDetails] = useState({});
    const [clientLoading, setClientLoading] = useState(true);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const clientIds = tickets.map(ticket => ticket.clientId);
                const uniqueClientIds = [...new Set(clientIds)];

                const clientDetailsResponses = await Promise.all(uniqueClientIds.map(clientId =>
                    axios.get(`${config.API_BASE_URL}/client/${clientId}`)
                ));

                const clientDetailsMap = {};
                clientDetailsResponses.forEach(response => {
                    const client = response.data;
                    clientDetailsMap[client.id] = client.fullName;
                });

                setClientDetails(clientDetailsMap);
                setClientLoading(false);
            } catch (error) {
                console.error('Error fetching client details:', error);
                setClientLoading(false);
            }
        };

        if (tickets.length > 0) {
            fetchClientDetails();
        } else {
            setClientLoading(false); // No tickets to fetch, stop loading
        }
    }, [tickets]);

    if (loading || clientLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="mt-5">
                <Alert variant="info">
                    No tickets found.
                </Alert>
            </div>
        );
    }

    return (
        <Row>
            {tickets.map((ticket) => {
                const status = statuses.find(status => status.id === ticket.statusId);
                const statusName = status?.status || 'Unknown Status';
                const clientName = clientDetails[ticket.clientId] || 'Unknown Client';
                const statusColor = status.color;

                return (
                    <Col md={4} key={ticket.id} className="mb-4">
                        <Card className='all-page-card' onClick={() => onNavigate(ticket.id)}>
                            <Card.Body className='all-page-cardBody'>
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Button
                                        style={{ backgroundColor: statusColor || "#007bff", borderColor: statusColor || "#007bff" }}
                                        size=""
                                        disabled
                                    >
                                        {statusName}
                                    </Button>
                                </div>
                                <Card.Title className='all-page-cardTitle'>{ticket.title}</Card.Title>
                                <Card.Text className='all-page-cardText'>
                                    <strong>Client:</strong> {clientName}<br />
                                    <strong>Start Time:</strong> {ticket.startDateTime}<br />
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default TicketsList;
