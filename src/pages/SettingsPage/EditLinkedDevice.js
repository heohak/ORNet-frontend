import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';

function EditLinkedDevice() {
    const location = useLocation();
    const navigate = useNavigate();
    const linkedDevice = location.state?.linkedDevice;

    const [name, setName] = useState(linkedDevice?.name || '');
    const [manufacturer, setManufacturer] = useState(linkedDevice?.manufacturer || '');
    const [productCode, setProductCode] = useState(linkedDevice?.productCode || '');
    const [serialNumber, setSerialNumber] = useState(linkedDevice?.serialNumber || '');
    const [error, setError] = useState(null);

    const handleUpdateLinkedDevice = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/linked/device/update/${linkedDevice.id}`, {
                name,
                manufacturer,
                productCode,
                serialNumber,
            });
            navigate('/settings/linked-devices');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteLinkedDevice = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/linked/device/${linkedDevice.id}`);
            navigate('/settings/linked-devices');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Edit Linked Device</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                    />
                </Form.Group>
                <Form.Group controlId="formManufacturer" className="mt-3">
                    <Form.Label>Manufacturer</Form.Label>
                    <Form.Control
                        type="text"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        placeholder="Enter manufacturer"
                    />
                </Form.Group>
                <Form.Group controlId="formProductCode" className="mt-3">
                    <Form.Label>Product Code</Form.Label>
                    <Form.Control
                        type="text"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                        placeholder="Enter product code"
                    />
                </Form.Group>
                <Form.Group controlId="formSerialNumber" className="mt-3">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Enter serial number"
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" onClick={handleUpdateLinkedDevice}>
                    Update Linked Device
                </Button>
                <Button variant="danger" className="mt-3 ms-2" onClick={handleDeleteLinkedDevice}>
                    Delete Linked Device
                </Button>
                <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate('/settings/linked-devices')}>
                    Cancel
                </Button>
            </Form>
        </Container>
    );
}

export default EditLinkedDevice;
