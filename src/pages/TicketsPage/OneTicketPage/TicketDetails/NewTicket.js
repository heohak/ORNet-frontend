import React, {useEffect, useState} from 'react';
import {Modal, Button, Card, ListGroup, Form, Col, Row} from 'react-bootstrap';
import axios from "axios";
import config from "../../../../config/config";
import NewTicketDetails from "./NewTicketDetails";
import NewTicketFiles from "./NewTicketFiles";
import NewTicketDescription from "./NewTicketDescription";
import NewTicketRootCause from "./NewTicketRootCause";
import NewTicketStatusDropdown from "./NewTicketStatusDropdown";

const NewTicket = ({ ticket, onClose, statuses }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [activeKey, setActiveKey] = useState('0');

    useEffect(() => {
        fetchComments();
    }, [ticket.id]);

    const handleAddComment = () => {
        if (newComment.trim() !== "") {
            // Normally, you'd call an API here to save the comment.
            console.log("New Comment Added:", newComment);
            setNewComment("");
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/comment/${ticket.id}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle the accordion
    };


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
                        <NewTicketRootCause
                            ticket={ticket}
                        />
                        <Card>
                            <Card.Header>Activity</Card.Header>
                            <ListGroup variant="flush">
                                {comments.map((comment, index) => (
                                    <ListGroup.Item key={index}>
                                        <strong>Author</strong> - {comment.timestamp}
                                        <p>{comment.comment}</p>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Card.Footer>
                                <Form.Group>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                </Form.Group>
                                <Button className="mt-2" variant="primary" onClick={handleAddComment}>
                                    Add Comment
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <NewTicketStatusDropdown
                            statuses={statuses}
                            ticket={ticket}
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
                        <p className="mb-0">Created: {ticket.startDateTime}</p>
                        <p>Updated: {ticket.updateDateTime}</p>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
};

export default NewTicket;
