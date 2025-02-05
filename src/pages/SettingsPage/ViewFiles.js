import React, { useEffect, useState } from 'react';
import {saveAs} from 'file-saver';
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
import {FaArrowLeft, FaDownload, FaTrash} from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";

function ViewFiles() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');


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

    const handleFileOpen = async (fileId) => {
        try {
            const response = await axiosInstance.get(`/file/open/${fileId}`, {
                responseType: "blob",
            });

            // Detect the file type from the response headers
            const fileType = response.headers["content-type"] || "application/octet-stream";

            // Create a Blob with the correct MIME type
            const blob = new Blob([response.data], { type: fileType });

            // Generate a URL and open it in a new tab
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error opening the file:", error);
        }
    };


    const handleFileDownload = async(fileId, fileName) => {
        try {
            const response = await axiosInstance.get(`/file/download/${fileId}`, {
                responseType: 'blob',
            });

            // Extract file name from headers or use provided filename
            const contentDisposition = response.headers['content-disposition'];
            const extractedFileName = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : fileName;

            // Trigger the file download
            const blob = new Blob([response.data]);
            saveAs(blob, extractedFileName);

        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    }

    const confirmDelete = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            // Send delete request to the server
            const response = await axiosInstance.get(`/admin/file/${selectedFileId}`);

            if (response.status === 200) {
                // Successfully deleted file
                setShowDeleteModal(false);  // Close the modal
            }
            fetchFiles();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Handle unauthorized error (401)
                setError("You are not authorized to delete this file. Only admins can delete files.");
            } else {
                setError("An error occurred while trying to delete the file.");
            }
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
                                        onClick={() => handleFileOpen(file.id)}
                                        style={{cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {file.fileName}
                                    </a>
                                </Col>
                                <Col md="auto">
                                    <a onClick={() => handleFileDownload(file.id, file.fileName)}>
                                        <Button variant="link" className="p-0">
                                            <FaDownload />
                                        </Button>
                                    </a>
                                    <a onClick={() => {
                                        setSelectedFileId(file.id); // Set the file ID
                                        setSelectedFileName(file.fileName); // Set the file name
                                        setShowDeleteModal(true); // Show delete confirmation modal
                                    }}>
                                        <Button variant="link" className="ms-4 p-0">
                                            <FaTrash className="text-danger" />
                                        </Button>
                                    </a>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}
            {/* Upload Files Modal */}
            <Modal backdrop="static" show={showAddModal} onHide={() => setShowAddModal(false)}>
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
            {/* Delete confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm File Delete</Modal.Title>
                </Modal.Header>
                <Form onSubmit={confirmDelete}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <p>Are you sure you want to delete this file {selectedFileName}?</p>
                        <p className="fw-bold">This change is permanent!</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" type="submit" disabled={loading}>
                            {loading ? 'Deleting...' : 'Delete File'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default ViewFiles;
