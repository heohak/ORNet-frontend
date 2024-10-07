import React, {useState} from 'react';
import {Modal, Button, Col, Row} from 'react-bootstrap';

import NewTicketDetails from "./NewTicketDetails";
import NewTicketFiles from "./NewTicketFiles";
import NewTicketDescription from "./NewTicketDescription";
import NewTicketRootCause from "./NewTicketRootCause";
import NewTicketStatusDropdown from "./NewTicketStatusDropdown";
import NewTicketActivity from "./NewTicketActivity";
import NewTicketInsideInfo from "./NewTicketInsideInfo";
import NewTicketResponse from "./NewTicketResponse";
import '../../../../css/NewTicket.css';
import axios from "axios";
import config from "../../../../config/config";

const NewTicket = ({ ticket, onClose, statuses, isTicketClosed }) => {
    const [activeKey, setActiveKey] = useState('0');
    const [isClosed, setIsClosed] = useState(isTicketClosed);
    const [activeSection, setActiveSection] = useState('activity');

    const reFetchTicket = async() => {
        try {
            const response = await axios.get(`${config.BASE_API_URL}/ticket/${ticket.id}`)
        } catch (error) {
            console.error("Error fetching ticket", error)
        }
    }


    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle the accordion
    };

    const formatTimeDiff = (diffInMs) => {
        const minutes = Math.floor(diffInMs / (1000 * 60)) % 60;
        const hours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;
        const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // Build the formatted time string conditionally
        let result = '';
        if (days > 0) {
            result += `${days} day${days > 1 ? 's' : ''}, `;
        }
        if (hours > 0 || days > 0) {
            result += `${hours} hour${hours > 1 ? 's' : ''}, `;
        }
        result += `${minutes} minute${minutes > 1 ? 's' : ''}`;

        return result;
    }

    const formatDateString = (dateString) => {
        const date = new Date(dateString);

        // Get parts of the date
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        };

        // Format date into a readable string
        return date.toLocaleString('en-US', options);
    }



    return (
        <Modal show onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <div className="w-100">
                    <Modal.Title>{ticket.title}</Modal.Title>
                    <p className="text-muted mb-0">{ticket.name}</p>
                    <p className="text-muted mb-0">Client: {ticket.clientName}</p>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <NewTicketDescription
                            ticket={ticket}
                        />
                        {isClosed && (
                            <NewTicketRootCause
                                ticket={ticket}
                            />
                        )}
                        <div className="activityButtonsSection">
                            <Button
                                onClick={() => setActiveSection('activity')}
                                size="sm"
                                className="activityButtons ms-2"
                            >
                                Activity
                            </Button>
                            <Button
                                onClick={() => setActiveSection('info')}
                                size="sm"
                                className="activityButtons ms-2"
                            >
                                Inside Info
                            </Button>
                            <Button
                                onClick={() => setActiveSection('response')}
                                size="sm"
                                className="activityButtons ms-2"
                            >
                                Response
                            </Button>
                        </div>
                        {activeSection === 'activity' && <NewTicketActivity ticketId={ticket.id} />}
                        {activeSection === 'info' && <NewTicketInsideInfo ticket={ticket} />}
                        {activeSection === 'response' && <NewTicketResponse ticket={ticket} />}
                    </Col>
                    <Col md={4}>
                        <NewTicketStatusDropdown
                            statuses={statuses}
                            ticket={ticket}
                            setIsClosed={setIsClosed}
                        />
                       <NewTicketDetails
                           ticket={ticket}
                           activeKey={activeKey}
                           handleAccordionToggle={handleAccordionToggle}
                           eventKey="0"
                       />
                        <NewTicketFiles
                            ticket={ticket}
                            activeKey={activeKey}
                            handleAccordionToggle={handleAccordionToggle}
                            eventKey="1"
                        />
                        {isClosed ? (
                            <p className="mb-0">Closed: {formatDateString(ticket.endDateTime)}</p>
                            ) : (
                            <p className="mb-0">
                                Been Open For: {formatTimeDiff(Date.now() - new Date(ticket.startDateTime))}
                            </p>
                            )}
                        <p className="mb-0">Created: {formatDateString(ticket.startDateTime)}</p>
                        <p>Updated: {formatDateString(ticket.updateDateTime)}</p>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
};

export default NewTicket;
