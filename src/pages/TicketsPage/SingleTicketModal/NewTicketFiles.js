import { Accordion, Button } from "react-bootstrap";
import React, { useEffect, useState, useRef } from "react";
import FileList from "../../../modals/FileList";
import axios from "axios";
import config from "../../../config/config";
import { FaPaperclip } from 'react-icons/fa';  // Import the paperclip icon

const NewTicketFiles = ({ ticket, eventKey, activeKey, handleAccordionToggle }) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null); // Reference to trigger file input

    useEffect(() => {
        fetchFiles();
    }, [ticket.id]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/files/${ticket.id}`);
            setFiles(response.data);
        } catch (error) {
            console.error(error.message);
        }
    };

    // Function to handle file selection
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append("files", selectedFile);

                // Send the file to the backend (assuming the endpoint is for file uploads)
                await axios.put(`${config.API_BASE_URL}/ticket/upload/${ticket.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Refetch the updated file list after upload
                fetchFiles();
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    // Trigger file input on icon click
    const handleIconClick = (e) => {
        e.stopPropagation(); // Prevent accordion from collapsing
        fileInputRef.current.click(); // Trigger file input
    };

    const handleAccordionHeaderClick = (e) => {
        if (e.target.tagName !== "BUTTON" && e.target.tagName !== "svg" && e.target.tagName !== "path") {
            handleAccordionToggle(eventKey);  // Toggle only if click is outside the button/icon
        }
    };

    return (
        <>
            <Accordion activeKey={activeKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Accordion.Header onClick={() => handleAccordionToggle(eventKey)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            Files
                            <Button
                                variant="link"
                                onClick={handleIconClick}  // Trigger file input on icon click
                                style={{ textDecoration: "none", padding: 0}}
                                className="me-2 d-flex"
                            >
                                <FaPaperclip/>
                            </Button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }} // Hide the file input
                            onChange={handleFileChange} // Handle file selection
                        />
                    </Accordion.Header>
                    <Accordion.Body>
                        <FileList files={files} />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default NewTicketFiles;
