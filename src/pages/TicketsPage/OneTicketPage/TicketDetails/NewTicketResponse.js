import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Form } from 'react-bootstrap';
import React, { useState } from "react";
import axios from "axios";
import config from "../../../../config/config";
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'; // Import the CSS for Datetime component

const NewTicketResponse = ({ ticket }) => {
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [response, setResponse] = useState(ticket.response);  // Local state for the response
    const [responseDateTime, setResponseDateTime] = useState(ticket.responseDateTime || ""); // State for response date and time

    const handleSaveResponse = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                response: response,
                responseDateTime: responseDateTime // Send the response datetime to the backend
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating the Response", error);
        }
    };

    return (
        <>
            <div style={{ position: 'relative', padding: '10px' }}>
                <h4>Response</h4>
                {isEditing ? (
                    <>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            style={{ width: '100%' }}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <Form.Group className="mb-3">
                                <Form.Label>Response Date & Time</Form.Label>
                                <Datetime
                                    value={responseDateTime ? new Date(responseDateTime) : null}
                                    onChange={(date) => setResponseDateTime(date ? date.toISOString() : '')} // Update state correctly
                                    dateFormat="YYYY-MM-DD"
                                    timeFormat="HH:mm"
                                    closeOnSelect // Close the calendar after selecting
                                    inputProps={{ placeholder: "Select date and time" }} // Placeholder for the input
                                />
                            </Form.Group>
                        </div>
                    </>
                ) : (
                    <>
                        <p>{response}</p>
                        {responseDateTime && (
                            <p style={{ fontStyle: 'italic', color: 'gray' }}>
                                Response Date & Time: {new Date(responseDateTime).toLocaleString()}
                            </p>
                        )}
                    </>
                )}

                {/* Icon */}
                {!isEditing ? (
                    <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => setIsEditing(true)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            cursor: 'pointer',
                            display: 'block',
                            opacity: 0.7
                        }}
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faCheck}
                        onClick={handleSaveResponse}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            cursor: 'pointer',
                            display: 'block',
                            opacity: 0.7
                        }}
                    />
                )}
            </div>
        </>
    );
}

export default NewTicketResponse;
