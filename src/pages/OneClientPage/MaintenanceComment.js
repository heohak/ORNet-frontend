import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import axios from "axios";
import config from "../../config/config";
import { Form, Button } from "react-bootstrap";
import axiosInstance from "../../config/axiosInstance";

const MaintenanceComment = ({setComment, isEditing, comment }) => {
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
            </div>
        </>
    );
};

export default MaintenanceComment;
