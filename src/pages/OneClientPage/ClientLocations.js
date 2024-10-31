import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import LocationMaintenances from './LocationMaintenances';

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

    return (
        <>
            <h2 className="mt-1">Locations</h2>
            {locations.length > 0 ? (
                <div>
                    {/* Table header */}
                    <Row className="font-weight-bold text-center mt-2">
                        <Col md={4}>Name</Col>
                        <Col md={5}>Address</Col>
                        <Col md={3}>Phone</Col>
                    </Row>
                    <hr />

                    {/* Location rows */}
                    {locations.map((location, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={location.id}
                                className="align-items-center text-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => handleRowClick(location)}
                            >
                                <Col md={4}>{location.name}</Col>
                                <Col md={5}>
                                    {location.streetAddress}, {location.city}, {location.country}, {location.postalCode}
                                </Col>
                                <Col md={3}>{location.phone}</Col>
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
