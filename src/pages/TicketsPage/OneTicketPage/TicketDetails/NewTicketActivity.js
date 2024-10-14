import React, { useEffect, useState, useRef } from "react";
import { Card, ListGroup, Form, InputGroup, Button } from "react-bootstrap";
import { FaPaperPlane, FaEdit, FaCheck } from "react-icons/fa";
import axios from "axios";
import config from "../../../../config/config";
import '../../../../css/NewTicket.css';

const NewTicketActivity = ({ ticket, reFetch }) => {
    const [newActivity, setNewActivity] = useState("");
    const [activities, setActivities] = useState([]);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [paid, setPaid] = useState(false);
    const [editMode, setEditMode] = useState(null); // To track which activity is being edited
    const [editedActivity, setEditedActivity] = useState(""); // Store edited activity text
    const activityEndRef = useRef(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [activities]);

    useEffect(() => {
        setPaid(ticket.paid === true);
    }, [ticket.paid]);

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (newActivity.trim() !== "") {
            try {
                await axios.put(`${config.API_BASE_URL}/ticket/activity/${ticket.id}`, null, {
                    params: {
                        activity: newActivity,
                        hours,
                        minutes,
                        paid
                    },
                });
                setNewActivity("");
                setHours(0);
                setMinutes(0);
                setPaid(ticket.paid === true);
                fetchActivities();
                reFetch();
            } catch (error) {
                console.error("Error posting the activity", error);
            }
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
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    {editMode === index ? (
                                        <FaCheck
                                            size={18}
                                            style={{ cursor: "pointer"}}
                                            onClick={() => handleSaveActivity(index, activity.id)} // Save changes
                                        />
                                    ) : (
                                        <FaEdit
                                            size={18}
                                            style={{ cursor: "pointer"}}
                                            onClick={() => handleEditClick(index, activity.activity)} // Edit mode
                                        />
                                    )}
                                </div>
                            </div>
                            {editMode === index ? (
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={editedActivity}
                                    onChange={(e) => setEditedActivity(e.target.value)}
                                    className="mt-2"
                                />
                            ) : (
                                <p className="mb-0 bg-white p-0 rounded">{activity.activity}</p>
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
                <div style={{ border: "2px solid rgba(0, 0, 0, 0.5)", borderRadius: "5px", padding: '10px', paddingRight: 0 }}>
                    <Form onSubmit={handleAddActivity}>
                        <InputGroup className="custom-checkbox-container d-flex align-items-center">
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Add an activity..."
                                value={newActivity}
                                onChange={(e) => setNewActivity(e.target.value)}
                                className="border-0"
                                style={{ resize: "none", flex: 2 }}
                            />

                            <Form.Control
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value))}
                                min="0"
                                placeholder="Hours"
                                className="border-0"
                                style={{ maxWidth: "60px", appearance: "textfield" }}
                            />
                            <InputGroup.Text>h</InputGroup.Text>

                            <Form.Control
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(parseInt(e.target.value))}
                                min="0"
                                max="59"
                                placeholder="Minutes"
                                className="border-0"
                                style={{ maxWidth: "60px", appearance: "textfield" }}
                            />
                            <InputGroup.Text>m</InputGroup.Text>

                            <Form.Group className="d-flex align-items-center justify-content-center ms-3">
                                <InputGroup.Checkbox
                                    aria-label="Paid"
                                    checked={paid}
                                    onChange={(e) => setPaid(e.target.checked)}
                                />
                                <Form.Label className="ms-2" style={{ fontSize: '14px', marginBottom: 0 }}>Paid</Form.Label>
                            </Form.Group>

                            <Button
                                variant="link"
                                type="submit"
                                className="text-primary px-3"
                                style={{ borderLeft: "none", backgroundColor: "white", paddingTop: 0 }}
                            >
                                <FaPaperPlane size={20} />
                            </Button>
                        </InputGroup>
                    </Form>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default NewTicketActivity;
