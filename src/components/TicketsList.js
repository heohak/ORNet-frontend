import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../config/config";

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

    return (
        <Row>
            {tickets.map((ticket) => {
                const statusName = statuses.find(status => status.id === ticket.statusId)?.status || 'Unknown Status';
                const clientName = clientDetails[ticket.clientId] || 'Unknown Client';

                return (
                    <Col md={4} key={ticket.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Button
                                        variant={ticket.statusId === 1 ? "success" : "danger"}
                                        size=""
                                        disabled
                                    >
                                        {statusName}
                                    </Button>
                                </div>
                                <Card.Title>{ticket.title}</Card.Title>
                                <Card.Text>
                                    <strong>Client:</strong> {clientName}<br />
                                </Card.Text>
                                <Button onClick={() => onNavigate(ticket.id)}>View Ticket</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default TicketsList;
