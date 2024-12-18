import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import {FaArrowLeft, FaDownload} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

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
            const response = await axiosInstance.get(`${config.API_BASE_URL}/file/all`);
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
            const response = await axiosInstance.post(`${config.API_BASE_URL}/file/upload`, formData, {
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
        <Container className="mt-4">

            <Button
                variant="link"
                onClick={() => navigate(-1)}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }} // Adjust styling as desired
            >
                <FaArrowLeft title="Go back" />
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>View and Upload Files</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Upload Files
                </Button>
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
            {files.length === 0 ? (
                <Alert variant="info">No files found.</Alert>
            ) : (
                <>
                    {/* Table Header */}
                    <Row className="fw-bold mt-2">
                        <Col>File Name</Col>
                        <Col md="auto">Actions</Col>
                    </Row>
                    <hr />
                    {/* Files Rows */}
                    {files.map((file, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={file.id}
                                className="align-items-center"
                                style={{ backgroundColor: rowBgColor }}
                            >
                                <Col>
                                    <a
                                        href={`${config.API_BASE_URL}/file/open/${file.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {file.fileName}
                                    </a>
                                </Col>
                                <Col md="auto">
                                    <a href={`${config.API_BASE_URL}/file/download/${file.id}`}>
                                        <Button variant="link" className="p-0">
                                            <FaDownload />
                                        </Button>
                                    </a>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}
            {/* Upload Files Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Files</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUploadFiles}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Select Files</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default ViewFiles;
