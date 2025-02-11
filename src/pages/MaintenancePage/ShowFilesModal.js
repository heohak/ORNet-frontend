import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { Modal, Button, Form } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver";

const ShowFilesModal = ({ maintenanceCommentId, onClose }) => {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Fetch existing files
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axiosInstance.get(
                    `/maintenance-comment/files/${maintenanceCommentId}`
                );
                setFiles(response.data);
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };
        fetchFiles();
    }, [maintenanceCommentId]);

    // Handle file selection
    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files);
        setSelectedFiles(fileList);
    };

    // Upload files
    const handleUpload = async (e) => {
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

    return (
        <Modal backdrop="static" show onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Manage Files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h6>Existing Files:</h6>
                <ul>
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <li key={index} className="d-flex justify-content-between align-items-center">
                                <a
                                    onClick={() => handleFileOpen(file.id)}
                                    style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "none" }}
                                >
                                    {file.fileName}
                                </a>
                                <Button
                                    variant="link"
                                    onClick={() => handleFileDownload(file.id, file.fileName)}
                                    className="p-0"
                                >
                                    <FaDownload />
                                </Button>
                            </li>
                        ))
                    ) : (
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
    );
};

export default ShowFilesModal;