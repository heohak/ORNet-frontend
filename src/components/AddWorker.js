import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../config/config";

function AddWorker({ clientId, onClose, setRefresh }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/all`);
                setLocations(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.post(`${config.API_BASE_URL}/worker`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
                locationId
            });
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            onClose(); // Close the modal after adding the worker
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container>
            <h1 className="mb-4">Add Worker</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        required
                    >
                        <option value="">Select a location</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Worker
                </Button>
            </Form>
        </Container>
    );
}

export default AddWorker;
