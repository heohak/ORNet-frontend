import React, {useEffect, useState} from 'react';
import axios from "axios";
import config from "../../config/config";
import FileUploadModal from "../../modals/FileUploadModal";
import {Button} from "react-bootstrap";

const FileList = ({ deviceId }) => {
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
            <div>
                <h1>File Management</h1>
            </div>
            <Button variant="outline-primary" onClick={() => setShowUploadModal(true)}>
                Upload Files
            </Button>
            <div>
                <strong>File List:</strong>
                <ul>
                    {files.length > 0 ? (
                        files.map((file) => (
                            <li key={file.id}>
                                <a
                                    href={`${config.API_BASE_URL}/file/download/${file.id}`}
                                    download // This attribute suggests to the browser that it should download the file
                                    className="file-link"
                                >
                                    {file.fileName}
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>No files available</li>
                    )}
                </ul>
            </div>
            <FileUploadModal
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                uploadEndpoint={`${config.API_BASE_URL}/device/upload/${deviceId}`}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default FileList;