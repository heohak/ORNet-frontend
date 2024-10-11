import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketInsideInfo = ({ticket}) => {
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [insideInfo, setInsideInfo] = useState(ticket.insideInfo);  // Local state for inside info


    const handleSaveInsideInfo = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                insideInfo: insideInfo
            });
            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error("Error updating Inside Info", error);
        }
    };

    return (
        <>
            <div
                style={{ position: 'relative', padding: '10px'}}
            >
                <h4>Internal comments</h4>
                {isEditing ? (
                    <textarea
                        value={insideInfo}
                        onChange={(e) => setInsideInfo(e.target.value)}
                        rows={4}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <p>{insideInfo}</p>
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
                        onClick={handleSaveInsideInfo}
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

export default NewTicketInsideInfo;