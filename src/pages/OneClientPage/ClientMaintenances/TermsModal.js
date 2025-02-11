// src/pages/SomePage/TermsModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Row, Col, Spinner, Form } from 'react-bootstrap';
import axiosInstance from '../../../config/axiosInstance';
import config from '../../../config/config';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize'; // <-- import the autosize library

function TermsModal({ show, onHide, setRefresh, clientId }) {
    const [description, setDescription] = useState('');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [existingFile, setExistingFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !clientId) return;

        setError(null);
        setIsEditingDesc(false);

        // Fetch description
        const fetchDescription = async () => {
            try {
                const res = await axiosInstance.get(`${config.API_BASE_URL}/client/maintenance/description/${clientId}`);
                // The backend returns { token: "Some text" }
                if (res.data && typeof res.data.token === 'string') {
                    setDescription(res.data.token);
                } else {
                    setDescription('');
                }
            } catch (err) {
                console.error('Error fetching maintenance description:', err);
                setDescription('');
            }
        };

        // Fetch file
        const fetchExistingFile = async () => {
            try {
                const res = await axiosInstance.get(`${config.API_BASE_URL}/client/terms/${clientId}`);
                if (res.data && res.data.id) {
                    setExistingFile(res.data);
                } else {
                    setExistingFile(null);
                }
            } catch (err) {
                console.error('Error fetching terms file:', err);
                setExistingFile(null);
            }
        };

        fetchDescription();
        fetchExistingFile();
    }, [show, clientId]);

    // Save or toggle edit mode
    const handleToggleEdit = async () => {
        if (isEditingDesc) {
            // Currently editing -> Save
            try {
                setError(null);
                await axiosInstance.put(
                    `${config.API_BASE_URL}/client/maintenance/conditions/${clientId}`,
                    { maintenanceDescription: description }
                );
                setIsEditingDesc(false);
            } catch (err) {
                console.error('Error saving description:', err);
                setError(err.message || 'Failed to save description.');
            }
        } else {
            // Enter edit mode
            setIsEditingDesc(true);
        }
    };

    // File change -> immediate upload
    const handleFileChange = async (e) => {
        if (!clientId) return;
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        setError(null);

        const selectedFile = e.target.files[0];
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await axiosInstance.put(
                `${config.API_BASE_URL}/client/upload/terms/${clientId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setExistingFile({ id: 0, fileName: selectedFile.name });
        } catch (err) {
            console.error('Error uploading terms file:', err);
            setError('Failed to upload file.');
        } finally {
            setIsUploading(false);
            e.target.value = null; // Clear out the file input
        }
    };

    // Download existing file
    const handleDownloadFile = async () => {
        if (!existingFile || !existingFile.id) return;
        try {
            const res = await axiosInstance.get(
                `${config.API_BASE_URL}/client/terms/${clientId}`,
                { responseType: 'blob' }
            );
            const fileName = existingFile.fileName || 'contractTermsFile';
            saveAs(new Blob([res.data]), fileName);
        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Failed to download file.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Terms</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}

                {/* DESCRIPTION AREA */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <h6 style={{ marginBottom: '0.4rem' }}>Description</h6>
                        <FontAwesomeIcon
                            icon={isEditingDesc ? faCheck : faEdit}
                            onClick={handleToggleEdit}
                            style={{
                                cursor: 'pointer',
                                color: '#007bff',
                                fontSize: '1.2rem',
                                marginBottom: '0.4rem'
                            }}
                            title={isEditingDesc ? 'Save' : 'Edit'}
                        />
                    </div>

                    {isEditingDesc ? (
                        <TextareaAutosize
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type something..."
                            minRows={3}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ced4da',
                                outline: 'none',
                                resize: 'none',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {description || (
                                <span style={{ color: '#999' }}>No description yet.</span>
                            )}
                        </div>
                    )}
                </div>

                <hr />

                {/* EXISTING FILE */}
                <Row className="mb-3">
                    <Col>
                        <h6>Current File</h6>
                        {existingFile ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div>{existingFile.fileName}</div>
                                <FontAwesomeIcon
                                    icon={faDownload}
                                    onClick={handleDownloadFile}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        color: '#007bff'
                                    }}
                                    title="Download file"
                                />
                            </div>
                        ) : (
                            <div>No file uploaded.</div>
                        )}
                    </Col>
                </Row>

                {/* FILE INPUT */}
                <Row>
                    <Col>
                        <Form.Label>Upload New File</Form.Label>
                        <div style={{ position: 'relative' }}>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            {isUploading && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: '#fff'
                                    }}
                                >
                                    <Spinner animation="border" size="sm" />
                                    <span style={{ fontSize: '0.9rem' }}>Uploading...</span>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-info" onClick={onHide}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TermsModal;
