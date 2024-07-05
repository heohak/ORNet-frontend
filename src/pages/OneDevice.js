// src/pages/OneDevice.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';

function OneDevice() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/device/${deviceId}`);
                setDevice(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDevice();
    }, [deviceId]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Device Details</h1>
            {device ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{device.deviceName}</Card.Title>
                        <Card.Text>
                            <strong>Serial Number:</strong> {device.serialNumber}<br />
                            <strong>Description:</strong> {device.description}
                        </Card.Text>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}
        </Container>
    );
}

export default OneDevice;
