import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';
import axiosInstance from "../config/axiosInstance";
import {DateUtils} from "../utils/DateUtils";

function CommentsModal({ show, handleClose, deviceId, isLinkedDevice = false }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const url = isLinkedDevice
                    ? `${config.API_BASE_URL}/linked/device/comment/${deviceId}`
                    : `${config.API_BASE_URL}/device/comment/${deviceId}`;
                const response = await axiosInstance.get(url);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (show) {
            fetchComments();
        }
    }, [show, deviceId, isLinkedDevice]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (newComment.trim() === "") {
            setIsSubmitting(false);
            return;
        }

        try {
            const url = isLinkedDevice
                ? `${config.API_BASE_URL}/linked/device/comment/${deviceId}`
                : `${config.API_BASE_URL}/device/comment/${deviceId}`;
            await axiosInstance.put(url,
                newComment,
                {
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    }
                }
            );
            setComments([{ comment: newComment, timestamp: new Date() }, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal backdrop="static" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Comments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleAddComment}>
                    <Form.Group controlId="newComment">
                        <Form.Label>New Comment</Form.Label>
                        <Form.Control
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Enter your comment"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isSubmitting} className="mt-3">
                        {isSubmitting ? 'Adding...' : 'Add Comment'}
                    </Button>
                </Form>
                <hr />
                <h5>Existing Comments</h5>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <div key={index} className="mb-2">
                            <strong>{DateUtils.formatDate(comment.timestamp)}</strong>: {comment.comment}
                        </div>
                    ))
                ) : (
                    <p>No comments available.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CommentsModal;
