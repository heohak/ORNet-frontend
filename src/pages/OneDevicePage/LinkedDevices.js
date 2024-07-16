import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import config from "../../config/config";

function LinkedDevices({
                           linkedDevices,
                           showModal,
                           setShowModal,
                           availableLinkedDevices,
                           selectedLinkedDeviceId,
                           setSelectedLinkedDeviceId,
                           handleLinkDevice,
                           deviceId,
                           setLinkedDevices
                       }) {
    const [visibleFields, setVisibleFields] = useState({});
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [showAddNewDeviceForm, setShowAddNewDeviceForm] = useState(false);
    const [newLinkedDevice, setNewLinkedDevice] = useState({
        name: '',
        manufacturer: '',
        productCode: '',
        serialNumber: '',
        comment: ''
    });
    const [newField, setNewField] = useState({ key: '', value: '' });
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);
    const [targetDevice, setTargetDevice] = useState('All');

    useEffect(() => {
        const storedVisibleFields = localStorage.getItem('visibleFields');
        if (storedVisibleFields) {
            setVisibleFields(JSON.parse(storedVisibleFields));
        } else if (linkedDevices.length > 0) {
            initializeVisibleFields(linkedDevices);
        }
    }, [linkedDevices]);

    const initializeVisibleFields = (devices) => {
        const allKeys = new Set();
        devices.forEach(device => {
            Object.keys(device).forEach(key => allKeys.add(key));
            if (device.attributes) {
                Object.keys(device.attributes).forEach(key => allKeys.add(key));
            }
        });

        const initialVisibleFields = {};
        allKeys.forEach(key => initialVisibleFields[key] = true);

        console.log("Initialized visible fields:", initialVisibleFields);
        setVisibleFields(initialVisibleFields);
        localStorage.setItem('visibleFields', JSON.stringify(initialVisibleFields));
    };

    const handleFieldToggle = (field) => {
        setVisibleFields(prevVisibleFields => {
            const newVisibleFields = { ...prevVisibleFields, [field]: !prevVisibleFields[field] };
            console.log("Updated visible fields:", newVisibleFields);
            localStorage.setItem('visibleFields', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        return Object.keys(data).map(key => {
            if (visibleFields[key] && data[key] !== null) {
                if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                    return (
                        <div key={key} className="mb-2">
                            {renderFields(data[key])}
                        </div>
                    );
                }
                return (
                    <div key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {data[key]}
                    </div>
                );
            }
            return null;
        });
    };

    const handleAddNewLinkedDevice = async () => {
        try {
            console.log("Adding new linked device:", newLinkedDevice);
            const response = await axios.post(`${config.API_BASE_URL}/linked/device/add`, newLinkedDevice);
            const newDeviceId = response.data.token;

            await axios.put(`${config.API_BASE_URL}/linked/device/link/${newDeviceId}/${deviceId}`);
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            setShowModal(false);
        } catch (error) {
            console.error('Error adding new linked device:', error);
        }
    };

    const handleAddField = async () => {
        if (newField.key.trim() === '' || newField.value.trim() === '') {
            alert('Please enter both key and value for the new field.');
            return;
        }

        const attribute = { [newField.key]: newField.value };

        try {
            if (targetDevice === 'All') {
                await Promise.all(
                    linkedDevices.map(device =>
                        axios.put(`${config.API_BASE_URL}/linked/device/${device.id}/attributes`, attribute)
                    )
                );
            } else {
                await axios.put(`${config.API_BASE_URL}/linked/device/${targetDevice}/attributes`, attribute);
            }
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeVisibleFields(updatedLinkedDevices.data);
        } catch (error) {
            console.error('Error adding new field:', error);
        }

        setNewField({ key: '', value: '' });
        setShowAddFieldForm(false);
    };

    return (
        <>
            <h2 className="mb-4">
                Linked Devices
                <Button variant="link" className="float-end mb-3" onClick={() => setShowFieldModal(true)}>Edit Fields</Button>
            </h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>Link Device</Button>
            {linkedDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{linkedDevice.name}</Card.Title>
                                    {renderFields({
                                        ...Object.fromEntries(Object.entries(linkedDevice).filter(([key]) => key !== 'attributes')),
                                        ...linkedDevice.attributes
                                    })}
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No linked devices available.</Alert>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!showAddNewDeviceForm && (
                        <>
                            <Form.Group controlId="selectDevice">
                                <Form.Label>Select Device to Link</Form.Label>
                                <Form.Control as="select" value={selectedLinkedDeviceId} onChange={(e) => setSelectedLinkedDeviceId(e.target.value)}>
                                    <option value="">Select a device...</option>
                                    {availableLinkedDevices.map((linkedDevice) => (
                                        <option key={linkedDevice.id} value={linkedDevice.id}>
                                            {linkedDevice.name} (Serial: {linkedDevice.serialNumber})
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Button variant="link" onClick={() => setShowAddNewDeviceForm(true)}>
                                Or add a new device
                            </Button>
                        </>
                    )}
                    {showAddNewDeviceForm && (
                        <>
                            <Form.Group controlId="newDeviceName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newLinkedDevice.name}
                                    onChange={(e) => setNewLinkedDevice({ ...newLinkedDevice, name: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </Form.Group>
                            <Form.Group controlId="newDeviceManufacturer">
                                <Form.Label>Manufacturer</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newLinkedDevice.manufacturer}
                                    onChange={(e) => setNewLinkedDevice({ ...newLinkedDevice, manufacturer: e.target.value })}
                                    placeholder="Enter manufacturer"
                                />
                            </Form.Group>
                            <Form.Group controlId="newDeviceProductCode">
                                <Form.Label>Product Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newLinkedDevice.productCode}
                                    onChange={(e) => setNewLinkedDevice({ ...newLinkedDevice, productCode: e.target.value })}
                                    placeholder="Enter product code"
                                />
                            </Form.Group>
                            <Form.Group controlId="newDeviceSerialNumber">
                                <Form.Label>Serial Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newLinkedDevice.serialNumber}
                                    onChange={(e) => setNewLinkedDevice({ ...newLinkedDevice, serialNumber: e.target.value })}
                                    placeholder="Enter serial number"
                                />
                            </Form.Group>
                            <Form.Group controlId="newDeviceComment">
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={newLinkedDevice.comment}
                                    onChange={(e) => setNewLinkedDevice({ ...newLinkedDevice, comment: e.target.value })}
                                    placeholder="Enter comment"
                                />
                            </Form.Group>
                            <Button variant="link" onClick={() => setShowAddNewDeviceForm(false)}>
                                Back to select existing device
                            </Button>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    {showAddNewDeviceForm ? (
                        <Button variant="primary" onClick={handleAddNewLinkedDevice}>Add and Link Device</Button>
                    ) : (
                        <Button variant="primary" onClick={handleLinkDevice}>Link Device</Button>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Linked Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {Object.keys(visibleFields).filter(key => key !== 'attributes').map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                        <hr />
                        {showAddFieldForm ? (
                            <>
                                <Form.Group controlId="selectTargetDevice">
                                    <Form.Label>Select Device to Add Attribute</Form.Label>
                                    <Form.Control as="select" value={targetDevice} onChange={(e) => setTargetDevice(e.target.value)}>
                                        <option value="All">All Devices</option>
                                        {linkedDevices.map((linkedDevice) => (
                                            <option key={linkedDevice.id} value={linkedDevice.id}>
                                                {linkedDevice.name} (ID: {linkedDevice.id})
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Field Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.key}
                                        onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Field Value</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.value}
                                        onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                                    />
                                </Form.Group>
                                <Button variant="success" onClick={handleAddField} className="mt-3">
                                    Add Field
                                </Button>
                            </>
                        ) : (
                            <Button variant="link" className="text-success" onClick={() => setShowAddFieldForm(true)}>
                                <FaPlus /> Add Field
                            </Button>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LinkedDevices;
