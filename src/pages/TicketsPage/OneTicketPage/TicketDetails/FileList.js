import React, {useEffect, useState} from 'react';
import axios from "axios";
import config from "../../../../config/config";
import {Button} from "react-bootstrap";


const FileList = ({ ticketId }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/files/${ticketId}`);
                setFiles(response.data);
            } catch (error) {
                console.error(error.message);
            }
        }
        fetchFiles();
    }, [ticketId]);




    return (
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
    );
};

export default FileList;