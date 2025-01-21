import React, { useEffect, useState, useRef } from "react";
import { Card, ListGroup, Form, InputGroup, Button, Modal } from "react-bootstrap";
import { FaPaperPlane, FaEdit, FaSave } from "react-icons/fa";
import axios from "axios";
import config from "../../../config/config";
import '../../../css/NewTicket.css';
import TextareaAutosize from 'react-textarea-autosize';
import axiosInstance from "../../../config/axiosInstance";

const ActivityComments = ({ activity, reFetch }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [editMode, setEditMode] = useState(null); // To track which activity is being edited
    const [editedComment, setEditedComment] = useState(""); // Store edited activity text
    const [showModal, setShowModal] = useState(false);

    const activityEndRef = useRef(null);

    // useEffect(() => {
    //     if (activity.activityIds.length > 0) {
    //         fetchComments();
    //     }
    // }, []);


    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (newComment.trim() !== "") {
            setShowModal(true);
        }
    };

    const submitComment = async () => {
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/ticket/activity/${activity.id}`,
                newComment, // Send as a plain string
                {
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    },
                }
            );
            setNewComment("");

            setShowModal(false);
            fetchComments();
            reFetch();
        } catch (error) {
            console.error("Error posting the activity", error);
        }
    };

    const formatTime = (timeString) => {
        // Assuming timeString is in ISO 8601 duration format like "PT1H1M"
        const match = timeString.match(/PT(\d+H)?(\d+M)?/);
        const hours = match[1] ? match[1].replace('H', '') : '0';
        const minutes = match[2] ? match[2].replace('M', '') : '0';

        return `${hours}H ${minutes}M`;
    };

    const handleEditClick = (index, currentActivity) => {
        setEditMode(index);
        setEditedComment(currentActivity); // Set the current activity for editing
    };

    const handleSaveComment = async (index, activityId) => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/activity/update/${activityId}`, {
                activity: editedComment,
            });
            setEditMode(null); // Exit edit mode
            fetchComments(); // Re-fetch activities to reflect the change
            reFetch();
        } catch (error) {
            console.error("Error updating activity", error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/activity/${activity.id}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    const scrollToBottom = () => {
        if (activityEndRef.current) {
            activityEndRef.current.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
    };

    const formatDateString = (dateString) => {
        const date = new Date(dateString);

        // Get parts of the date
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        };

        // Format date into a readable string
        return date.toLocaleString('en-US', options);
    };

    return (
        <Card className="border-0 mt-2">
            <div className="scrollable-activity">
                <ListGroup variant="flush">
                    {comments.map((activity, index) => (
                        <ListGroup.Item key={index} className="border-0 pb-3" style={{paddingRight: '10px'}}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex">
                                    <strong>{activity.author || "Author"}</strong>
                                    <p className="text-muted ms-2 mb-0">
                                        {formatDateString(activity.timestamp)}
                                    </p>
                                </div>
                                <div>
                                    {editMode === index ? (
                                        <FaSave
                                            size={25}
                                            style={{ cursor: "pointer", opacity: "0.7" }}
                                            onClick={() => handleSaveComment(index, activity.id)}
                                        />
                                    ) : (
                                        <FaEdit
                                            size={25}
                                            style={{ cursor: "pointer", opacity: "0.7" }}
                                            onClick={() => handleEditClick(index, activity.activity)}
                                        />
                                    )}
                                </div>
                            </div>
                            {editMode === index ? (
                                <TextareaAutosize
                                    minRows={2}
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                    className="mt-2"
                                    style={{width: "100%"}}
                                />
                            ) : (
                                <p className="mb-0 bg-white p-0 rounded">
                                    {activity && activity.activity &&
                                        activity.activity.split("\n").map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                </p>
                            )}
                            <p style={{ fontStyle: 'italic', color: 'gray' }}>
                                {activity.paid ? `Paid Time: ${formatTime(activity.timeSpent)}` : `Time Spent: ${formatTime(activity.timeSpent)}`}
                            </p>
                        </ListGroup.Item>
                    ))}
                    <div ref={activityEndRef} />
                </ListGroup>
            </div>
            <Card.Footer className="bg-white border-0" style={{paddingRight: "0"}}>
                <Form onSubmit={handleAddComment} className="d-flex">
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Add an activity..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="border-0 flex-grow-1"
                        style={{backgroundColor: "#e9e9e9", borderRadius: "8px"}}
                    />
                    <Button
                        variant="link"
                        type="submit"
                        className="text-primary align-self-end"
                        style={{padding: '0 10px 0 10px'}}

                    >
                        <FaPaperPlane size={30} />
                    </Button>
                </Form>
            </Card.Footer>


        </Card>
    );
};

export default ActivityComments;
