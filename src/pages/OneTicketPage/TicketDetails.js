import React from 'react';
import { Accordion, Card, Row, Col } from "react-bootstrap";
import TicketForm from './TicketForm';

function TicketDetails({
                           ticket,
                           expandedTickets,
                           expandedSections,
                           toggleTicketExpansion,
                           toggleSectionExpansion,
                           editFields,
                           setEditFields,
                           handleSave,
                           ticketRefs
                       }) {
    return (
        <Accordion key={ticket.id} activeKey={expandedTickets.has(ticket.id.toString()) ? ticket.id.toString() : null}>
            <Card ref={(el) => (ticketRefs.current[ticket.id] = el)} className="mb-4">
                <Accordion.Item eventKey={ticket.id.toString()}>
                    <Accordion.Header onClick={() => toggleTicketExpansion(ticket.id.toString())}>
                        Ticket ID: {ticket.id}
                    </Accordion.Header>
                    <Accordion.Body>
                        <Card.Body>
                            <Accordion activeKey={expandedSections[ticket.id]?.dates ? "0" : null}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'dates')}>Dates</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col>
                                                <p><strong>Start Date Time:</strong> {ticket.startDateTime}</p>
                                                <p><strong>End Date Time:</strong> {ticket.endDateTime}</p>
                                                <p><strong>Response Date Time:</strong> {ticket.responseDateTime}</p>
                                                <p><strong>Update Time:</strong> {ticket.update_time}</p>
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Accordion activeKey={expandedSections[ticket.id]?.details ? "1" : null}>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'details')}>Details</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Crisis:</strong> {ticket.crisis ? 'True' : 'False'}</p>
                                                <p><strong>Remote:</strong> {ticket.remote ? 'True' : 'False'}</p>
                                                <p><strong>Work Type:</strong> {ticket.workType}</p>
                                                <p><strong>Responsible ID:</strong> {ticket.baitWorkerId}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Client Name:</strong> {ticket.clientName}</p>
                                                <p><strong>Location ID:</strong> {ticket.locationId}</p>
                                                <p><strong>Status ID:</strong> {ticket.statusId}</p>
                                                <p><strong>Root Cause:</strong> {ticket.rootCause}</p>
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Title className="mt-4">Description</Card.Title>
                            <Card className="mb-4 mt-1">
                                <Card.Body>
                                    <Card.Text>{ticket.description}</Card.Text>
                                </Card.Body>
                            </Card>
                            <TicketForm
                                ticket={ticket}
                                editFields={editFields}
                                setEditFields={setEditFields}
                                handleSave={handleSave}
                            />
                        </Card.Body>
                    </Accordion.Body>
                </Accordion.Item>
            </Card>
        </Accordion>
    );
}

export default TicketDetails;
