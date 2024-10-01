import React, {useEffect, useState} from 'react';
import { Modal, Button, Card, ListGroup, Form, Col, Row, Accordion } from 'react-bootstrap';
import axios from "axios";
import config from "../../../../config/config";
import NewTicketDetails from "./NewTicketDetails";

const NewTicket = ({ ticket, onClose }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);

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

    return (
        <Modal show onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <div className="w-100">
                    <Modal.Title>{ticket.title}</Modal.Title>
                    <p className="text-muted mb-0">{ticket.name}</p>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <div>
                            <h4>Description</h4>
                            <p>{ticket.description}</p>
                        </div>
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
                       <NewTicketDetails
                            ticket={ticket}
                       />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewTicket;
