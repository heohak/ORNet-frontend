import React, { useEffect, useState } from 'react';
import axios from "axios";
import config from "../../../../config/config";
import FileUploadModal from "../../../../modals/FileUploadModal";
import FileList from "../../../../modals/FileList";
import { Button } from "react-bootstrap";


const TicketFileList = ({ ticketId }) => {
    const [files, setFiles] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [ticketId]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/files/${ticketId}`);
            setFiles(response.data);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <>
            <div className="mt-4">
                <h1>File Management</h1>
            </div>
            <Button variant="outline-primary" onClick={() => setShowUploadModal(true)}>
                Upload Files
            </Button>
            <div>
                <FileList files={files}/>
            </div>
            <FileUploadModal
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                uploadEndpoint={`${config.API_BASE_URL}/ticket/upload/${ticketId}`}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default TicketFileList;
