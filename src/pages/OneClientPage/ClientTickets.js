import React from 'react';
import { Container, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../css/Customers.css';

function ClientTickets({tickets, statusMap}) {
    const navigate = useNavigate();

    const handleTicketClick = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    return (
        <Container className="mt-3">
            <h2>Tickets</h2>
            {tickets.length > 0 ? (
                <Row className="mt-3">
                    {tickets.map(ticket => {
                        const status = statusMap[ticket.statusId]; // Get status from statusMap
                        return (
                            <Col md={4} key={ticket.id} className="mb-4"> {/* Adjust column size as needed */}
                                <Card
                                    className="h-100 position-relative all-page-card"
                                    style={{ cursor: 'pointer', borderRadius: '20px' }}
                                    onClick={() => handleTicketClick(ticket.id)}
                                >
                                    <Card.Body className="all-page-cardBody">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Card.Title className='all-page-cardTitle' style={{ marginBottom: 0 }}>{ticket.title}</Card.Title>
                                            {status && (
                                                <Badge
                                                    bg={status.color ? "none" : "primary"}
                                                    style={{ backgroundColor: status.color }}
                                                >
                                                    {status.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <Alert variant="info">No tickets found for this client.</Alert>
            )}
        </Container>
    );
}

export default ClientTickets;
