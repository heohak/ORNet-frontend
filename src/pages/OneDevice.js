import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button, ListGroup } from 'react-bootstrap';

function OneDevice() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
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

        const fetchLinkedDevices = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/linked/device/${deviceId}`);
                setLinkedDevices(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDevice();
        fetchLinkedDevices();
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

            <h2 className="mb-4">Linked Devices</h2>
            {linkedDevices.length > 0 ? (
                <ListGroup>
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{linkedDevice.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Manufacturer:</strong> {linkedDevice.manufacturer}<br />
                                        <strong>Product Code:</strong> {linkedDevice.productCode}<br />
                                        <strong>Serial Number:</strong> {linkedDevice.serialNumber}<br />
                                        <strong>Comment:</strong> {linkedDevice.comment}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert variant="info">No linked devices available.</Alert>
            )}
        </Container>
    );
}

export default OneDevice;
