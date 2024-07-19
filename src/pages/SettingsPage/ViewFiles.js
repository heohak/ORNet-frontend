import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewFiles() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleUploadFiles = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append('files', file);
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/file/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setShowAddModal(false); // Close the modal after adding the files
                setSelectedFiles([]); // Clear the selected files
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Upload Files</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Upload Files</Button>
            </div>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form onSubmit={handleUploadFiles}>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Files</Form.Label>
                                <Form.Control
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    required
                                />
                            </Form.Group>
                            <Button variant="success" type="submit" disabled={loading}>
                                {loading ? 'Uploading...' : 'Upload Files'}
                            </Button>
                        </Form>
                    </Container>
                </Modal.Body>
            </Modal>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default ViewFiles;
