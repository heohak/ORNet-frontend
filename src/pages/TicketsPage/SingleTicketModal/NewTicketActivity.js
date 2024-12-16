import React, { useEffect, useState, useRef } from "react";
import { Card, ListGroup, Form, InputGroup, Button, Modal } from "react-bootstrap";
import { FaPaperPlane, FaEdit, FaCheck } from "react-icons/fa";
import axios from "axios";
import config from "../../../config/config";
import '../../../css/NewTicket.css';
import TextareaAutosize from 'react-textarea-autosize';

const NewTicketActivity = ({ ticket, reFetch, setShowAddActivityModal }) => {
    const [newActivity, setNewActivity] = useState("");
    const [activities, setActivities] = useState([]);
    const [editMode, setEditMode] = useState(null); // To track which activity is being edited
    const [editedActivity, setEditedActivity] = useState(""); // Store edited activity text
    const [showModal, setShowModal] = useState(false);
    const [modalHours, setModalHours] = useState(0);
    const [modalMinutes, setModalMinutes] = useState(0);
    const [modalPaid, setModalPaid] = useState(ticket.paid);
    const activityEndRef = useRef(null);

    useEffect(() => {
        if (ticket.activityIds.length > 0) {
            fetchActivities();
        }
    }, []);

    useEffect(() => {
        setModalPaid(ticket.paid === true);
    }, [ticket.paid]);

    useEffect(() => {
        scrollToBottom();
    }, [activities]);

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (newActivity.trim() !== "") {
            setShowAddActivityModal(true); // this is for the parent Component
            setShowModal(true);
        }
    };

    const submitActivity = async () => {
        try {
            await axios.put(
                `${config.API_BASE_URL}/ticket/activity/${ticket.id}`,
                newActivity, // Send as a plain string
                {
                    params: {
                        hours: modalHours,
                        minutes: modalMinutes,
                        paid: modalPaid,
                    },
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    },
                }
            );
            setNewActivity("");
            setModalPaid(false);
            setModalHours(0);
            setModalMinutes(0);
            setShowAddActivityModal(false);
            setShowModal(false);
            fetchActivities();
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
        setEditedActivity(currentActivity); // Set the current activity for editing
    };

    const handleSaveActivity = async (index, activityId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/activity/update/${activityId}`, {
                activity: editedActivity,
            });
            setEditMode(null); // Exit edit mode
            fetchActivities(); // Re-fetch activities to reflect the change
            reFetch();
        } catch (error) {
            console.error("Error updating activity", error);
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/activity/${ticket.id}`);
            setActivities(response.data);
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
                    {activities.map((activity, index) => (
                        <ListGroup.Item key={index} className="border-0 pb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex">
                                    <strong>{activity.author || "Author"}</strong>
                                    <p className="text-muted ms-2 mb-0">
                                        {formatDateString(activity.timestamp)}
                                    </p>
                                </div>
                                <div>
                                    {editMode === index ? (
                                        <FaCheck
                                            size={18}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleSaveActivity(index, activity.id)}
                                        />
                                    ) : (
                                        <FaEdit
                                            size={18}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleEditClick(index, activity.activity)}
                                        />
                                    )}
                                </div>
                            </div>
                            {editMode === index ? (
                                <TextareaAutosize
                                    minRows={2}
                                    value={editedActivity}
                                    onChange={(e) => setEditedActivity(e.target.value)}
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
            <Card.Footer className="bg-white border-0">
                <Form onSubmit={handleAddActivity} className="d-flex">
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Add an activity..."
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        className="border-0 flex-grow-1"
                        style={{backgroundColor: "#e9e9e9", borderRadius: "8px"}}
                    />
                    <Button
                        variant="link"
                        type="submit"
                        className="text-primary px-3 align-self-end"

                    >
                        <FaPaperPlane size={20} />
                    </Button>
                </Form>
            </Card.Footer>

            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false)
                    setShowAddActivityModal(false)
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Enter Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Hours</Form.Label>
                            <Form.Control
                                type="number"
                                value={modalHours}
                                onChange={(e) => setModalHours(parseInt(e.target.value) || 0)}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Minutes</Form.Label>
                            <Form.Control
                                type="number"
                                value={modalMinutes}
                                onChange={(e) => setModalMinutes(parseInt(e.target.value) || 0)}
                                min="0"
                                max="59"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Paid"
                                checked={modalPaid}
                                onChange={(e) => setModalPaid(e.target.checked)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowModal(false);
                        setShowAddActivityModal(false);
                    }}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitActivity}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default NewTicketActivity;
