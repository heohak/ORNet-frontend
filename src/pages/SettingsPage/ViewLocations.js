// ViewLocations.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import AddLocationModal from "../OneClientPage/AddLocationModal";

function ViewLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const navigate = useNavigate();

    // Debounce the search query to avoid sending too many requests
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/search`, {
                    params: { q: debouncedQuery.length >= 3 ? debouncedQuery : '' }
                });
                setLocations(response.data);
                setError(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [debouncedQuery, showAddModal]); // Fetch locations whenever debouncedQuery or showAddModal changes

    const handleAddLocation = (addedLocation) => {
        // Optionally, you can add the new location to the list directly
        setLocations(prevLocations => [...prevLocations, addedLocation]);
        // Close the modal
        setShowAddModal(false);
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Locations</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Location</Button>
            </div>

            {/* Search Input */}
            <Form.Group controlId="search" className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Form.Group>

            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Container className="mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                </Container>
            ) : (
                <Row>
                    {locations.length === 0 ? (
                        <Alert variant="info">No Locations found.</Alert>
                    ) : (
                        locations.map((location) => (
                            <Col md={4} key={location.id} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{location.name}</Card.Title>
                                        <Card.Text>
                                            Address: {location.streetAddress}, {location.city}, {location.country}, {location.postalCode}
                                            <br />
                                            Phone: {location.phone}
                                            <br />
                                            Email: {location.email}
                                        </Card.Text>
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => navigate(`/edit-location/${location.id}`)}
                                        >
                                            Edit
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}
            <Button onClick={() => navigate('/settings')}>Back</Button>

            {/* Use AddLocationModal */}
            <AddLocationModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onAddLocation={handleAddLocation}
            />
        </Container>
    );
}

export default ViewLocations;
