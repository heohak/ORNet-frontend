import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { FaUpload, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import FileUploadModal from '../../modals/FileUploadModal';
import FileList from '../../modals/FileList';
import { DateUtils } from '../../utils/DateUtils';
import Linkify from 'react-linkify';

const DeviceExtras = ({ deviceId }) => {
    const [files, setFiles] = useState([]);
    const [comments, setComments] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [inlineComment, setInlineComment] = useState("");

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

    const handleInlineAddComment = async (e) => {
        e.preventDefault();
        if (inlineComment.trim() === "") return;
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/device/comment/${deviceId}`,
                inlineComment,
                { headers: { "Content-Type": "text/plain" } }
            );
            fetchComments();
            setInlineComment("");
        } catch (error) {
            console.error("Error adding comment inline:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/comment/${commentId}`);
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <>
            <Card className="mb-4">
                <Card.Header>
                    <Row className="align-items-center mt-1">
                        <Col>
                            <h5>Comments & Files</h5>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col xs={12} md={6}>
                            <h6>Comments</h6>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div
                                        key={comment.id || index}
                                        className="mb-2 d-flex align-items-center justify-content-between"
                                    >
                                        <div>
                                            <strong>{DateUtils.formatDate(comment.timestamp)}</strong>:{" "}
                                            <Linkify>{comment.comment}</Linkify>
                                        </div>
                                        <Button
                                            variant="link"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="p-0 text-danger"
                                            title="Delete Comment"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No comments available.</p>
                            )}
                            <Form onSubmit={handleInlineAddComment} className="mt-2 d-flex align-items-center">
                                <Form.Control
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={inlineComment}
                                    onChange={(e) => setInlineComment(e.target.value)}
                                    className="me-2"
                                />
                                <Button type="submit" variant="link" className="p-0 text-primary" title="Submit Comment">
                                    <FaPaperPlane size={24} />
                                </Button>
                            </Form>
                        </Col>
                        <Col xs={12} md={6} className="mt-3 mt-md-0">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="mb-0">Files</h6>
                                </Col>
                                <Col className="text-end">
                                    <Button
                                        variant="link"
                                        onClick={() => setShowUploadModal(true)}
                                        title="Upload Files"
                                        className="text-primary p-0"
                                    >
                                        <FaUpload size={20} />
                                    </Button>
                                </Col>
                            </Row>
                            {files.length > 0 ? (
                                <FileList files={files} />
                            ) : (
                                <p className="text-muted">No files available.</p>
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
        </>
    );
};

export default DeviceExtras;
