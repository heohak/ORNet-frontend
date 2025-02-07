import React, {forwardRef, useImperativeHandle, useState} from "react";

import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";
import TextareaAutosize from "react-textarea-autosize";


const ModalDescription = forwardRef(({ activity, reFetch, isEditing }, ref) => {
    const [description, setDescription] = useState(activity.description); // Local state for the description


    useImperativeHandle(ref, () => ({
        saveChanges: handleSaveDescription, // Expose this function to parent
    }));

    // Function to handle saving the updated description
    const handleSaveDescription = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                description: description,
            });
            reFetch();
        } catch (error) {
            console.error("Error updating the description", error);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
            {/* Description Section */}
            <div style={{ flexGrow: 1, maxWidth: "calc(100% - 40px)" }}>
                {isEditing ? (
                    <TextareaAutosize
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
                                    {line.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                        part.match(/https?:\/\/[^\s]+/) ? (
                                            <a
                                                key={i}
                                                href={part}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#007bff', textDecoration: 'underline' }}
                                            >
                                                {part}
                                            </a>
                                        ) : (
                                            part
                                        )
                                    )}
                                    <br />
                                </React.Fragment>
                            ))}
                    </p>


                )}
            </div>
        </div>
    );
});

export default ModalDescription;
