import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, ListGroup } from 'react-bootstrap';

function FileUploadModal({ show, handleClose, uploadEndpoint, onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show) {
            setSelectedFiles([]); // Clear selected files when modal is closed
            setError(null); // Clear any error messages
        }
    }, [show]);

    const handleFileChange = (e) => {
        setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    };

    const handleFileRemove = (fileName) => {
        setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
    };

    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) {
            setError("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await axios.put(uploadEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSelectedFiles([]);
            onUploadSuccess(); // Trigger refresh in the parent component
            handleClose();
        } catch (error) {
            setError("Failed to upload files.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formFile">
                    <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />
                    {error && <Form.Text className="text-danger">{error}</Form.Text>}
                </Form.Group>
                <ListGroup className="mt-3">
                    {selectedFiles.map(file => (
                        <ListGroup.Item style={{ display: "flex", justifyContent: "space-between" }} key={file.name}>
                            {file.name}
                            <Button
                                variant="danger"
                                size="sm"
                                className="ms-3"
                                onClick={() => handleFileRemove(file.name)}
                            >
                                &times;
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleFileUpload}>Upload</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FileUploadModal;
