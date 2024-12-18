import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import axios from "axios";
import config from "../../config/config";
import { Form, Button } from "react-bootstrap";
import axiosInstance from "../../config/axiosInstance";

const MaintenanceComment = ({ maintenance }) => {
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [comment, setComment] = useState(maintenance.comment);  // Local state for the comment
    const [error, setError] = useState(null);

    const handleSaveComment = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/maintenance/update/${maintenance.id}`, {
                comment: comment,
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            setError('Error saving the comment.');
        }
    };

    return (
        <>
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '15px',
                    position: 'relative',
                    backgroundColor: '#f9f9f9'
                }}
            >
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <h5 className="mb-0">Comment</h5>

                    {/* Edit/Save Icon */}
                    {!isEditing ? (
                        <FontAwesomeIcon
                            icon={faEdit}
                            onClick={() => setIsEditing(true)}
                            style={{
                                cursor: 'pointer',
                                opacity: 0.8,
                                transition: 'opacity 0.2s',
                            }}
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
                        />
                    )}
                </div>

                {/* Content for comment */}
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

                {/* Display error if saving fails */}
                {error && <p className="text-danger">{error}</p>}
            </div>
        </>
    );
};

export default MaintenanceComment;
