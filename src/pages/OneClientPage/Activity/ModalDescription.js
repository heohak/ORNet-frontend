import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";

const NewTicketDescription = ({ activity, reFetch }) => {
    const [isEditing, setIsEditing] = useState(false); // Edit mode state
    const [description, setDescription] = useState(activity.description); // Local state for the description

    // Function to handle saving the updated description
    const handleSaveDescription = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                description: description,
            });
            reFetch();
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating the description", error);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
            {/* Description Section */}
            <div style={{ flexGrow: 1, maxWidth: "calc(100% - 40px)" }}>
                {isEditing ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        style={{ width: "100%" }}
                    />
                ) : (
                    <p style={{ margin: 0 }}>
                        {description &&
                            description.split("\n").map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                    </p>
                )}
            </div>
            <div style={{ marginLeft: "auto" }}>
                {/* Icon */}
                {!isEditing ? (
                    <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => setIsEditing(true)}
                        style={{
                            cursor: "pointer",
                            opacity: 0.7,
                        }}
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faCheck}
                        onClick={handleSaveDescription}
                        style={{
                            cursor: "pointer",
                            opacity: 0.7,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default NewTicketDescription;
