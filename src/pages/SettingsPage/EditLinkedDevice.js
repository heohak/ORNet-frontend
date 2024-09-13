import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
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
    const [connectedDevice, setConnectedDevice] = useState(null); // Store the connected device
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Fetch the device to which the linked device is connected when the delete modal is shown
    const showDeleteModal = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/device/${linkedDevice.id}`);
            setConnectedDevice(response.data); // This will store the connected device information
        } catch (error) {
            setError('Failed to fetch the connected device');
        }
        setShowDeleteConfirm(true);
    };

    const handleDeleteLinkedDevice = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/linked/device/${linkedDevice.id}`);
            setShowDeleteConfirm(false);
            navigate('/settings/linked-devices');
        } catch (error) {
            setError(error.message);
        }
    };

    const hideDeleteModal = () => setShowDeleteConfirm(false);

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
                <Button variant="danger" className="mt-3 ms-2" onClick={showDeleteModal}>
                    Delete Linked Device
                </Button>
                <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate('/settings/linked-devices')}>
                    Cancel
                </Button>
            </Form>

            {/* Modal for Delete Confirmation */}
            <Modal show={showDeleteConfirm} onHide={hideDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {connectedDevice ? (
                        <p>
                            This linked device is connected to the following device: <strong>{connectedDevice.deviceName}</strong>.
                            <br />
                            Are you sure you want to delete it?
                        </p>
                    ) : (
                        <p>Are you sure you want to delete this linked device?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteLinkedDevice}>
                        Confirm Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default EditLinkedDevice;
