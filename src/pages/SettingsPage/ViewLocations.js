import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import { validatePhoneAndPostalCode } from '../../utils/Validation';

function ViewLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [debouncedQuery, setDebouncedQuery] = useState(''); // State to hold debounced query

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
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/search`, {
                    params: { q: debouncedQuery.length >= 3 ? debouncedQuery : '' } // Use the query only if it has at least 3 characters
                });
                setLocations(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [debouncedQuery]); // Fetch locations whenever debouncedQuery changes

    const handleAddLocation = async (e) => {
        e.preventDefault();
        setError(null);

        const isValid = validatePhoneAndPostalCode(
            phone,
            postalCode,
            setPhoneNumberError,
            setPostalCodeError,
            setPhone,
            setPostalCode
        );
        if (isValid) {
            try {
                await axios.post(`${config.API_BASE_URL}/location/add`, {
                    name,
                    country,
                    city,
                    streetAddress,
                    postalCode,
                    phone,
                    email
                });
                setShowAddModal(false);
                setName('');
                setCity('');
                setCountry('');
                setEmail('');
                setPostalCode('');
                setStreetAddress('');
                setPhone('');
                setSearchQuery(''); // Clear the search query to show all locations
                setDebouncedQuery(''); // Reset debounced query
            } catch (error) {
                setError(error.message);
            }
        }
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

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Location</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLocation}>
                    <Modal.Body>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCity" className="mt-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter city"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCountry" className="mt-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="Enter country"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDistrict" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPostalCode" className="mt-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="Enter postal code"
                                required
                                isInvalid={!!postalCodeError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {postalCodeError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formStreetAddress" className="mt-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                placeholder="Enter street address"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone" className="mt-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                isInvalid={!!phoneNumberError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Add Location</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default ViewLocations;
