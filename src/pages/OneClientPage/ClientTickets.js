import React from 'react';
import { Container, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ClientTickets({tickets, statusMap}) {
    const navigate = useNavigate();

    const handleTicketClick = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    return (
        <Container className="mt-5">
            <h2>Tickets</h2>
            {tickets.length > 0 ? (
                <ListGroup>
                    {tickets.map(ticket => {
                        const status = statusMap[ticket.statusId]; // Get status from statusMap
                        console.log(status);
                        return (
                            <ListGroup.Item
                                key={ticket.id}
                                style={{ borderTopWidth: 1, borderRadius: 20, cursor: 'pointer' }}
                                className="d-flex justify-content-between align-items-center mb-4"
                                onClick={() => handleTicketClick(ticket.id)}
                            >
                                <h3 style={{color: "#0000EE"}}>{ticket.title}</h3>
                                {status && (
                                    <Badge bg={status.color ? "none" : "primary"} style={{ backgroundColor: status.color }}>
                                        {status.status}
                                    </Badge>
                                )}
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            ) : (
                <Alert variant="info">No tickets found for this client.</Alert>
            )}
        </Container>
    );
}

export default ClientTickets;
