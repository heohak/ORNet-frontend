import React, { useState, useEffect } from 'react';
import { Accordion, Card, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import FileUploadModal from "../../modals/FileUploadModal";
import ClientWorkersModal from "../../modals/ClientWorkersModal"; // Import the new modal
import config from "../../config/config";

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
                           onUploadSuccess
                       }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showWorkersModal, setShowWorkersModal] = useState(false); // Add state for showing workers modal
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [contacts, setContacts] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [responsibleName, setResponsibleName] = useState('');
    const [clientName, setClientName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [statusName, setStatusName] = useState('');
    const [workTypes, setWorkTypes] = useState([]);



    useEffect(() => {
        if (isEditing) {
            setEditFields((prevFields) => ({
                ...prevFields,
                [ticket.id]: {
                    startDateTime: ticket.startDateTime || '',
                    endDateTime: ticket.endDateTime || '',
                    responseDateTime: ticket.responseDateTime || '',
                    update_time: ticket.update_time || '',
                    crisis: ticket.crisis || false,
                    remote: ticket.remote || false,
                    workType: ticket.workType || '',
                    baitWorkerId: ticket.baitWorkerId || '',
                    clientId: ticket.clientId || '',
                    locationId: ticket.locationId || '',
                    statusId: ticket.statusId || '',
                    rootCause: ticket.rootCause || '',
                    description: ticket.description || '',
                    response: ticket.response || '',
                    insideInfo: ticket.insideInfo || '',
                    fileIds: ticket.fileIds || '',
                    baitNumeration: ticket.baitNumeration || '',
                    clientNumeration: ticket.clientNumeration || '',
                    clientWorkers: ticket.clientWorkers || [] // Add client workers field
                }
            }));
        }
    }, [isEditing, ticket]);

    useEffect(() => {
        if (expandedTickets.has(ticket.id.toString())) {
            fetchComments(ticket.id);
            fetchContacts(ticket.id);
            fetchNames(ticket.baitWorkerId, ticket.clientId, ticket.locationId, ticket.statusId); // Fetch names
            fetchWorkTypes(ticket.id); // Fetch work types
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
            } catch (error) {
                console.error('Error fetching statuses:', error);
            }
        };

        if (isEditing) {
            fetchClients();
            fetchStatuses();
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

    const fetchContacts = async (ticketId) => {
        try{
            const response = await axios.get(`${config.API_BASE_URL}/ticket/contacts/${ticketId}`);
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }

    const fetchNames = async (responsibleId, clientId, locationId, statusId) => {
        try {
            const [responsibleResponse, clientResponse, locationResponse, statusResponse] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/bait/worker/${responsibleId}`),
                axios.get(`${config.API_BASE_URL}/client/${clientId}`),
                axios.get(`${config.API_BASE_URL}/location/${locationId}`),
                axios.get(`${config.API_BASE_URL}/ticket/classificator/${statusId}`)
            ]);
            const fullName = responsibleResponse.data.firstName + " " + responsibleResponse.data.lastName;
            setResponsibleName(fullName);
            setClientName(clientResponse.data.fullName);
            console.log(clientName);
            setLocationName(locationResponse.data.name);
            setStatusName(statusResponse.data.status);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchWorkTypes = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/work-types/${ticketId}`);
            setWorkTypes(response.data.map(workType => workType.workType)); // Assuming the response is an array of work type DTOs
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
    };

    const handleAddComment = async () => {
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

    const handleWorkersSave = (selectedWorkers) => {
        setEditFields((prevFields) => ({
            ...prevFields,
            [ticket.id]: {
                ...prevFields[ticket.id],
                clientWorkers: selectedWorkers
            }
        }));
    };

    return (
        <Accordion key={ticket.id} activeKey={expandedTickets.has(ticket.id.toString()) ? ticket.id.toString() : null}>
            <Card ref={(el) => (ticketRefs.current[ticket.id] = el)} className="mb-4">
                <Accordion.Item eventKey={ticket.id.toString()}>
                    <Accordion.Header onClick={() => toggleTicketExpansion(ticket.id.toString())}>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <span>Title: {ticket.title}</span>
                            <Button variant="outline-primary" onClick={(e) => { e.stopPropagation(); toggleEdit(); }}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <Card.Body>
                            <Accordion activeKey={expandedSections[ticket.id]?.dates ? "0" : null}>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header onClick={() => toggleSectionExpansion(ticket.id, 'dates')}>Dates</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col>
                                                {isEditing ? (
                                                    <>
                                                        <p><strong>Start Date Time:</strong> {ticket.startDateTime}</p>
                                                        <p><strong>End Date Time:</strong> {ticket.endDateTime}</p>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Response Date Time</Form.Label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                name="responseDateTime"
                                                                value={editFields[ticket.id]?.responseDateTime || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Update Time</Form.Label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                name="update_time"
                                                                value={editFields[ticket.id]?.update_time || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Start Date Time:</strong> {ticket.startDateTime}</p>
                                                        <p><strong>End Date Time:</strong> {ticket.endDateTime}</p>
                                                        <p><strong>Response Date Time:</strong> {ticket.responseDateTime}</p>
                                                        <p><strong>Update Time:</strong> {ticket.update_time}</p>
                                                    </>
                                                )}
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
                                                            <Form.Label>Work Type</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="workType"
                                                                value={editFields[ticket.id]?.workType || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Responsible ID</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="baitWorkerId"
                                                                value={editFields[ticket.id]?.baitWorkerId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Button variant="outline-primary" onClick={() => setShowWorkersModal(true)}>
                                                            Manage Client Workers
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Numeration:</strong> {ticket.baitNumeration}</p>
                                                        <p><strong>Crisis:</strong> {ticket.crisis ? 'True' : 'False'}</p>
                                                        <p><strong>Remote:</strong> {ticket.remote ? 'True' : 'False'}</p>
                                                        <p><strong>Work Types:</strong> {workTypes.join(', ')}</p>
                                                        <p><strong>Responsible ID:</strong> {responsibleName}</p>
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
                                                        <p><strong>Client:</strong> {clientName}</p>
                                                        <p><strong>Location:</strong> {locationName}</p>
                                                        <p><strong>Status:</strong> {statusName}</p>
                                                        <p><strong>Root Cause:</strong> {ticket.rootCause}</p>
                                                    </>
                                                )}
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Title className="mt-4">Description</Card.Title>
                            {isEditing ? (
                                <Form.Control
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
                            <Card.Title className="mt-4">Comments</Card.Title>
                            <Card className="mb-4 mt-1">
                                <Card.Body>
                                    {comments.length === 0 ? (
                                        <Card.Text>No comments yet.</Card.Text>
                                    ) : (
                                        comments
                                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                            .map((comment, index) => (
                                                <Card key={index} className="mb-3">
                                                    <Card.Body>
                                                        <Card.Text>{comment.comment}</Card.Text>
                                                        <small className="text-muted">{new Date(comment.timestamp).toLocaleString()}</small>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                    )}
                                </Card.Body>
                            </Card>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button variant="primary" onClick={handleAddComment} className="mt-2">Add Comment</Button>
                            </Form.Group>
                            <p><strong>File Ids:</strong> {ticket.fileIds}</p>
                            {!isEditing && (
                                <>
                                    <Button variant="outline-primary" onClick={() => setShowUploadModal(true)}>
                                        Upload Files
                                    </Button>
                                    <FileUploadModal
                                        show={showUploadModal}
                                        handleClose={() => setShowUploadModal(false)}
                                        uploadEndpoint={`${config.API_BASE_URL}/ticket/upload/${ticket.id}`}
                                        onUploadSuccess={onUploadSuccess}
                                    />
                                </>
                            )}
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
                selectedWorkers={editFields[ticket.id]?.clientWorkers || []}
                onSave={handleWorkersSave}
            />
        </Accordion>
    );
};

export default TicketDetails;
