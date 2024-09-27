import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewFiles() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${config.API_BASE_URL}/file/all`);
            setFiles(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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
                fetchFiles(); // Refresh the list of files
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
                <h1>View and Upload Files</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Upload Files</Button>
            </div>
            {loading && (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Row>
                {files.map((file, index) => (
                    <Col key={file.id} md={4} className="mb-4">
                        <Card>
                            <Card.Img
                                variant="top"
                                src={`${config.API_BASE_URL}/file/thumbnail/${file.id}`}
                                alt={`Thumbnail of ${file.fileName}`}
                                style={{ height: '200px', objectFit: 'cover', objectPosition: 'center center' }}
                            />
                            <Card.Body>
                                <Card.Title>File {index + 1}</Card.Title>
                                <Card.Text>
                                    <strong>Name: </strong>{file.fileName}
                                </Card.Text>
                                <Button variant="primary" href={`${config.API_BASE_URL}/file/open/${file.id}`} className="ms-2">Open</Button>
                                <Button variant="primary" href={`${config.API_BASE_URL}/file/download/${file.id}`} className="ms-2">Download</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
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
