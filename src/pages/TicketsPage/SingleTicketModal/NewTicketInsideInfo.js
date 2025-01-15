import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import axios from "axios";
import config from "../../../config/config";
import TextareaAutosize from "react-textarea-autosize";
import axiosInstance from "../../../config/axiosInstance";


const NewTicketInsideInfo = ({ ticket, reFetch }) => {
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [insideInfo, setInsideInfo] = useState(ticket.insideInfo);  // Local state for inside info


    const handleSaveInsideInfo = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                insideInfo: insideInfo
            });
            setIsEditing(false); // Exit edit mode after saving
            reFetch();
        } catch (error) {
            console.error("Error updating Internal Comments", error);
        }
    };

    return (
        <>
            <div
                style={{ position: 'relative', padding: '10px'}}
            >
                <h4>Internal Comments</h4>
                {isEditing ? (
                    <TextareaAutosize
                        value={insideInfo}
                        minRows={2}
                        onChange={(e) => setInsideInfo(e.target.value)}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <p>
                        {insideInfo &&
                        insideInfo.split("\n").map((line, index) => (
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
                        icon={faCheck}
                        onClick={handleSaveInsideInfo}
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

export default NewTicketInsideInfo;