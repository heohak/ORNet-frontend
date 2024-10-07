import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketResponse = ({ticket}) => {
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [response, setResponse] = useState(ticket.response);  // Local state for the response



    const handleSaveResponse = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                response: response
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating the Response", error);
        }
    };



    return (
        <>
            <div
                style={{ position: 'relative', padding: '10px'}}
            >
                <h4>Response</h4>
                {isEditing ? (
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={4}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <p>{response}</p>
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