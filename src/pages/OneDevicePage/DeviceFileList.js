import React, {useEffect, useState} from 'react';
import axios from "axios";
import config from "../../config/config";
import FileUploadModal from "../../modals/FileUploadModal";
import FileList from "../../modals/FileList";
import {Button} from "react-bootstrap";


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
            <div>
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
                uploadEndpoint={`${config.API_BASE_URL}/device/upload/${deviceId}`}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default DeviceFileList;