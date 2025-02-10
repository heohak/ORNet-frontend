import React, { useState, useEffect } from "react";
import { Alert, ListGroup, Button, Modal, Form } from "react-bootstrap";
import noImg from "../assets/no-img.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../config/axiosInstance";
import { saveAs } from "file-saver";

const FileList = ({ files }) => {
    // Local state for thumbnails and for managing deletion confirmation
    const [thumbnails, setThumbnails] = useState({});
    const [localFiles, setLocalFiles] = useState(files);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Update localFiles when files prop changes
    useEffect(() => {
        setLocalFiles(files);
    }, [files]);

    // Fetch thumbnail for a given file
    const fetchThumbnail = async (fileId) => {
        try {
            const response = await axiosInstance.get(`/file/thumbnail/${fileId}`, {
                responseType: "blob",
            });
            const thumbnailURL = URL.createObjectURL(new Blob([response.data]));
            setThumbnails((prev) => ({ ...prev, [fileId]: thumbnailURL }));
        } catch (error) {
            console.error(`Failed to fetch thumbnail for file ${fileId}:`, error);
            setThumbnails((prev) => ({ ...prev, [fileId]: noImg }));
        }
    };

    // Open file in a new tab
    const handleFileOpen = async (fileId) => {
        try {
            const response = await axiosInstance.get(`/file/open/${fileId}`, {
                responseType: "blob",
            });
            const fileType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: fileType });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error opening the file:", error);
        }
    };

    // Download the file
    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await axiosInstance.get(`/file/download/${fileId}`, {
                responseType: "blob",
            });
            const contentDisposition = response.headers["content-disposition"];
            const extractedFileName = contentDisposition
                ? contentDisposition.split("filename=")[1].replace(/"/g, "")
                : fileName;
            const blob = new Blob([response.data]);
            saveAs(blob, extractedFileName);
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    };

    // Confirm deletion via modal
    const confirmDelete = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.delete(`/admin/file/${selectedFileId}`);
            if (response.status === 200) {
                setLocalFiles(localFiles.filter(file => file.id !== selectedFileId));
                setShowDeleteModal(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError("You are not authorized to delete this file. Only admins can delete files.");
            } else {
                setError("An error occurred while trying to delete the file.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localFiles.forEach((file) => {
            if (!thumbnails[file.id]) {
                fetchThumbnail(file.id);
            }
        });
    }, [localFiles]);

    if (localFiles.length === 0) {
        return <Alert variant="info">No files available</Alert>;
    }

    return (
        <>
            <ListGroup variant="flush" className="mt-3">
                {localFiles.map((file) => (
                    <ListGroup.Item
                        key={file.id}
                        className="d-flex align-items-center justify-content-between border-0 px-0"
                    >
                        <div className="d-flex align-items-center">
                            <img
                                src={thumbnails[file.id] || noImg}
                                alt={file.fileName || "No image available"}
                                style={{
                                    height: "40px",
                                    width: "40px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    marginRight: "15px",
                                }}
                            />
                            <div>
                                <a
                                    onClick={() => handleFileOpen(file.id)}
                                    style={{
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        color: "#007bff",
                                        textDecoration: "none",
                                    }}
                                >
                                    {file.fileName}
                                </a>
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                    setSelectedFileId(file.id);
                                    setSelectedFileName(file.fileName);
                                    setShowDeleteModal(true);
                                }}
                                title="Delete File"
                                className="ms-2"
                            >
                                <FontAwesomeIcon icon={faTrash} style={{ color: "#dc3545" }} />
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleFileDownload(file.id, file.fileName)}
                                title="Download File"
                            >
                                <FontAwesomeIcon icon={faDownload} style={{ color: "#007bff" }} />
                            </Button>

                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
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
                        <p>Are you sure you want to delete this file <strong>{selectedFileName}</strong>?</p>
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

export default FileList;
