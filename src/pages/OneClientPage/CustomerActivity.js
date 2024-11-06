import {Alert, Col, Row} from "react-bootstrap";
import React, {useState} from "react";


const CustomerActivity = ({ activities, setActivities }) => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showModal, setShowModal] = useState(false);


    const handleRowClick = (location) => {
        setSelectedActivity(location);
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
                                <Col md={4}>{activity.title}</Col>
                                <Col md={5}>
                                    {activity.streetAddress}
                                </Col>
                                <Col md={3}>{activity.phone}</Col>
                            </Row>
                        );
                    })}
                </div>
            ) : (
                <Alert className="mt-3" variant="info">No activities available.</Alert>
            )}
        </>
    );
}
export default CustomerActivity;