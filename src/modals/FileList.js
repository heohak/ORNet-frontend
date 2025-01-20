import { Col, Row, Alert } from "react-bootstrap";
import noImg from "../assets/no-img.jpg";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../config/axiosInstance";
import { saveAs } from "file-saver";

const FileList = ({ files }) => {
    const [thumbnails, setThumbnails] = useState({});

    // Fetch thumbnails dynamically
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

    useEffect(() => {
        files.forEach((file) => {
            if (!thumbnails[file.id]) {
                fetchThumbnail(file.id);
            }
        });
    }, [files]);

    return (
        <>
            <Row className="mt-3">
                {files.length > 0 ? (
                    files.map((file) => (
                        <Col key={file.id} md={12} className="d-flex align-items-center mb-3">
                            <img
                                src={thumbnails[file.id] || noImg}
                                alt={file.fileName || "No image available"}
                                style={{
                                    height: "40px",
                                    width: "40px",
                                    objectFit: "cover",
                                    marginRight: "10px",
                                }}
                            />
                            <span
                                onClick={() => handleFileOpen(file.id)}
                                className="file-link"
                                style={{
                                    cursor: "pointer",
                                    marginRight: "10px",
                                    color: "blue",
                                    textDecoration: "underline",
                                }}
                            >
                                {file.fileName}
                            </span>
                            <span
                                onClick={() => handleFileDownload(file.id, file.fileName)}
                                className="ms-2"
                                style={{
                                    color: "black",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                }}
                            >
                                <FontAwesomeIcon icon={faDownload} size="lg" />
                            </span>
                        </Col>
                    ))
                ) : (
                    <Alert variant="info">No files available</Alert>
                )}
            </Row>
        </>
    );
};

export default FileList;
