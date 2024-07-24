import React, { useState, useEffect } from 'react';
import { Accordion, Card, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import FileUploadModal from "../../modals/FileUploadModal";
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
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

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
                    fileIds: ticket.fileIds || ''
                }
            }));
        }
    }, [isEditing, ticket]);

    useEffect(() => {
        if (expandedTickets.has(ticket.id.toString())) {
            fetchComments(ticket.id);
        }
    }, [expandedTickets]);

    const fetchComments = async (ticketId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/comment/${ticketId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
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
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Crisis:</strong> {ticket.crisis ? 'True' : 'False'}</p>
                                                        <p><strong>Remote:</strong> {ticket.remote ? 'True' : 'False'}</p>
                                                        <p><strong>Work Type:</strong> {ticket.workType}</p>
                                                        <p><strong>Responsible ID:</strong> {ticket.baitWorkerId}</p>
                                                    </>
                                                )}
                                            </Col>
                                            <Col md={6}>
                                                {isEditing ? (
                                                    <>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Client ID</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="clientId"
                                                                value={editFields[ticket.id]?.clientId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Location ID</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="locationId"
                                                                value={editFields[ticket.id]?.locationId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Status ID</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="statusId"
                                                                value={editFields[ticket.id]?.statusId || ''}
                                                                onChange={(e) => handleChange(e, ticket.id)}
                                                            />
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
                                                        <p><strong>Client ID:</strong> {ticket.clientId}</p>
                                                        <p><strong>Location ID:</strong> {ticket.locationId}</p>
                                                        <p><strong>Status ID:</strong> {ticket.statusId}</p>
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
                                        comments.map((comment, index) => (
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
        </Accordion>
    );
};

export default TicketDetails;
