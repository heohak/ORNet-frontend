import {Alert, Button, Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import ActivityModal from "./ActivityModal";
import axios from "axios";
import config from "../../../config/config";
import AddActivityModal from "./AddActivityModal";


const CustomerActivity = ({ activities, setActivities, clientId, clientName, locations, contacts }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [statuses, setStatuses] = useState([]);


    useEffect(() => {
        fetchStatuses();
    },[]);
    const fetchStatuses = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`)
            setStatuses(response.data);
        } catch (error) {
            console.error('Error fetching ticket classificators', error);
        }
    }

    const getStatusColor = (endDateTime) => {
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

    const reFetchActivities = async() => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/activities/${clientId}`)
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities', error);
        }
    }
    const handleRowClick = (activity) => {
        setSelectedActivity(activity);
        setShowActivityModal(true);
    };

    const handleCloseModal = () => {
        setShowActivityModal(false);
        setSelectedActivity(null);
    };




    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        {'Activities'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Activity</Button>
                </Col>
            </Row>
            {activities.length > 0 ? (
                <div>
                    {/* Table header */}
                    <Row className="fw-bold mt-2">
                        <Col md={3}>Title</Col>
                        <Col md={3}>Contact</Col>
                        <Col md={3}>Date/Deadline?</Col>
                        <Col md={3}>Status</Col>
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
                        const statusColor = getStatusColor(activity.endDateTime)
                        return (
                            <Row
                                key={activity.id}
                                className="align-items-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => handleRowClick(activity)}
                            >
                                <Col md={3}>{activity.title}</Col>
                                <Col md={3}>{contactNames}</Col>
                                <Col md={3}>{activity.endDateTime}</Col>
                                <Col md={3}>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: statusColor,
                                            marginRight: '8px',
                                        }}
                                    />
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
                    reFetch={reFetchActivities}
                    clientName={clientName}
                    locations={locations}
                    statuses={statuses}
                />
            }
            <AddActivityModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                reFetch={reFetchActivities}
                clientId={clientId}
                clientContacts={contacts}
                clientLocations={locations}
                clientName={clientName}
            />
        </>
    );
}
export default CustomerActivity;