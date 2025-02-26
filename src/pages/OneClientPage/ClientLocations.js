import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import '../../css/OneClientPage/OneClient.css';
import AddLocationModal from "./AddLocationModal";
import config from "../../config/config";
import axiosInstance from "../../config/axiosInstance";

function ClientLocations({ locations, setRefresh, clientId }) {
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);


    const addLocationToCustomer = async(location) => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/client/${clientId}/${location.id}`)
            setRefresh((prev) => !prev)
        } catch (error) {
            console.error("Error assigning location to customer", error);
        }
    }

    const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        {'Locations'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddLocationModal(true)}>Add Location</Button>
                </Col>
            </Row>
            {locations.length > 0 ? (
                <div>
                    {/* Table header */}
                    <Row className="row-margin-0 fw-bold mt-2">
                        <Col md={3}>Name</Col>
                        <Col md={3}>Address</Col>
                        <Col md={3}>Phone</Col>
                        <Col md={3}>Email</Col>
                    </Row>
                    <hr />

                    {/* Location rows */}
                    {sortedLocations.map((location, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={location.id}
                                className="align-items-center"
                                style={{ margin: "0 0"}}
                            >
                                <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                                    <Row className="align-items-center">
                                        <Col md={3}>{location.name}</Col>
                                        <Col md={3}>
                                            {location.streetAddress}, {location.city}, {location.country}, {location.postalCode}
                                        </Col>
                                        <Col md={3}>{location.phone}</Col>
                                        <Col md={3}>{location.email}</Col>
                                    </Row>
                                </Col>

                            </Row>
                        );
                    })}
                </div>
            ) : (
                <Alert className="mt-3" variant="info">No locations available.</Alert>
            )}
            <AddLocationModal
                show={showAddLocationModal}
                onHide={() => setShowAddLocationModal(false)}
                onAddLocation={addLocationToCustomer}
            />
        </>
    );
}

export default ClientLocations;
