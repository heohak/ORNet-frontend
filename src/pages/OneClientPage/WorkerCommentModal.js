// WorkerCommentModal.js
import React, {useEffect, useState} from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import config from "../../config/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../config/axiosInstance";

function WorkerCommentModal({ show, onHide, worker, onCommentSaved }) {
    const [isEditing, setIsEditing] = useState(false);
    const [comment, setComment] = useState(worker?.comment || '');
    const [error, setError] = useState(null);
    const workerName = `${worker?.firstName || ''} ${worker?.lastName || ''}`.trim();

    useEffect(() => {
        setComment(worker?.comment || '');
        setIsEditing(false); // Reset editing mode when a new worker is selected
        setError(null); // Clear any existing errors
    }, [worker]);

    const handleSaveComment = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/worker/update/${worker.id}`, {
                ...worker,
                comment: comment
            });
            setIsEditing(false);
            setError(null);
            // Notify parent that comment changed, but do not close the modal
            onCommentSaved(comment);
        } catch (err) {
            setError('Error saving the comment.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Comment for {workerName || "this worker"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <div
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '15px',
                        position: 'relative',
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 className="mb-0">Comment</h5>

                        {!isEditing ? (
                            <FontAwesomeIcon
                                icon={faEdit}
                                onClick={() => setIsEditing(true)}
                                style={{
                                    cursor: 'pointer',
                                    opacity: 0.8,
                                    transition: 'opacity 0.2s',
                                }}
                                title="Edit"
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faCheck}
                                onClick={handleSaveComment}
                                style={{
                                    cursor: 'pointer',
                                    opacity: 0.8,
                                    transition: 'opacity 0.2s',
                                }}
                                title="Save"
                            />
                        )}
                    </div>

                    {isEditing ? (
                        <Form.Control
                            as="textarea"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            style={{ width: '100%' }}
                        />
                    ) : (
                        <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '10px 0' }}>
                            {comment || "No comment provided."}
                        </p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default WorkerCommentModal;
