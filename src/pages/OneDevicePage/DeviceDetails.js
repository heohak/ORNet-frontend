import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa'; // Assuming you have react-icons installed
import axios from 'axios';
import config from "../../config/config";

function DeviceDetails({ device, navigate, setShowFileUploadModal }) {
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [visibleDeviceFields, setVisibleDeviceFields] = useState({});
    const [newField, setNewField] = useState({ key: '', value: '', addToAll: false });
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);
    const [localDevice, setLocalDevice] = useState(device);

    useEffect(() => {
        if (localDevice) {
            initializeVisibleFields(localDevice);
        }
    }, [localDevice]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('deviceVisibilityState');
        if (savedVisibilityState) {
            const parsedVisibilityState = JSON.parse(savedVisibilityState);
            const newFields = getAllKeys(data).filter(key => !(key in parsedVisibilityState));
            const newVisibilityState = newFields.reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleDeviceFields({ ...parsedVisibilityState, ...newVisibilityState });
        } else {
            const initialVisibleFields = getAllKeys(data).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleDeviceFields(initialVisibleFields);
        }
    };

    const getAllKeys = (data, prefix = '') => {
        return Object.keys(data).flatMap(key => {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
                return getAllKeys(data[key], newKey);
            }
            return newKey;
        });
    };

    const handleFieldToggle = (field) => {
        setVisibleDeviceFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem('deviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data, prefix = '') => {
        return Object.keys(data).map(key => {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (data[key] !== null && visibleDeviceFields[newKey]) {
                if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                    return (
                        <div key={newKey} className="mb-1">
                            {renderFields(data[key], newKey)}
                        </div>
                    );
                }
                return (
                    <Card.Text key={newKey} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {data[key]}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    const handleAddField = () => {
        // Validate the new field
        if (newField.key.trim() === '' || newField.value.trim() === '') {
            alert('Please enter both key and value for the new field.');
            return;
        }

        // Construct the new attribute
        const attribute = { [newField.key]: newField.value };

        if (newField.addToAll) {
            // Send the new field to the backend to add to all devices
            axios.post(`${config.API_BASE_URL}/device/attributes/add-to-all`, attribute)
                .then(response => {
                    console.log('Field added to all devices:', response.data);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error adding field to all devices:', error);
                });
        } else {
            // Send the updated device to the backend
            axios.put(`${config.API_BASE_URL}/device/${device.id}/attributes`, attribute)
                .then(response => {
                    const updatedDevice = { ...localDevice, ...attribute };
                    setLocalDevice(updatedDevice);
                    initializeVisibleFields(updatedDevice);
                })
                .catch(error => {
                    console.error('Error updating device:', error);
                });
        }
        // Clear the new field form
        setNewField({ key: '', value: '', addToAll: false });
    };

    return (
        <>
            <h1 className="mb-4">
                Device Details
                <Button variant="link" className="float-end" onClick={() => setShowDeviceFieldModal(true)}>Edit Fields</Button>
            </h1>
            {localDevice ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{localDevice.deviceName}</Card.Title>
                        {renderFields(localDevice)}
                        <Button className="me-2" onClick={() => setShowFileUploadModal(true)}>Upload Files</Button>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}
            <Modal show={showDeviceFieldModal} onHide={() => setShowDeviceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {localDevice && getAllKeys(localDevice).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleDeviceFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                        <hr />
                        {showAddFieldForm ? (
                            <>
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
                                <Form.Check
                                    type="checkbox"
                                    label="Add to all devices"
                                    checked={newField.addToAll}
                                    onChange={(e) => setNewField({ ...newField, addToAll: e.target.checked })}
                                />
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
                    <Button variant="secondary" onClick={() => setShowDeviceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeviceDetails;
