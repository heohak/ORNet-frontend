import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave, faEdit} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";


const NewTicketDescription = ({ticket}) => {

    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [description, setDescription] = useState(ticket.description);  // Local state for the description

    // Function to handle saving the updated description
    const handleSaveDescription = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                description: description
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating the description", error);
        }
    };


    return (
        <>
            {/* Description Section */}
            <div
                style={{ position: 'relative', padding: '10px'}}
            >
                <h4>Description</h4>
                {isEditing ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <p>
                        {description &&
                        description.split("\n").map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </p>
                )}

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
                        icon={faSave}
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

export default NewTicketDescription;