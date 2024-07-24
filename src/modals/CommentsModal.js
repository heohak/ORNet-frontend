import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';

function CommentsModal({ show, handleClose, deviceId, isLinkedDevice = false }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const url = isLinkedDevice
                    ? `${config.API_BASE_URL}/linked/device/comment/${deviceId}`
                    : `${config.API_BASE_URL}/device/comment/${deviceId}`;
                const response = await axios.get(url);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (show) {
            fetchComments();
        }
    }, [show, deviceId, isLinkedDevice]);

    const handleAddComment = async () => {
        if (newComment.trim() === "") {
            return;
        }

        try {
            const url = isLinkedDevice
                ? `${config.API_BASE_URL}/linked/device/comment/${deviceId}`
                : `${config.API_BASE_URL}/device/comment/${deviceId}`;
            await axios.put(url, null, { params: { comment: newComment } });
            setComments([...comments, { comment: newComment, timestamp: new Date() }]);
            setNewComment("");
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Comments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="newComment">
                        <Form.Label>New Comment</Form.Label>
                        <Form.Control
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Enter your comment"
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddComment} className="mt-3">
                        Add Comment
                    </Button>
                </Form>
                <hr />
                <h5>Existing Comments</h5>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <div key={index} className="mb-2">
                            <strong>{new Date(comment.timestamp).toLocaleString()}</strong>: {comment.comment}
                        </div>
                    ))
                ) : (
                    <p>No comments available.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CommentsModal;
