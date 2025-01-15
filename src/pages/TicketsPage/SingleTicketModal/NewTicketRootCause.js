import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";


const NewTicketRootCause = ({ticket}) => {

    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [rootCause, setRootCause] = useState(ticket.rootCause);  // Local state for the description


    useEffect(() => {
        setRootCause(ticket.rootCause);
    }, [ticket.rootCause]);

    // Function to handle saving the updated root cause
    const handleSaveDescription = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                rootCause: rootCause
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating the description", error);
        }
    };


    return (
        <>
            {/* Root cause Section */}
            <div
                style={{ position: 'relative', padding: '10px'}}
            >
                <h4>Root Cause</h4>
                {isEditing ? (
                    <textarea
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        rows={4}
                        style={{ width: '100%' }}
                    />
                ) : (
                    rootCause ? (
                        <p>{rootCause}</p>
                        ) : (
                            <p>No root Cause</p>

                    ))}

                {/* Icon */}
                {!isEditing ? (
                    <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => setIsEditing(true)}
                        style={{
                            fontSize: '1.5rem',
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
                        onClick={handleSaveDescription}
                        style={{
                            fontSize: '1.5rem',
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

export default NewTicketRootCause;