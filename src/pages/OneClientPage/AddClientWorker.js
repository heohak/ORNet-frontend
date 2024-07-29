import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';

function AddClientWorker({ clientId, onClose, onSuccess }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationsResponse, rolesResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/worker/classificator/all`)
                ]);
                setLocations(locationsResponse.data);
                setRoles(rolesResponse.data.map(role => ({ value: role.id, label: role.role })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/worker/add`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
                locationId,
            });

            if (response.data && response.data.token) {
                const workerId = response.data.token;

                await axios.put(`${config.API_BASE_URL}/worker/${workerId}/${clientId}`);

                for (const role of selectedRoles) {
                    await axios.put(`${config.API_BASE_URL}/worker/role/${workerId}/${role.value}`);
                }

                const newWorker = {
                    id: workerId,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    title,
                    location: locations.find(loc => loc.id === locationId),
                    roles: selectedRoles.map(role => role.label),
                };

                onSuccess(newWorker); // Call the onSuccess function with the new worker data
            }

            onClose(); // Close the modal after adding the worker
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container>
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
                <Form.Group className="mb-3">
                    <Form.Label>Roles</Form.Label>
                    <Select
                        isMulti
                        options={roles}
                        value={selectedRoles}
                        onChange={setSelectedRoles}
                        placeholder="Select roles"
                    />
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Worker
                </Button>
            </Form>
        </Container>
    );
}

export default AddClientWorker;
