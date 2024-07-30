import React from 'react';
import { Container, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ClientTickets({client,tickets}) {
    const navigate = useNavigate();

    const handleTicketClick = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    return (
        <Container className="mt-5">
            <h2>Tickets</h2>
            {tickets.length > 0 ? (
                <ListGroup>
                    {tickets.map(ticket => (
                        <ListGroup.Item
                            key={ticket.id}
                            style={{ borderTopWidth: 1, borderRadius: 20, cursor: 'pointer' }}
                            className="d-flex justify-content-between align-items-center mb-4"
                            onClick={() => handleTicketClick(ticket.id)}
                        >
                            <h3 style={{color: "#0000EE"}}>{ticket.title}</h3>
                            <Badge bg={ticket.statusId === 1 ? 'success' : 'danger'}>
                                {ticket.statusId === 1 ? 'open' : 'closed'}
                            </Badge>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert variant="info">No tickets found for this client.</Alert>
            )}
        </Container>
    );
}

export default ClientTickets;
