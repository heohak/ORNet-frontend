import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import axiosInstance from "../../config/axiosInstance";

function EditLinkedDeviceModal({ show, onHide, linkedDevice, onUpdate }) {
    const [name, setName] = useState(linkedDevice?.name || '');
    const [manufacturer, setManufacturer] = useState(linkedDevice?.manufacturer || '');
    const [productCode, setProductCode] = useState(linkedDevice?.productCode || '');
    const [serialNumber, setSerialNumber] = useState(linkedDevice?.serialNumber || '');
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [deviceLocation, setDeviceLocation] = useState(null);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (linkedDevice.id) {
            fetchConnectedDevice();
        }
    }, [linkedDevice.id]);

    const fetchConnectedDevice = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/device/${linkedDevice.id}`);
            setConnectedDevice(response.data);

            if (response.data.clientId) {
                const customerResponse = await axiosInstance.get(`${config.API_BASE_URL}/client/${response.data.clientId}`);
                setCustomer(customerResponse.data);
            }
            if (response.data.locationId) {
                const locationResponse = await axiosInstance.get(`${config.API_BASE_URL}/location/${response.data.locationId}`);
                setDeviceLocation(locationResponse.data);
            }
        } catch (error) {
            setError('Failed to fetch the connected device');
        }
    };

    const handleUpdateLinkedDevice = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/linked/device/update/${linkedDevice.id}`, {
                name,
                manufacturer,
                productCode,
                serialNumber,
            });
            onUpdate();
            onHide();
        } catch (error) {
            setError('Error updating linked device');
        }
    };

    const handleDeleteLinkedDevice = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/linked/device/${linkedDevice.id}`);
            onUpdate();
            setShowDeleteConfirm(false);
            onHide();
        } catch (error) {
            setError('Error deleting linked device');
        }
    };

    const showDeleteModal = () => {
        setShowDeleteConfirm(true);
    };

    const hideDeleteModal = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <Modal backdrop="static" show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Linked Device</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateLinkedDevice}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
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
                        <Form.Group controlId="formManufacturer" className="mt-3">
                            <Form.Label>Manufacturer</Form.Label>
                            <Form.Control
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                placeholder="Enter manufacturer"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formProductCode" className="mt-3">
                            <Form.Label>Product Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="Enter product code"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formSerialNumber" className="mt-3">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                placeholder="Enter serial number"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={showDeleteModal}>
                            Delete Linked Device
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Linked Device
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteConfirm} onHide={hideDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion of {linkedDevice.name} ({linkedDevice.serialNumber})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {connectedDevice ? (
                        <>
                            <p>
                                This linked device is connected to: <br />
                                <strong>{connectedDevice.deviceName}</strong>
                                {customer || deviceLocation ? (
                                    <>
                                        {' ('}
                                        {customer ? customer.shortName : 'Unknown Customer'}
                                        {deviceLocation ? `, ${deviceLocation.name}` : ''}
                                        {') '}
                                        {'('}
                                        {connectedDevice.serialNumber}
                                        {')'}
                                    </>
                                ) : null}
                            </p>
                            <p>Are you sure you want to delete it?</p>
                        </>
                    ) : (
                        <p>Are you sure you want to delete this linked device?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={hideDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteLinkedDevice}>
                        Confirm Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditLinkedDeviceModal;
