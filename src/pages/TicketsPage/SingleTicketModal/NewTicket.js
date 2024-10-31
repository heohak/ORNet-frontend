import React, {useEffect, useState} from 'react';
import {Modal, Col, Row, Badge} from 'react-bootstrap';

import NewTicketDetails from "./NewTicketDetails";
import NewTicketFiles from "./NewTicketFiles";
import NewTicketDescription from "./NewTicketDescription";
import NewTicketRootCause from "./NewTicketRootCause";
import NewTicketStatusDropdown from "./NewTicketStatusDropdown";
import NewTicketActivity from "./NewTicketActivity";
import NewTicketInsideInfo from "./NewTicketInsideInfo";
import NewTicketResponse from "./NewTicketResponse";
import axios from "axios";
import config from "../../../config/config";
import ToggleSwitch from "./ToggleSwitch";
import TicketSectionButtons from "./TicketSectionButtons";
import '../../../css/NewTicket.css';
import { FaTrash } from "react-icons/fa";
import TicketDeleteModal from "./TicketDeleteModal"; // Import trash icon

const NewTicket = ({ firstTicket, onClose, statuses, isTicketClosed, reFetch }) => {
    const [ticket, setTicket] = useState(firstTicket);
    const [activeKey, setActiveKey] = useState('0');
    const [isClosed, setIsClosed] = useState(isTicketClosed);
    const [activeSection, setActiveSection] = useState('activity');
    const [locationName, setLocationName] = useState('');
    const [paidTime, setPaidTime] = useState(ticket.paidTime);
    const [timeSpent, setTimeSpent] = useState(ticket.timeSpent);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    useEffect(() => {
        setTimeSpent(ticket.timeSpent);
        setPaidTime(ticket.paidTime);
    }, [ticket.timeSpent, ticket.paidTime])

    useEffect( () => {
        fetchLocationName()
        },[ticket.locationId]);

    const reFetchTicket = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/${ticket.id}`)
            setTicket(response.data);
        } catch (error) {
            console.error("Error fetching ticket", error)
        }
    }

    const fetchLocationName = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/location/${ticket.locationId}`);
            setLocationName(response.data.name);
        } catch (error) {
            console.error('Error fetching location', error);
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
    };
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

    const formatTime = (timeString) => {
        if (!timeString) {
            return "0H 0M"
        }
        // Assuming timeString is in ISO 8601 duration format like "PT1H1M"
        const match = timeString.match(/PT(\d+H)?(\d+M)?/);
        const hours = match[1] ? match[1].replace('H', '') : '0';
        const minutes = match[2] ? match[2].replace('M', '') : '0';

        return `${hours}H ${minutes}M`;
    };

    const handleDelete = async() => {
        await axios.delete(`${config.API_BASE_URL}/ticket/delete/${ticket.id}`);
        reFetch();
        onClose();
    }


    return (
        <Modal id="custom-modal" show onHide={onClose} className="custom-width-modal" dialogClassName="custom-modal">
            <Modal.Header closeButton>
                <div className="w-100">
                    <Modal.Title>{ticket.title} {ticket.crisis && <Badge bg="danger">Priority</Badge>}</Modal.Title>
                    <p className="text-muted mb-0">{ticket.clientName}</p>
                    <p className="text-muted mb-0">{locationName}</p>
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
                        <TicketSectionButtons activeSection={activeSection} onSectionChange={setActiveSection}/>
                        {activeSection === 'activity' && <NewTicketActivity ticket={ticket} reFetch={reFetchTicket} />}
                        {activeSection === 'info' && <NewTicketInsideInfo ticket={ticket} />}
                        {/*{activeSection === 'response' && <NewTicketResponse ticket={ticket} />}*/}
                    </Col>
                    <Col md={4}>
                        <Row className="mb-2 justify-content-between">
                            <Col className="col-md-auto">
                                <div className="d-flex align-items-center">
                                    <Col className="col-md-auto">
                                        <NewTicketStatusDropdown
                                            statuses={statuses}
                                            ticket={ticket}
                                            setIsClosed={setIsClosed}
                                            reFetch={reFetchTicket}
                                        />
                                    </Col>
                                    <Col className="col-md-auto px-2">
                                        <ToggleSwitch ticket={ticket} reFetch={reFetchTicket} />
                                    </Col>
                                </div>
                            </Col>
                            <Col className="col-md-auto"> {/* Aligns trash icon to the right */}
                                <FaTrash
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowDeleteModal(true)} // Add your delete function here
                                    title="Delete Ticket"
                                    className="text-danger" // Optional: add a color class
                                />
                            </Col>
                        </Row>

                        <NewTicketDetails
                            ticket={ticket}
                            activeKey={activeKey}
                            handleAccordionToggle={handleAccordionToggle}
                            eventKey="0"
                            reFetch={reFetchTicket}
                        />
                        <NewTicketFiles
                            ticket={ticket}
                            activeKey={activeKey}
                            handleAccordionToggle={handleAccordionToggle}
                            eventKey="2"
                        />
                        {isClosed ? (
                            <p className="mb-0">Closed: {formatDateString(ticket.endDateTime)}</p>
                            ) : (
                            <p className="mb-0">
                                Been Open For: {formatTimeDiff(Date.now() - new Date(ticket.startDateTime))}
                            </p>
                            )}
                        <p className="mb-0">Time Spent: {formatTime(timeSpent)}</p>
                        <p className="mb-0">Paid Time: {formatTime(paidTime)}</p>

                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
            <TicketDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
            />
        </Modal>
    );
};

export default NewTicket;
