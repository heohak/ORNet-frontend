import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import ActivityModal from "./ActivityModal";
import axios from "axios";
import config from "../../../config/config";
import AddActivityModal from "./AddActivityModal";
import '../../../css/OneClientPage/OneClient.css';
import axiosInstance from "../../../config/axiosInstance";

const CustomerActivity = ({ activities, setActivities, clientId, clientName, locations, contacts, statuses, openStatusId}) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState(openStatusId);


    useEffect(() => {
        filterActivities()
    },[selectedStatusId])

    const filterActivities = async() => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client-activity/search`, {
                params: {
                    statusId: selectedStatusId,
                    clientId: clientId
                },
            });
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching filtered activities", error);
        }
    }

    const getDeadlineColor = (endDateTime) => {
        if (!endDateTime) {
            return 'green';
        }
        const now = new Date();
        const endDate = new Date(endDateTime);

        // If endDate is before today
        if (endDate < now) {
            return 'red';
        }

        // Calculate the difference in milliseconds and convert to days
        const diffInDays = (endDate - now) / (1000 * 60 * 60 * 24);

        // If the end date is within a week
        if (diffInDays <= 7) {
            return 'orange';
        }

        // If the end date is more than a week away
        return 'green';
    };

    const handleRowClick = (activity) => {
        setSelectedActivity(activity);
        setShowActivityModal(true);
    };

    const handleCloseModal = () => {
        setShowActivityModal(false);
        setSelectedActivity(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "N/A"
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // This will format it to DD.MM.YYYY
    };




    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        {'Activities'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Activity</Button>
                </Col>
            </Row>
            <Row className="row-margin-0">
                <Col className="mb-2" md={3}>
                    <Form.Group controlId="classificatorFilter">
                        <Form.Label>Filter by Status</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedStatusId}
                            onChange={(e) => setSelectedStatusId(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>{status.status}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            {activities.length > 0 ? (
                <div>
                    {/* Table header */}
                    <Row className="row-margin-0 fw-bold mt-2">
                        <Col md={3}>Title</Col>
                        <Col md={3}>Contact</Col>
                        <Col md={3}>Deadline</Col>
                        <Col className="d-flex justify-content-center" md={1}>State</Col>
                        <Col className="d-flex justify-content-center" md={1}>Status</Col>
                        <Col className="d-flex justify-content-center" md={1}>Priority</Col>
                    </Row>
                    <hr />

                    {/* Activity rows */}
                    {activities.map((activity, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        const contactNames = activity.contactIds
                            .map(contactId => {
                                const contact = contacts.find(c => c.id === contactId);
                                return contact ? (contact.firstName + " " + contact.lastName) : null; // Handle cases where a contact might not be found
                            })
                            .filter(name => name) // Filter out null values if any contacts were not found
                            .join(', '); // Join names with a comma for display
                        const deadlineColor = getDeadlineColor(activity.endDateTime)
                        const status = statuses.find(status => activity.statusId === status.id)
                        const priorityColor = activity.crisis ? "red" : "green"
                        return (
                            <Row
                                key={activity.id}
                                className="align-items-center"
                                style={{cursor: 'pointer', margin: "0 0"}}
                                onClick={() => handleRowClick(activity)}
                            >
                                <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                                    <Row className="align-items-center">
                                        <Col md={3}>{activity.title}</Col>
                                        <Col md={3}>{contactNames}</Col>
                                        <Col md={3}>{formatDate(activity.endDateTime)}</Col>
                                        <Col className="d-flex align-content-center justify-content-center" md={1}>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: deadlineColor
                                        }}
                                    />
                                        </Col>
                                        <Col className="d-flex align-content-center justify-content-center" md={1}>
                                            <Button
                                                style={{
                                                    minWidth: "75px",
                                                    backgroundColor: status?.color || '#007bff',
                                                    borderColor: status?.color || '#007bff'
                                                }}
                                                disabled
                                            >
                                                {status?.status || "N/A"}
                                            </Button>
                                        </Col>
                                        <Col className="d-flex align-content-center justify-content-center" md={1}>
                                            <Button
                                                style={{ backgroundColor: priorityColor, borderColor: priorityColor }}
                                                disabled
                                            ></Button>
                                        </Col>
                                    </Row>
                                </Col>


                            </Row>
                        );
                    })}
                </div>
            ) : (
                <Alert className="mt-3" variant="info">No activities available.</Alert>
            )}
            {selectedActivity &&
                <ActivityModal
                    activity={selectedActivity}
                    handleClose={handleCloseModal}
                    reFetch={filterActivities}
                    clientName={clientName}
                    locations={locations}
                    statuses={statuses}
                />
            }
            <AddActivityModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                reFetch={filterActivities}
                clientId={clientId}
                clientContacts={contacts}
                clientLocations={locations}
                clientName={clientName}
            />
        </>
    );
}
export default CustomerActivity;