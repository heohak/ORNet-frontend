import React, {useState} from 'react';
import { Container, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../css/Customers.css';
import axios from "axios";
import config from "../../config/config";
import NewTicket from "../TicketsPage/SingleTicketModal/NewTicket";

function ClientTickets({tickets, statusMap}) {
    const navigate = useNavigate();
    const [ticketModal, setTicketModal] = useState(false);
    const [ticket, setTicket] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [closedStatusId, setClosedStatusId] = useState("");

    const handleTicketClick = (ticket) => {
        setTicket(ticket);
        setTicketModal(true);
        fetchStatuses();
    };

    const handleClose = () => {
        setTicketModal(false);
    }

    const fetchStatuses = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`)
            const fetchedStatuses = response.data;
            setStatuses(fetchedStatuses);
            if (fetchedStatuses.length > 0) {
                // Filter close status
                const closed = statuses.find(status => status.status === 'Closed');
                if (closed) {
                    setClosedStatusId(closed.id);
                }
            }
        } catch (error) {
            console.error('Error fetching statuses', error);
        }
    };

    return (
        <Container className="mt-1">
            <h2>Tickets</h2>
            {tickets.length > 0 ? (
                <Row className="mt-2">
                    {tickets.map(ticket => {
                        const status = statusMap[ticket.statusId]; // Get status from statusMap
                        return (
                            <Col md={4} key={ticket.id} className="mb-3"> {/* Adjust column size as needed */}
                                <Card
                                    className="h-100 position-relative all-page-card"
                                    style={{ cursor: 'pointer', borderRadius: '20px' }}
                                    onClick={() => handleTicketClick(ticket)}
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
            {ticketModal && ticket && statuses.length > 0 && (
                <NewTicket
                    show={ticketModal}
                    onClose={handleClose}
                    firstTicket={ticket} // Pass the selected ticket to NewTicket
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                />
            )}
        </Container>
    );
}

export default ClientTickets;
