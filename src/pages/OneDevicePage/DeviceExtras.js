import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import FileUploadModal from '../../modals/FileUploadModal';
import FileList from '../../modals/FileList';
import CommentsModal from '../../modals/CommentsModal';
import { DateUtils } from '../../utils/DateUtils';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComments} from "@fortawesome/free-solid-svg-icons";

const DeviceExtras = ({ deviceId }) => {
    const [files, setFiles] = useState([]);
    const [comments, setComments] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    useEffect(() => {
        fetchFiles();
        fetchComments();
    }, [deviceId]);

    const fetchFiles = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/files/${deviceId}`);
            setFiles(response.data);
        } catch (error) {
            console.error("Error fetching files:", error.message);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/comment/${deviceId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error.message);
        }
    };

    return (
        <>
            <Card className="mb-4">
                <Card.Header>
                    <Row className="align-items-center">
                        <Col><h5>Files & Comments</h5></Col>
                        <Col className="text-end">
                            <Button
                                variant="link"
                                onClick={() => setShowUploadModal(true)}
                                title="Upload Files"
                                className="text-primary p-0 me-2"
                            >
                                <FaUpload />
                            </Button>
                            <Button
                                variant="link"
                                className="text-primary"
                                onClick={() => setShowCommentsModal(true)}
                                title="View Comments"
                            >
                                <FontAwesomeIcon icon={faComments} />
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h6>Files</h6>
                            {files.length > 0 ? (
                                <FileList files={files} />
                            ) : (
                                <p className="text-muted">No files available.</p>
                            )}
                        </Col>
                        <Col md={6}>
                            <h6>Comments</h6>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div key={index} className="mb-2">
                                        <strong>{DateUtils.formatDate(comment.timestamp)}</strong>: {comment.comment}
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No comments available.</p>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <FileUploadModal
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                uploadEndpoint={`${config.API_BASE_URL}/device/upload/${deviceId}`}
                onUploadSuccess={fetchFiles}
            />

            <CommentsModal
                show={showCommentsModal}
                handleClose={() => setShowCommentsModal(false)}
                deviceId={deviceId}
            />
        </>
    );
};

export default DeviceExtras;
