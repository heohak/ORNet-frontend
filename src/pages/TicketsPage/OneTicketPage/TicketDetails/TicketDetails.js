import React, { useState, useEffect } from 'react';
import { Accordion, Container, Card, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import ClientWorkersModal from "./ClientWorkersModal";
import WorkTypeModal from "./WorkTypeModal";
import TicketFileList from "./TicketFileList";
import MaintenanceModal from "./MaintenanceModal";
import config from "../../../../config/config";
import 'react-datetime/css/react-datetime.css';
import "../../../../css/TicketDetails.css"
import Datetime from "react-datetime";
import moment from 'moment';
import {useNavigate} from "react-router-dom";

const TicketDetails = ({
                           ticket,
                           expandedTickets,
                           expandedSections,
                           toggleTicketExpansion,
                           toggleSectionExpansion,
                           editFields,
                           setEditFields,
                           handleSave,
                           ticketRefs,
                            handleAddTicket
                       }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showWorkersModal, setShowWorkersModal] = useState(false); // Add state for showing workers modal
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [contacts, setContacts] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [responsibleName, setResponsibleName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [statusName, setStatusName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [workTypes, setWorkTypes] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
    const [paidInfo, setPaidInfo] = useState({});
    const [timeInputs, setTimeInputs] = useState({});
    const [maintenances, setMaintenances] = useState ([]);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [notification, setNotification] = useState('');
    const [closedStatus, setClosedStatus] = useState(null);
    const [openStatus, setOpenStatus] = useState(null);
    const navigate = useNavigate();




    useEffect(() => {
        if (isEditing) {
            setEditFields((prevFields) => ({
                ...prevFields,
                [ticket.id]: {
                    startDateTime: ticket.startDateTime || '',
                    endDateTime: ticket.endDateTime || '',
                    responseDateTime: ticket.responseDateTime || '',
                    updateDateTime: ticket.updateDateTime || '',
                    crisis: ticket.crisis || false,
                    remote: ticket.remote || false,
                    workTypeIds: ticket.workTypeIds || [],
                    baitWorkerId: ticket.baitWorkerId || '',
                    clientId: ticket.clientId || '',
                    locationId: ticket.locationId || '',
                    statusId: ticket.statusId || '',
                    rootCause: ticket.rootCause || '',
                    description: ticket.description || '',
                    response: ticket.response || '',
                    insideInfo: ticket.insideInfo || '',
                    contactIds: ticket.contactIds || [],
                    fileIds: ticket.fileIds || '',
                    baitNumeration: ticket.baitNumeration || '',
                    clientNumeration: ticket.clientNumeration || '',
                    paidWorkId: ticket.paidWorkId || ''
                }
            }));
        }
    }, [isEditing, ticket]);

    useEffect(() => {
        if (expandedTickets.has(ticket.id.toString())) {
            fetchComments(ticket.id);
            fetchContacts(ticket.id);
            fetchNames(ticket.baitWorkerId, ticket.locationId, ticket.statusId, ticket.clientId); // Fetch names
            fetchWorkTypes(ticket.id); // Fetch work types
            fetchMaintenances(ticket.id);
            if (ticket.paidWorkId) {
                fetchPaidInfo(ticket.id);
            }
        }
    }, [expandedTickets]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/all`);
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        const fetchStatuses = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
                setStatuses(response.data);
                if (response.data.length > 0) {
                    const closed = response.data.find(status => status.status === 'Closed');
                    const open = response.data.find(status => status.status === 'Open');
                    if (open) setOpenStatus(open);
                    if (closed) setClosedStatus(closed);
                }
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };
        fetchStatuses();
        if (isEditing) {
            fetchClients();
        }
    }, [isEditing]);

    useEffect(() => {
        const fetchBaitWorkers = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/bait/worker/all`);
                setBaitWorkers(response.data);
            } catch (error) {
                console.error('Error fetching bait workers:', error);
            }
        };

        if (isEditing) {
            fetchBaitWorkers();
        }
    }, [isEditing]);



    useEffect(() => {
        const fetchLocations = async (clientId) => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        if (editFields[ticket.id]?.clientId) {
            fetchLocations(editFields[ticket.id]?.clientId);
        }
    }, [editFields[ticket.id]?.clientId]);

    const fetchComments = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/comment/${ticketId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const fetchMaintenances = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/maintenance/${ticketId}`);
            setMaintenances(response.data);
        } catch (error) {
            console.error ('Error fetching maintenances', error);
        }
    }

    const fetchContacts = async (ticketId) => {
        try{
            const response = await axios.get(`${config.API_BASE_URL}/ticket/contacts/${ticketId}`);
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }

    const fetchNames = async (responsibleId, locationId, statusId, clientId) => {
        try {
            const [responsibleResponse, locationResponse, statusResponse, clientRes] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/bait/worker/${responsibleId}`),
                axios.get(`${config.API_BASE_URL}/location/${locationId}`),
                axios.get(`${config.API_BASE_URL}/ticket/classificator/${statusId}`),
                axios.get(`${config.API_BASE_URL}/client/${clientId}`)
            ]);
            const fullName = responsibleResponse.data.firstName + " " + responsibleResponse.data.lastName;
            setResponsibleName(fullName);
            setLocationName(locationResponse.data.name);
            setStatusName(statusResponse.data.status);
            setCustomerName(clientRes.data.fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchWorkTypes = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/work-types/${ticketId}`);
            setWorkTypes(response.data);
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
    };

    const handleWorkTypeAndContactFetch = async (ticketId) => {
        fetchWorkTypes(ticketId);
        fetchContacts(ticketId);
    };


    const handleAddComment = async () => {
        if (newComment.trim() === "") {
            return;
        }
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/comment/${ticket.id}`, null, {
                params: {
                    comment: newComment
                }
            });
            setNewComment('');
            fetchComments(ticket.id); // Refresh comments
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDatetimeChange = (date, ticketId, field) => {
        setEditFields((prevFields) => ({
            ...prevFields,
            [ticketId]: {
                ...prevFields[ticketId],
                [field]: moment(date).format('YYYY-MM-DDTHH:mm:ss')
            }
        }));
    };



    const handleChange = (e, ticketId) => {
        const { name, value } = e.target;
        setEditFields((prevFields) => ({
            ...prevFields,
            [ticketId]: {
                ...prevFields[ticketId],
                [name]: value
            }
        }));
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };


    const handleMakePaid = async (ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/add/paid-work/${ticketId}`);
            navigate(`/ticket/${ticket.id}?scrollTo=${ticket.id}`);
            window.location.reload();
        } catch (error) {
            console.error('Error making ticket paid:', error);
        }
    };

    const fetchPaidInfo = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/paid-work/${ticketId}`);
            setPaidInfo(prevState => ({ ...prevState, [ticketId]: response.data }));
        } catch (error) {
            console.error('Error fetching paid info:', error);
        }
    };

    const handleTimeInputChange = (ticketId, field, value) => {
        setTimeInputs({
            ...timeInputs,
            [ticketId]: {
                ...timeInputs[ticketId],
                [field]: value,
            },
        });
    };

    const handleAddTime = async (ticketId) => {
        const { hours, minutes } = timeInputs[ticketId] || {};

        try {
            await axios.put(`${config.API_BASE_URL}/ticket/add/time/${ticketId}`, null, {
                params: {
                    hours: hours || 0,
                    minutes: minutes || 0,
                },
            });
            fetchPaidInfo(ticketId);
            renderPaidInfo(ticketId);  //render new info
        } catch (error) {
            console.error('Error adding time:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Options for formatting
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Use 24-hour time
        };

        return date.toLocaleString('en-GB', options); // en-GB for "dd MMM yyyy, HH:mm"
    };

    const formatTime = (timeString) => {
        // Assuming timeString is in ISO 8601 duration format like "PT1H1M"
        const match = timeString.match(/PT(\d+H)?(\d+M)?/);
        const hours = match[1] ? match[1].replace('H', '') : '0';
        const minutes = match[2] ? match[2].replace('M', '') : '0';

        return `${hours}H ${minutes}M`;
    };

    const renderPaidInfo = (ticketId) => {
        const info = paidInfo[ticketId];
        if (!info) return null;

        return (
            <div>
                <p>Paid Start Time: {formatDate(info.startTime)}</p>
                <p>Paid Time Spent: {info.timeSpent ? formatTime(info.timeSpent) : '--:--'}</p>
                <div  style={{display: 'flex'}} >
                    <Form.Group className="me-2">
                        <Form.Control
                            type="number"
                            value={timeInputs[ticketId]?.hours || ''}
                            onChange={(e) => handleTimeInputChange(ticketId, 'hours', e.target.value)}
                            style={{ width: '80px', appearance: 'textfield' }}
                            disabled={info.settled} // Disable if info.settled is true
                        />
                    </Form.Group>
                    <p className="me-4" style={{margin: 0, alignContent: 'center'}}>h</p>
                    <Form.Group className="me-2">
                        <Form.Control
                            type="number"
                            value={timeInputs[ticketId]?.minutes || ''}
                            onChange={(e) => handleTimeInputChange(ticketId, 'minutes', e.target.value)}
                            style={{ width: '80px', appearance: 'textfield' }}
                            disabled={info.settled}
                        />
                    </Form.Group>
                    <p className="me-4" style={{margin: 0, alignContent: 'center'}}>min</p>
                    <Button
                        onClick={() => handleAddTime(ticketId)}
                        disabled={info.settled}
                    >
                        Add
                    </Button>
                </div>
                {info.settled ? (
                    <p>Settled</p>
                    ):(
                <Button className="mt-4" onClick={() => handleSettle(ticketId)} >Settle ticket</Button>
                    )}
            </div>
        );
    };

    const handleSettle = async (ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/settle/${ticketId}`);
            navigate(`/ticket/${ticket.id}?scrollTo=${ticket.id}`);
            window.location.reload();
        } catch (error) {
            console.error("error settling ticket", error);
        }
    };

    const handleCloseTicket = async () => {
        const info = paidInfo[ticket.id];
        let now = new Date();
        now.setHours(now.getUTCHours() + 6);
        if (!info || info.settled) {
            try {
                await axios.put(`${config.API_BASE_URL}/ticket/status/${ticket.id}/${closedStatus.id}`); //2 is the close classificator id
                await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`,{
                    endDateTime: now
                });
                navigate(`/ticket/${ticket.id}?scrollTo=${ticket.id}`);
                window.location.reload();
            } catch (error) {
                console.log("Error closing the ticket", error);
            }
        } else {
            showNotification("Cannot close ticket before it's settled!");
        }
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => {
            setNotification('');
        }, 3000); // Hide notification after 3 seconds
    };

    const handleOpenTicket = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/status/${ticket.id}/${openStatus.id}`);
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`,{
                endDateTime: ""
            });
            navigate(`/ticket/${ticket.id}?scrollTo=${ticket.id}`);
            window.location.reload();
        } catch (error) {
            console.error("Error updating ticket status", error);
        }
    };




    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-4">{customerName} - {locationName} - {ticket.baitNumeration}</h1>
                <Button variant="success" onClick={handleAddTicket} className="mb-4">Add Ticket</Button>
            </div>
        <Container className="ticket-container">
        <Accordion className="ticket-accordion" key={ticket.id} activeKey={expandedTickets.has(ticket.id.toString()) ? ticket.id.toString() : null}>
            <Card ref={(el) => (ticketRefs.current[ticket.id] = el)} className="mb-4">
                <Accordion.Item eventKey={ticket.id.toString()}>
                    <Accordion.Header onClick={() => toggleTicketExpansion(ticket.id.toString())}>
                        <div style={{display: 'flex'}} className="justify-content-between w-100">
                            <span style={{alignContent: 'center'}}>{ticket.title}</span>
                            <Button variant="outline-primary" onClick={(e) => { e.stopPropagation(); toggleEdit(); }}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        {openStatus && closedStatus ? (
                            ticket.statusId === openStatus.id ? (
                                <Button variant="danger" onClick={() => handleCloseTicket()}>Close Ticket</Button>
                            ) : ticket.statusId === closedStatus.id ? (
                                <Button variant="success" onClick={() => handleOpenTicket()}>Open Ticket</Button>
                            ) : null
                        ) : null}
                        {notification && (
                            <div className='notification'>
                                {notification}
                            </div>
                        )}
                        <Card.Body style={{backgroundColor: '#f8f9fa'}}>
                            <Accordion className="ticket-accordion" activeKey={expandedSections[ticket.id]?.dates ? "0" : null}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'dates')}>Dates</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col>
                                                {isEditing ? (
                                                    <>
                                                        <p><strong>Created Date Time:</strong> {formatDate(ticket.startDateTime)}</p>
                                                        {openStatus ? (
                                                        ticket.statusId === openStatus.id ? (
                                                            <p><strong>Closed Date Time:</strong> --:-- --:--</p>
                                                        ) : (
                                                            <p><strong>Closed Date Time:</strong> {ticket.endDateTime ? formatDate(ticket.endDateTime) : 'N/A'}</p>
                                                        )) : null}

                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Response Date Time</Form.Label>
                                                            <Datetime
                                                                value={editFields[ticket.id]?.responseDateTime || ''}
                                                                onChange={(date) => handleDatetimeChange(date, ticket.id, 'responseDateTime')}
                                                                dateFormat="YYYY-MM-DD"
                                                                timeFormat="HH:mm"
                                                            />
                                                        </Form.Group>
                                                        <p><strong>Update Time:</strong> {formatDate(ticket.updateDateTime)}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Created Date Time:</strong> {formatDate(ticket.startDateTime)}</p>
                                                        {openStatus ? (
                                                        ticket.statusId === openStatus.id ? (
                                                            <p><strong>Closed Date Time:</strong> --:-- --:--</p>
                                                        ) : (
                                                            <p><strong>Closed Date Time:</strong> {ticket.endDateTime ? formatDate(ticket.endDateTime) : 'N/A'}</p>
                                                        )) : null}
                                                        <p><strong>Response Date Time:</strong> {ticket.responseDateTime ? formatDate(ticket.responseDateTime) : '--:-- --:--'}</p>
                                                        <p><strong>Update Time:</strong> {formatDate(ticket.updateDateTime)}</p>
                                                    </>
                                                )}
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Accordion className="ticket-accordion" activeKey={expandedSections[ticket.id]?.details ? "1" : null}>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'details')}>Details</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col md={6}>
                                                {isEditing ? (
                                                    <>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Numeration</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="baitNumeration"
                                                                value={editFields[ticket.id]?.baitNumeration || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Crisis</Form.Label>
                                                            <Form.Check
                                                                type="checkbox"
                                                                name="crisis"
                                                                checked={editFields[ticket.id]?.crisis}
                                                                onChange={(e) => handleChange({ target: { name: 'crisis', value: e.target.checked } }, ticket.id)}
                                                                label={editFields[ticket.id]?.crisis ? 'True' : 'False'}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Remote</Form.Label>
                                                            <Form.Check
                                                                type="checkbox"
                                                                name="remote"
                                                                checked={editFields[ticket.id]?.remote}
                                                                onChange={(e) => handleChange({ target: { name: 'remote', value: e.target.checked } }, ticket.id)}
                                                                label={editFields[ticket.id]?.remote ? 'True' : 'False'}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <div>
                                                                <Form.Label>Work Type</Form.Label>
                                                            </div>
                                                            <Button variant="outline-primary" onClick={() => setShowWorkTypeModal(true)}>
                                                                Select Work Types
                                                            </Button>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Responsible Worker</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="baitWorkerId"
                                                                value={editFields[ticket.id]?.baitWorkerId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            >
                                                                <option value="">Select a worker</option>
                                                                {baitWorkers.map(worker => (
                                                                    <option key={worker.id} value={worker.id}>{worker.firstName} {worker.lastName}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <div>
                                                                <Form.Label>Contacts</Form.Label>
                                                            </div>
                                                            <Button variant="outline-primary" onClick={() => setShowWorkersModal(true)}>
                                                                Select Contacts
                                                            </Button>
                                                        </Form.Group>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Numeration:</strong> {ticket.baitNumeration}</p>
                                                        <p><strong>Crisis:</strong> {ticket.crisis ? 'True' : 'False'}</p>
                                                        <p><strong>Remote:</strong> {ticket.remote ? 'True' : 'False'}</p>
                                                        <p><strong>Work Type:</strong> {workTypes.map(workType => `${workType.workType}`).join(', ')}</p>
                                                        <p><strong>Responsible Worker:</strong> {responsibleName}</p>
                                                        <p><strong>Client Workers:</strong> {contacts.map(contact => `${contact.firstName} ${contact.lastName}`).join(', ')}</p>
                                                    </>
                                                )}
                                            </Col>
                                            <Col md={6}>
                                                {isEditing ? (
                                                    <>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Client Numeration</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="clientNumeration"
                                                                value={editFields[ticket.id]?.clientNumeration || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Client</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="clientId"
                                                                value={editFields[ticket.id]?.clientId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                                disabled
                                                            >
                                                                <option value="">Select a client</option>
                                                                {clients.map(client => (
                                                                    <option key={client.id} value={client.id}>{client.fullName}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Location</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="locationId"
                                                                value={editFields[ticket.id]?.locationId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                                disabled={!editFields[ticket.id]?.clientId}
                                                            >
                                                                <option value="">Select a location</option>
                                                                {locations.map(location => (
                                                                    <option key={location.id} value={location.id}>{location.name}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Status</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="statusId"
                                                                value={editFields[ticket.id]?.statusId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            >
                                                                <option value="">Select a status</option>
                                                                {statuses.map(status => (
                                                                    <option key={status.id} value={status.id}>{status.status}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Root Cause</Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                type="text"
                                                                name="rootCause"
                                                                value={editFields[ticket.id]?.rootCause || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Client Numeration:</strong> {ticket.clientNumeration}</p>
                                                        <p><strong>Client:</strong> {ticket.clientName}</p>
                                                        <p><strong>Location:</strong> {locationName}</p>
                                                        <p><strong>Status:</strong> {statusName}</p>
                                                        <p><strong>Root Cause:</strong> {ticket.rootCause}</p>
                                                        {!ticket.paidWorkId ? (
                                                            <Button onClick={() => handleMakePaid(ticket.id)}>Make Paid</Button>
                                                        ) : null}                                                    </>
                                                )}
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* Paid Info Section */}
                            {ticket.paidWorkId ? (
                                <Accordion activeKey={expandedSections[ticket.id]?.paid ? "2" : null}>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'paid')}>
                                            Paid Info
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            {ticket.paidWorkId ? (
                                                <>
                                                    {expandedSections[ticket.id]?.paid && renderPaidInfo(ticket.id)}
                                                </>
                                            ): null}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            ) : (
                                <div></div>
                            )}
                            <Card.Title className="mt-4">Description</Card.Title>
                            {isEditing ? (
                                <Form.Control
                                    className='ticket-form-control'
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={editFields[ticket.id]?.description || ''}
                                    onChange={(e) => handleChange(e, ticket.id)}
                                    placeholder="Enter description here..."
                                />
                            ) : (
                                <Card className="mb-4 mt-1">
                                    <Card.Body>
                                        <Card.Text>{ticket.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            )}
                            <Card.Title className="mt-4">Response</Card.Title>
                            {isEditing ? (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="response"
                                    value={editFields[ticket.id]?.response || ''}
                                    onChange={(e) => handleChange(e, ticket.id)}
                                    placeholder="Enter response here..."
                                />
                            ) : (
                                <Card className="mb-4 mt-1">
                                    <Card.Body>
                                        <Card.Text>{ticket.response}</Card.Text>
                                    </Card.Body>
                                </Card>
                            )}
                            <Card.Title className="mt-4">Inside Info</Card.Title>
                            {isEditing ? (
                                <Form.Control
                                    className='ticket-form-control mb-4'
                                    as="textarea"
                                    rows={3}
                                    name="insideInfo"
                                    value={editFields[ticket.id]?.insideInfo || ''}
                                    onChange={(e) => handleChange(e, ticket.id)}
                                    placeholder="Enter inside info here..."
                                />
                            ) : (
                                <Card className="mb-4 mt-1">
                                    <Card.Body>
                                        <Card.Text>{ticket.insideInfo}</Card.Text>
                                    </Card.Body>
                                </Card>
                            )}
                            <Accordion activeKey={expandedSections[ticket.id]?.maintenance ? "3" : null}>
                                <Accordion.Item eventKey="3">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'maintenance')}>
                                        Maintenances
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {maintenances.length > 0 ? (
                                            maintenances.map((maintenance, index) => (
                                                <Card key={index} className="mb-3">
                                                    <Card.Body>
                                                        <Card.Text><h3>{maintenance.maintenanceName}</h3></Card.Text>
                                                        <Card.Text>Date: {maintenance.maintenanceDate}</Card.Text>
                                                        <Card.Text>Comment: {maintenance.comment}</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            ))

                                        ) : (
                                            <p>No maintenances available</p>
                                        )}
                                        <Button variant="outline-primary" onClick={() => setShowMaintenanceModal(true)}>Add Maintenance</Button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Title className="mt-5 mb-4">Comments</Card.Title>
                            {comments.length === 0 ? (
                                <Card.Text>No comments yet.</Card.Text>
                            ) : (
                                comments
                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                    .map((comment, index) => (
                                        <Card key={index} className="mb-3" style={{borderRadius: '20px'}}>
                                            <Card.Body>
                                                <Card.Text>{comment.comment}</Card.Text>
                                                <small className="text-muted">{new Date(comment.timestamp).toLocaleString()}</small>
                                            </Card.Body>
                                        </Card>
                                    ))
                            )}
                            <Form.Group className="mt-5">
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button variant="primary" onClick={handleAddComment} className="mt-2">Add Comment</Button>
                            </Form.Group>
                            <TicketFileList ticketId={ticket.id}/>  {/* Calls the TicketFileList class */}
                            {isEditing && (
                                <Button className="mt-3" variant="primary" onClick={() => { handleSave(ticket.id); toggleEdit(); }}>
                                    Save
                                </Button>
                            )}
                        </Card.Body>
                    </Accordion.Body>
                </Accordion.Item>
            </Card>
            <ClientWorkersModal
                show={showWorkersModal}
                handleClose={() => setShowWorkersModal(false)}
                clientId={ticket.clientId}
                selectedWorkers={editFields[ticket.id]?.contactIds || []}
                onSave={()=> handleWorkTypeAndContactFetch(ticket.id)}
                ticketId={ticket.id}
                locations={locations}
            />
            <WorkTypeModal
                show={showWorkTypeModal}
                handleClose={() => setShowWorkTypeModal(false)}
                selectedWorkTypes={editFields[ticket.id]?.workTypeIds || []}
                onSave={()=> handleWorkTypeAndContactFetch(ticket.id)}
                ticketId={ticket.id}
            />
            <MaintenanceModal
            show={showMaintenanceModal}
            handleClose={() => setShowMaintenanceModal(false)}
            clientId={ticket.clientId}
            ticketId={ticket.id}
            onSave={()=> fetchMaintenances(ticket.id)}
            />
        </Accordion>
        </Container>
        </>
    );
};

export default TicketDetails;
