import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import LocationMaintenances from './LocationMaintenances';
import '../../css/OneClientPage/OneClient.css';
import AddLocationModal from "./AddLocationModal";
import axios from "axios";
import config from "../../config/config";

function ClientLocations({ locations, setRefresh, clientId }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);

    const handleRowClick = (location) => {
        setSelectedLocation(location);
        setShowMaintenanceModal(true);
    };

    const handleCloseMaintenanceModal = () => {
        setShowMaintenanceModal(false);
        setSelectedLocation(null);
    };

    const addLocationToCustomer = async(location) => {
        try {
            await axios.put(`${config.API_BASE_URL}/client/${clientId}/${location.id}`)
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
                        <Col md={4}>Name</Col>
                        <Col md={5}>Address</Col>
                        <Col md={3}>Phone</Col>
                    </Row>
                    <hr />

                    {/* Location rows */}
                    {sortedLocations.map((location, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={location.id}
                                className="align-items-center"
                                style={{ margin: "0 0", cursor: 'pointer' }}
                                onClick={() => handleRowClick(location)}
                            >
                                <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                                    <Row className="align-items-center">
                                        <Col md={4}>{location.name}</Col>
                                        <Col md={5}>
                                            {location.streetAddress}, {location.city}, {location.country}, {location.postalCode}
                                        </Col>
                                        <Col md={3}>{location.phone}</Col>
                                    </Row>
                                </Col>

                            </Row>
                        );
                    })}
                </div>
            ) : (
                <Alert className="mt-3" variant="info">No locations available.</Alert>
            )}

            {selectedLocation && (
                <LocationMaintenances
                    show={showMaintenanceModal}
                    handleClose={handleCloseMaintenanceModal}
                    location={selectedLocation}
                    setRefresh={setRefresh}
                />
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
