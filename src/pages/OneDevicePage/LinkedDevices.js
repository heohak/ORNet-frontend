import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import config from "../../config/config";
import CommentsModal from "../../modals/CommentsModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";

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
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false); // State for comments modal
    const [commentsDeviceId, setCommentsDeviceId] = useState(null); // State for current device ID for comments

    const defaultFields = [
        'name',
        'manufacturer',
        'productCode',
        'serialNumber',
        'comment'
        // Add other fields you want to be visible by default
    ];

    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeVisibleFields(linkedDevices);
        }
    }, [linkedDevices]);

    const initializeVisibleFields = (devices) => {
        const initialVisibleFields = {};
        devices.forEach(device => {
            initialVisibleFields[device.id] = defaultFields.reduce((acc, key) => {
                if (key in device || (device.attributes && key in device.attributes)) {
                    acc[key] = true;
                }
                return acc;
            }, {});
        });

        const storedVisibleFields = localStorage.getItem('linkedDeviceVisibilityState');
        if (storedVisibleFields) {
            const storedFields = JSON.parse(storedVisibleFields);
            setVisibleFields({ ...initialVisibleFields, ...storedFields });
        } else {
            setVisibleFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (deviceId, field) => {
        setVisibleFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [deviceId]: {
                    ...prevVisibleFields[deviceId],
                    [field]: !prevVisibleFields[deviceId][field]
                }
            };
            localStorage.setItem('linkedDeviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (deviceId, data) => {
        return Object.keys(data).map(key => {
            if (visibleFields[deviceId] && visibleFields[deviceId][key] && data[key] !== null) {
                if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                    return (
                        <div key={key} className="mb-2">
                            {renderFields(deviceId, data[key])}
                        </div>
                    );
                }
                return (
                    <div key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: </strong> {data[key]}
                    </div>
                );
            }
            return null;
        });
    };

    const handleAddNewLinkedDevice = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/linked/device/add`, newLinkedDevice);
            setNewLinkedDevice({
                name: '',
                manufacturer: '',
                productCode: '',
                serialNumber: '',
                comment: ''
            });
            const newDeviceId = response.data.token;

            await axios.put(`${config.API_BASE_URL}/linked/device/link/${newDeviceId}/${deviceId}`);
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeVisibleFields(updatedLinkedDevices.data);
            setShowAddNewDeviceForm(false)
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
            await axios.put(`${config.API_BASE_URL}/linked/device/${currentDeviceId}/attributes`, attribute);
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeVisibleFields(updatedLinkedDevices.data);

            // Ensure the new field is visible after adding it
            setVisibleFields(prevVisibleFields => {
                const newVisibleFields = {
                    ...prevVisibleFields,
                    [currentDeviceId]: {
                        ...prevVisibleFields[currentDeviceId],
                        [newField.key]: true
                    }
                };
                localStorage.setItem('linkedDeviceVisibilityState', JSON.stringify(newVisibleFields));
                return newVisibleFields;
            });

        } catch (error) {
            console.error('Error adding new field:', error);
        }

        setNewField({ key: '', value: '' });
        setShowAddFieldForm(false);
        setShowFieldModal(false);
    };

    const openFieldModal = (deviceId) => {
        setCurrentDeviceId(deviceId);
        setShowFieldModal(true);
    };

    const openCommentsModal = (deviceId) => {
        setCommentsDeviceId(deviceId);
        setShowCommentsModal(true);
    };

    return (
        <>
            <Row className="align-items-center justify-content-between">
                <Col>
                    <h2 className="mb-0">Linked Devices</h2>
                </Col>
                <Col className="col-auto">
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Link Device
                    </Button>
                </Col>
            </Row>

            {linkedDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title style={{display: "flex", justifyContent: "space-between"}}>
                                        {linkedDevice.name}
                                        <Button variant="link" onClick={() => openFieldModal(linkedDevice.id)}>
                                            <FontAwesomeIcon icon={faCog} />
                                        </Button>
                                    </Card.Title>
                                    {renderFields(linkedDevice.id, {
                                        ...Object.fromEntries(Object.entries(linkedDevice).filter(([key]) => key !== 'attributes')),
                                        ...linkedDevice.attributes
                                    })}
                                    <Button variant="info" onClick={() => openCommentsModal(linkedDevice.id)}>View Comments</Button>
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
                        {currentDeviceId && Object.keys(visibleFields[currentDeviceId] || {}).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleFields[currentDeviceId][key]}
                                onChange={() => handleFieldToggle(currentDeviceId, key)}
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

            <CommentsModal
                show={showCommentsModal}
                handleClose={() => setShowCommentsModal(false)}
                deviceId={commentsDeviceId}
                isLinkedDevice={true} // Pass flag to indicate it's a linked device
            />
        </>
    );
}

export default LinkedDevices;
