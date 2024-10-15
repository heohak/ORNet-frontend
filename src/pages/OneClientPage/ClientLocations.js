import React, { useState } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import LocationMaintenances from './LocationMaintenances';

function ClientLocations({ locations, setRefresh }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleCardClick = (location) => {
        setSelectedLocation(location);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLocation(null);
    };

    return (
        <>
            <Row>
                <h2 className="mt-1">Locations</h2>
                {locations.length > 0 ? (
                    locations.map(location => (
                        <Col md={4} key={location.id} className="mb-1">
                            <Card className="h-100 position-relative customer-page-card" onClick={() => handleCardClick(location)}>
                                <Card.Body>
                                    <Card.Title className='all-page-cardTitle'>{location.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Address:</strong> {location.streetAddress}, {location.city}, {location.country}, {location.postalCode}
                                        <br />
                                        <strong>Phone:</strong> {location.phone}
                                        <br />
                                        <strong>Email:</strong> {location.email}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Alert variant="info">No locations available.</Alert>
                )}
            </Row>

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
