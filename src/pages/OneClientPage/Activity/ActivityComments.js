import React, {useEffect, useState, useRef, forwardRef, useImperativeHandle} from "react";
import { Card, ListGroup, Form, Button } from "react-bootstrap";
import TextareaAutosize from "react-textarea-autosize";
import { FaPaperPlane } from "react-icons/fa";
import axiosInstance from "../../../config/axiosInstance";
import {DateUtils} from "../../../utils/DateUtils";

const ActivityComments = forwardRef(({ activity, reFetch, isEditing }, ref) => {
    const [comments, setComments] = useState([]);
    const [editedComments, setEditedComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const activityEndRef = useRef(null);

    useEffect(() => {
        if (activity.activityIds.length > 0) {
            fetchComments();
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    useImperativeHandle(ref, () => ({
        saveChanges: handleCommentsSave, // Expose this function to parent
    }));

    const handleCommentsSave = async() => {
        try {
            await Promise.all(
                comments.map((comment, index) =>
                    axiosInstance.put(
                        `/activity/update/${comment.id}`,
                        { activity: editedComments[index] }
                    )
                )
            );
            fetchComments();
            reFetch();
        } catch (error) {
            console.error("Error saving comments:", error);
        }
    }

    const fetchComments = async () => {
        try {
            const response = await axiosInstance.get(
                `/client-activity/activity/${activity.id}`
            );
            setComments(response.data);
            setEditedComments(response.data.map((c) => c.activity));
        } catch (error) {
            console.error("Error fetching activity comments:", error);
        }
    };

    const handleCommentChange = (index, value) => {
        const updatedComments = [...editedComments];
        updatedComments[index] = value;
        setEditedComments(updatedComments);
    };

    const scrollToBottom = () => {
        if (activityEndRef.current) {
            activityEndRef.current.scrollIntoView({ block: "nearest", inline: "start" });
        }
    };

    const submitNewComment = async (e) => {
        e.preventDefault();
        if (newComment.trim() === "") return;

        try {
            await axiosInstance.put(
                `/client-activity/activity/${activity.id}`,
                newComment,
                { headers: { "Content-Type": "text/plain" } }
            );
            setNewComment("");
            fetchComments();
            reFetch();
        } catch (error) {
            console.error("Error posting activity", error);
        }
    };


    return (
        <Card className="border-0 mt-2">
            <div className="scrollable-activity">
                <ListGroup variant="flush">
                    {comments.map((activity, index) => (
                        <ListGroup.Item key={index} className="border-0 pb-3">
                            <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                                {DateUtils.formatDate(activity.timestamp)}
                            </p>
                            {isEditing ? (
                                <TextareaAutosize
                                    minRows={2}
                                    value={editedComments[index]}
                                    onChange={(e) => handleCommentChange(index, e.target.value)}
                                    className="mt-2"
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    {activity.activity &&
                                        activity.activity.split("\n").map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                </div>
                            )}
                        </ListGroup.Item>
                    ))}
                    <div ref={activityEndRef} />
                </ListGroup>
            </div>
            <Card.Footer className="bg-white border-0">
                <Form onSubmit={submitNewComment} className="d-flex align-items-center">
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Add an activity..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="border-0 flex-grow-1"
                        style={{
                            backgroundColor: "#e9e9e9",
                            borderRadius: "8px",
                            padding: "8px",
                        }}
                    />
                    <Button
                        variant="link"
                        type="submit"
                        className="text-primary align-self-end ms-2"
                    >
                        <FaPaperPlane size={24} />
                    </Button>
                </Form>
            </Card.Footer>
        </Card>
    );
});

export default ActivityComments;
