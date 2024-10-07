import React, { useEffect, useState } from "react";
import { Card, ListGroup, Form, InputGroup, Button } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";  // Importing the send icon
import axios from "axios";
import config from "../../../../config/config";

const NewTicketActivity = ({ ticketId }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchComments();
    }, []);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (newComment.trim() !== "") {
            try {
                await axios.put(`${config.API_BASE_URL}/ticket/comment/${ticketId}`, null, {
                    params: {
                        comment: newComment,
                    },
                });
                setNewComment("");
                fetchComments();
            } catch (error) {
                console.error("Error posting the comment", error);
            }
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/comment/${ticketId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    return (
        <Card className="border-0 mt-2">
            <ListGroup variant="flush">
                {comments.map((comment, index) => (
                    <ListGroup.Item key={index} className="border-0 pb-3">
                        <div className="d-flex">
                            <strong>{comment.author || "Author"}</strong>
                            <p className="text-muted ms-2 mb-0">{new Date(comment.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="mb-0 bg-white p-0 rounded">{comment.comment}</p>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Card.Footer className="bg-white border-0">
                <div style={{ border: "2px solid rgba(0, 0, 0, 0.5)", borderRadius: "5px", overflow: "hidden" }}>
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="border-0 shadow-sm"
                            style={{ resize: "none"}}
                        />
                        <Button
                            variant="link"
                            onClick={handleAddComment}
                            className="text-primary px-3"
                            style={{ borderLeft: "none", backgroundColor: "white", paddingTop: 0 }} // Remove the default button border
                        >
                            <FaPaperPlane size={20} />
                        </Button>
                    </InputGroup>
                </div>
            </Card.Footer>

        </Card>
    );
};

export default NewTicketActivity;
