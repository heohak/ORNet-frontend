import {Alert, Col, Row} from "react-bootstrap";
import React, {useState} from "react";
import ActivityModal from "./ActivityModal";
import axios from "axios";
import config from "../../../config/config";


const CustomerActivity = ({ activities, setActivities, clientId }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [locationName, setLocationName] = useState('');


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
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedActivity(null);
    };




    return (
        <>
            <Row className="mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        Activities
                    </h2>
                </Col>
            </Row>
            {activities.length > 0 ? (
                <div>
                    {/* Table header */}
                    <Row className="font-weight-bold text-center mt-2">
                        <Col md={3}>Title</Col>
                        <Col md={3}>Contact</Col>
                        <Col md={3}>Date/Deadline?</Col>
                        <Col md={3}>Status</Col>
                    </Row>
                    <hr />

                    {/* Activity rows */}
                    {activities.map((activity, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={activity.id}
                                className="align-items-center text-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => handleRowClick(activity)}
                            >
                                <Col md={3}>{activity.title}</Col>
                                <Col md={3}>Contact?</Col>
                                <Col md={3}>{activity.endDateTime}</Col>
                                <Col md={3}>{activity.statusId}</Col>

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
                />
            }
        </>
    );
}
export default CustomerActivity;