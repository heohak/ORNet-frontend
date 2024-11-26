import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import LocationMaintenances from './LocationMaintenances';
import '../../css/OneClientPage/OneClient.css';

function ClientLocations({ locations, setRefresh }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleRowClick = (location) => {
        setSelectedLocation(location);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLocation(null);
    };

    const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <Row className="row-margin-0 mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        Locations
                    </h2>
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
                    show={showModal}
                    handleClose={handleCloseModal}
                    location={selectedLocation}
                    setRefresh={setRefresh}
                />
            )}
        </>
    );
}

export default ClientLocations;
