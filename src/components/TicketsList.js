// TicketsList.js
import React from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';

const TicketsList = ({ tickets, loading, onNavigate, error, statuses }) => {
    if (loading) {
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
                                    <strong>Client ID:</strong> {ticket.clientId}<br />
                                    <strong>Main Ticket ID:</strong> {ticket.mainTicketId}
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
