import {Col, Row, Alert} from "react-bootstrap";
import config from "../config/config";
import noImg from "../assets/no-img.jpg";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';



const FileList = ({files}) => {

    return(
        <>
            <Row className="mt-3">
                {files.length > 0 ? (
                    files.map((file) => {
                        const thumbnailSrc = `${config.API_BASE_URL}/file/thumbnail/${file.id}`;
                        return (
                            <Col key={file.id} md={12} className="d-flex align-items-center mb-3">
                                <img
                                    src={thumbnailSrc} // Thumbnail URL
                                    alt={file.fileName || "No image available"} // Use file name or default text for alt
                                    onError={(e) => { e.target.onerror = null; e.target.src = noImg; }} // Set default image on error
                                    style={{ height: '40px', width: '40px', objectFit: 'cover', marginRight: '10px' }} // Thumbnail style
                                />
                                <a
                                    href={`${config.API_BASE_URL}/file/open/${file.id}`} // Link to open the file in a new tab
                                    target="_blank" // Open in a new tab
                                    rel="noopener noreferrer" // Security feature
                                    className="file-link"
                                    style={{ display: 'inline-block', marginRight: '10px' }} // Only take width of the text
                                >
                                    {file.fileName}
                                </a>
                                <a
                                    href={`${config.API_BASE_URL}/file/download/${file.id}`}
                                    className="ms-2"
                                    style={{ color: 'black', textDecoration: 'none' }} // Optional: adjust styling as needed
                                >
                                    <FontAwesomeIcon icon={faDownload} size="lg" /> {/* Font Awesome Download Icon */}
                                </a>
                            </Col>
                        );
                    })
                ) : (
                    <Alert variant="info">No files available</Alert>
                )}
            </Row>
        </>
    )

};

export default FileList;