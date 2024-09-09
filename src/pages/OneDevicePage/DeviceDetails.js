import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import config from "../../config/config";
import DeviceFileList from "./DeviceFileList";

function DeviceDetails({ device, navigate, setShowFileUploadModal, setShowCommentsModal, setRefresh }) {
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [visibleFields, setVisibleFields] = useState({});
    const [newField, setNewField] = useState({ key: '', value: '', addToAll: false });
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);
    const [localDevice, setLocalDevice] = useState(device);
    const [showWrittenOffModal, setShowWrittenOffModal] = useState(false);
    const [writtenOffDate, setWrittenOffDate] = useState(device?.writtenOffDate || "");

    const defaultFields = [
        'deviceName',
        'clientName',
        'locationName',
        'classificatorName',
        'introducedDate',
        'version',
        'versionUpdateDate',
        'firstIPAddress',
        'secondIPAddress',
        'subnetMask',
        'softwareKey',
        'writtenOffDate',
        'department',
        'room',
        'serialNumber',
        'licenseNumber'
    ];

    useEffect(() => {
        if (localDevice) {
            const storedVisibleFields = localStorage.getItem(`deviceVisibleFields_${localDevice.id}`);
            if (storedVisibleFields) {
                setVisibleFields(JSON.parse(storedVisibleFields));
            } else {
                initializeVisibleFields(localDevice);
            }
        }
    }, [localDevice]);

    useEffect(() => {
        if (device) {
            setLocalDevice(device);
            const storedVisibleFields = localStorage.getItem(`deviceVisibleFields_${device.id}`);
            if (storedVisibleFields) {
                setVisibleFields(JSON.parse(storedVisibleFields));
            } else {
                initializeVisibleFields(device);
            }
        }
    }, [device]);

    const initializeVisibleFields = (data) => {
        const deviceSpecificKey = `deviceVisibleFields_${data.id}`;
        const storedVisibleFields = localStorage.getItem(deviceSpecificKey);
        const initialVisibleFields = defaultFields.reduce((acc, key) => {
            if (key in data) {
                acc[key] = true;
            }
            return acc;
        }, {});

        if (storedVisibleFields) {
            const storedFields = JSON.parse(storedVisibleFields);
            Object.keys(storedFields).forEach(key => {
                if (storedFields[key]) {
                    initialVisibleFields[key] = true;
                }
            });
        }

        const globalFields = JSON.parse(localStorage.getItem('globalVisibleFields') || '{}');
        const updatedVisibleFields = { ...initialVisibleFields, ...globalFields };

        setVisibleFields(updatedVisibleFields);
        localStorage.setItem(deviceSpecificKey, JSON.stringify(updatedVisibleFields));
    };

    const handleFieldToggle = (field) => {
        setVisibleFields(prevVisibleFields => {
            const newVisibleFields = { ...prevVisibleFields, [field]: !prevVisibleFields[field] };
            const deviceSpecificKey = `deviceVisibleFields_${localDevice.id}`;
            localStorage.setItem(deviceSpecificKey, JSON.stringify(newVisibleFields));
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

    const handleAddField = async () => {
        if (newField.key.trim() === '' || newField.value.trim() === '') {
            alert('Please enter both key and value for the new field.');
            return;
        }

        const attribute = { [newField.key]: newField.value };

        try {
            if (newField.addToAll) {
                await axios.post(`${config.API_BASE_URL}/device/attributes/add-to-all`, attribute);
                console.log('Field added to all devices');

                // Update visibility for all devices
                const globalVisibleFields = JSON.parse(localStorage.getItem('globalVisibleFields') || '{}');
                globalVisibleFields[newField.key] = true;
                localStorage.setItem('globalVisibleFields', JSON.stringify(globalVisibleFields));

                // Update all stored devices visibility fields
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('deviceVisibleFields_')) {
                        const deviceFields = JSON.parse(localStorage.getItem(key));
                        deviceFields[newField.key] = true;
                        localStorage.setItem(key, JSON.stringify(deviceFields));
                    }
                }
                window.location.reload();
            } else {
                await axios.put(`${config.API_BASE_URL}/device/${device.id}/attributes`, attribute);
                const updatedDevice = { ...localDevice, attributes: { ...localDevice.attributes, ...attribute } };
                setLocalDevice(updatedDevice);

                const deviceSpecificKey = `deviceVisibleFields_${localDevice.id}`;
                setVisibleFields(prevFields => {
                    const newFields = { ...prevFields, [newField.key]: true };
                    localStorage.setItem(deviceSpecificKey, JSON.stringify(newFields));
                    return newFields;
                });
            }
        } catch (error) {
            console.error('Error updating device:', error);
        }

        setNewField({ key: '', value: '', addToAll: false });
        setShowAddFieldForm(false);
    };

    const handleAddWrittenOffDate = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/device/written-off/${device.id}`, { writtenOffDate });
            setRefresh(prev => !prev); // Refresh data
            setShowWrittenOffModal(false); // Close modal
        } catch (error) {
            console.error('Error updating written off date:', error);
        }
    };
    const handleNavigate = () => {
        if (device && device.id) {
            navigate('/history', { state: { endpoint: `device/history/${device.id}` } })
        } else {
            console.error("Device or device id is undefined")
        }
    }

    return (
        <>
            <Button onClick={() => navigate(`/client/${device.clientId}`)}>Back</Button>
            <Button onClick={handleNavigate} variant='secondary'>
                See device history
            </Button>
            <h1 className="mb-4 mt-4">
                {device ? `${device.deviceName} Details` : 'Device Details'}
                <Button variant="link" className="float-end" onClick={() => setShowDeviceFieldModal(true)}>Edit Fields</Button>
            </h1>
            {device && device.introducedDate && writtenOffDate && (
                <div className="mt-3">
                    <strong>Service Duration: </strong>
                    {Math.floor((new Date(writtenOffDate) - new Date(device.introducedDate)) / (1000 * 60 * 60 * 24))} days
                </div>
            )}
            {localDevice ? (
                <Card className="mb-4">
                    <Card.Body>
                        <div style={{justifyContent: "space-between", display: "flex"}}>
                            <Card.Title>{localDevice.deviceName}</Card.Title>
                            <Button variant="primary" onClick={() => navigate(`/device/edit/${localDevice.id}`)}>
                                Edit Device
                            </Button>
                        </div>
                        {renderFields({
                            ...Object.fromEntries(Object.entries(localDevice).filter(([key]) => key !== 'attributes')),
                            ...localDevice.attributes
                        })}
                        <DeviceFileList deviceId={localDevice.id}/>  {/* Calls the FileList class */}
                        <Button variant="warning me-2" onClick={() => setShowWrittenOffModal(true)}>Write Off</Button>
                        <Button variant="info" onClick={() => setShowCommentsModal(true)}>View Comments</Button>
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

            <Modal show={showWrittenOffModal} onHide={() => setShowWrittenOffModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Written Off Date</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="writtenOffDate">
                            <Form.Label>Written Off Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={writtenOffDate}
                                onChange={(e) => setWrittenOffDate(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWrittenOffModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddWrittenOffDate}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeviceDetails;
