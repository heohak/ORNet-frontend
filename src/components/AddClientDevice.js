import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function AddClientDevice() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};

    const [deviceName, setDeviceName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            return;
        }

        try {
            await axios.post('http://localhost:8080/device', {
                clientId,
                deviceName,
                serialNumber,
            });
            navigate(-1); // Go back to the previous page
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Device</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Device Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        required
                        pattern="\d+" // Only allow numbers
                        title="Serial number should only contain numbers"
                    />
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Device
                </Button>
            </Form>
        </Container>
    );
}

export default AddClientDevice;
