// src/pages/ClientDevices.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import {Container, Row, Col, Card, Spinner, Alert, Button} from 'react-bootstrap';
import config from "../config/config";

function ClientDevices() {
    const { clientId } = useParams();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/devices/${clientId}`);
                setDevices(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, [clientId]);

    const handleAddDevice = () => {
        navigate('/add-client-device', { state: { clientId } });
    };

    const handleDeleteDevice = async (deviceId) => {
        setDeleteError(null);
        try {
            await axios.delete(`${config.API_BASE_URL}/device/${deviceId}`);
            setDevices(devices.filter(device => device.id !== deviceId));
        } catch (error) {
            setDeleteError(error.message);
        }
    };

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

    if (deleteError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{deleteError}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-4">Devices for Client {clientId}</h1>
                <Button variant="success" onClick={handleAddDevice} className="ms-3">Add Device</Button>
            </div>
            <Row>
                {devices.map((device) => (
                    <Col md={4} key={device.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{device.deviceName}</Card.Title>
                                <Card.Text>
                                    <strong>Serial Number:</strong> {device.serialNumber}
                                </Card.Text>
                                <Button onClick={() => navigate(`/device/${device.id}`)}>View Device</Button>
                                <Button variant="danger" className="position-absolute top-0 end-0 m-2" onClick={() => handleDeleteDevice(device.id)}>
                                    Delete
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>

    );
}

export default ClientDevices;
