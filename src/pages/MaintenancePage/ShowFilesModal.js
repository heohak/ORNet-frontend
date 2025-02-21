import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import {Modal, Button, Form, Alert, Row, Col} from "react-bootstrap";
import {FaDownload, FaTrash} from "react-icons/fa";
import { saveAs } from "file-saver";

const ShowFilesModal = ({ maintenanceCommentId, onClose }) => {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    // Fetch existing files
    useEffect(() => {
        fetchFiles();
    }, [maintenanceCommentId]);
    const fetchFiles = async () => {
        try {
            const response = await axiosInstance.get(
                `/maintenance-comment/files/${maintenanceCommentId}`
            );
            setFiles(response.data.sort((a, b) => a.fileName.localeCompare(b.fileName)));
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files);
        setSelectedFiles(fileList);
    };

    // Upload files
    const handleUpload = async (e) => {
        if (loading) return;
        setLoading(true);
        e.preventDefault();
        if (!selectedFiles.length) return;

        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));

        try {
            // Upload files
            const uploadResponse = await axiosInstance.put(
                `/maintenance-comment/upload/${maintenanceCommentId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (uploadResponse.status === 200) {
                // Re-fetch the files after successful upload
                const fetchResponse = await axiosInstance.get(
                    `/maintenance-comment/files/${maintenanceCommentId}`
                );

                // Update the files state with the newly fetched data
                setFiles(fetchResponse.data);
                setSelectedFiles([]); // Clear the selected files
            }
        } catch (error) {
            console.error("Error uploading files:", error);
        }
        setLoading(false);
    };

    // Open file in a new tab
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

    // Download file
    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await axiosInstance.get(`/file/download/${fileId}`, {
                responseType: "blob",
            });

            // Extract file name from headers or use provided filename
            const contentDisposition = response.headers["content-disposition"];
            const extractedFileName = contentDisposition
                ? contentDisposition.split("filename=")[1].replace(/"/g, "")
                : fileName;

            // Trigger the file download
            const blob = new Blob([response.data]);
            saveAs(blob, extractedFileName);
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    };

    const confirmDelete = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            // Send delete request to the server
            const response = await axiosInstance.delete(`/admin/file/${selectedFileId}`);

            if (response.status === 200) {
                // Successfully deleted file
                setShowDeleteModal(false);  // Close the modal
                setError(false);
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
        <>
            <Modal backdrop="static" show onHide={onClose} centered dialogClassName={showDeleteModal ? "dimmed" : ""}>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6>Existing Files:</h6>
                    <ul style={{paddingLeft: "0"}}>
                        {files.length > 0 ? (
                            files.map((file, index) => {
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
                                                style={{cursor: 'pointer', textDecoration: 'none', color: '#0d6efd' }}
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
                            })) : (
                            <p>No files found.</p>
                        )}
                    </ul>

                    <h6>Upload New Files:</h6>
                    <Form.Group>
                        <Form.Control type="file" multiple onChange={handleFileChange} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpload}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Delete confirmation Modal */}
            <Modal
                backdrop="static"
                show={showDeleteModal}
                onHide={() => {setShowDeleteModal(false); setError(false);}}
                centered
            >
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
        </>
    );
};

export default ShowFilesModal;