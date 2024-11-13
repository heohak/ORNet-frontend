import React, { useEffect, useState } from 'react';
import axios from "axios";
import config from "../../config/config";
import FileUploadModal from "../../modals/FileUploadModal";
import FileList from "../../modals/FileList";
import { Button } from "react-bootstrap";
import { FaUpload } from 'react-icons/fa'; // Import the upload icon

const DeviceFileList = ({ deviceId }) => {
    const [files, setFiles] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [deviceId]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/files/${deviceId}`);
            setFiles(response.data);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <>
            {/* Header Section with Title and Upload Icon */}
            <div className="d-flex align-items-center mb-3">
                <h2 className="mb-0">File Management</h2> {/* File Management Title */}
                <Button
                    variant="link"
                    onClick={() => setShowUploadModal(true)}
                    aria-label="Upload Files"
                    className="ms-2 text-primary p-0"
                    title="Upload files"
                >
                    <FaUpload/>
                </Button>
            </div>

            {/* File List */}
            <div>
                <FileList files={files} />
            </div>

            {/* Upload Files Modal */}
            <FileUploadModal
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                uploadEndpoint={`${config.API_BASE_URL}/device/upload/${deviceId}`}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default DeviceFileList;
