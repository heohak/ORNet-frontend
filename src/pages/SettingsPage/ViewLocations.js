import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [district, setDistrict] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/all`);
                setLocations(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const handleAddLocation = async () => {
        try {
            const combinedAddress = `${streetAddress}, ${district}, ${city}, ${postalCode}, ${country}`;
            await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address: combinedAddress,
                phone
            });
            const response = await axios.get(`${config.API_BASE_URL}/location/all`);
            setLocations(response.data);
            setShowAddModal(false);
            // Clear the form fields
            setName('');
            setCity('');
            setCountry('');
            setDistrict('');
            setPostalCode('');
            setStreetAddress('');
            setPhone('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteLocation = async (id) => {
        try {
            await axios.delete(`${config.API_BASE_URL}/location/${id}`);
            const response = await axios.get(`${config.API_BASE_URL}/location/all`);
            setLocations(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Locations</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Location</Button>
            </div>
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
                    {locations.map((location) => (
                        <Col md={4} key={location.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{location.name}</Card.Title>
                                    <Card.Text>
                                        Address: {location.address}
                                        <br />
                                        Phone: {location.phone}
                                    </Card.Text>
                                    <Button variant="danger" onClick={() => handleDeleteLocation(location.id)}>Delete</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            <Button onClick={() => navigate(-1)}>Back</Button>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
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
                            <Form.Label>District</Form.Label>
                            <Form.Control
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder="Enter district"
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
                            />
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
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddLocation}>Add Location</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewLocations;
