// src/pages/Devices.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';

function Devices() {
    const { clientId } = useParams();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/devices/${clientId}`);
                setDevices(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, [clientId]);

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
            <h1 className="mb-4">Devices for Client {clientId}</h1>
            <Row>
                {devices.map((device) => (
                    <Col md={4} key={device.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{device.deviceName}</Card.Title>
                                <Card.Text>
                                    <strong>Serial Number:</strong> {device.serialNumber}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Devices;
