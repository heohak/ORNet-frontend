// src/pages/OneDevicePage/LinkedDevices.js

import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import config from "../../config/config";
import CommentsModal from "../../modals/CommentsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

function LinkedDevices({
                           linkedDevices,
                           showModal,
                           setShowModal,
                           availableLinkedDevices,
                           deviceId,
                           setLinkedDevices
                       }) {
    // State for selected device to link
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState("");

    // State for field configurations per device
    const [fieldsConfig, setFieldsConfig] = useState({});

    // State to control the visibility of the Manage Fields modal
    const [showFieldModal, setShowFieldModal] = useState(false);

    // State to control whether to show the add new device form
    const [showAddNewDeviceForm, setShowAddNewDeviceForm] = useState(false);

    // State for new linked device details
    const [newLinkedDevice, setNewLinkedDevice] = useState({
        name: '',
        manufacturer: '',
        productCode: '',
        serialNumber: '',
        comment: ''
    });

    // State for adding a new field
    const [newField, setNewField] = useState({ key: '', value: '' });

    // State to control the visibility of the Add Field form within the modal
    const [showAddFieldForm, setShowAddFieldForm] = useState(false);

    // Current device ID for which fields are being managed
    const [currentDeviceId, setCurrentDeviceId] = useState(null);

    // State for managing comments modal
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [commentsDeviceId, setCommentsDeviceId] = useState(null);

    // State for handling errors
    const [fieldError, setFieldError] = useState(null);

    // State for managing field deletion
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // Define default fields configuration
    const defaultFieldsConfig = [
        {
            key: 'name',
            label: 'Name',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'manufacturer',
            label: 'Manufacturer',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'productCode',
            label: 'Product Code',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'serialNumber',
            label: 'Serial Number',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'comment',
            label: 'Comment',
            visible: true,
            isAttribute: false,
        },
        // Add more default fields as needed
    ];

    // Function to format field labels for better readability
    const formatLabel = (label) => {
        const abbreviations = ['IP', 'API', 'ID']; // Add more as needed
        return label
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .split(' ')
            .map(word => {
                if (abbreviations.includes(word.toUpperCase())) {
                    return word.toUpperCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    // Initialize fields configuration on component mount or when linkedDevices change
    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeFieldsConfig(linkedDevices);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedDevices]);

    // Function to initialize fields configuration
    const initializeFieldsConfig = (devices) => {
        const initialFieldsConfig = {};
        devices.forEach(device => {
            const deviceSpecificKey = `linkedDeviceVisibleFields_${device.id}`;
            const storedVisibleFields = localStorage.getItem(deviceSpecificKey);
            let fieldsConfigForDevice = [...defaultFieldsConfig];

            if (storedVisibleFields) {
                try {
                    const parsedVisibleFields = JSON.parse(storedVisibleFields);
                    fieldsConfigForDevice = fieldsConfigForDevice.map(field => ({
                        ...field,
                        visible: parsedVisibleFields.includes(field.key),
                    }));
                } catch (error) {
                    console.error(`Error parsing visibleFields for device ${device.id}:`, error);
                    // If parsing fails, default to all fields visible
                    fieldsConfigForDevice = fieldsConfigForDevice.map(field => ({
                        ...field,
                        visible: true,
                    }));
                }
            }

            // Add dynamic fields from attributes
            if (device.attributes) {
                Object.keys(device.attributes).forEach(attrKey => {
                    if (!fieldsConfigForDevice.some(field => field.key === attrKey)) {
                        fieldsConfigForDevice.push({
                            key: attrKey,
                            label: formatLabel(attrKey),
                            visible: true,
                            isAttribute: true,
                        });
                    }
                });
            }

            initialFieldsConfig[device.id] = fieldsConfigForDevice;
        });

        setFieldsConfig(initialFieldsConfig);
    };

    // Function to toggle field visibility
    const handleFieldToggle = (deviceId, key) => {
        setFieldsConfig(prevFieldsConfig => {
            const updatedFieldsConfig = { ...prevFieldsConfig };
            const deviceFields = updatedFieldsConfig[deviceId] || [];

            updatedFieldsConfig[deviceId] = deviceFields.map(field =>
                field.key === key ? { ...field, visible: !field.visible } : field
            );

            // Persist to localStorage
            const visibleFieldsArray = updatedFieldsConfig[deviceId]
                .filter(field => field.visible)
                .map(field => field.key);
            const deviceSpecificKey = `linkedDeviceVisibleFields_${deviceId}`;
            localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

            return updatedFieldsConfig;
        });
    };

    // Function to handle adding a new field
    const handleAddField = async () => {
        if (newField.key.trim() === '' || newField.value.trim() === '') {
            setFieldError('Please enter both key and value for the new field.');
            return;
        }

        // Check for duplicate field keys
        const deviceFields = fieldsConfig[currentDeviceId] || [];
        if (deviceFields.some(field => field.key.toLowerCase() === newField.key.toLowerCase())) {
            setFieldError('Field key already exists. Please use a unique key.');
            return;
        }

        const attribute = { [newField.key]: newField.value };

        try {
            // Add the new attribute to the current device
            await axios.put(`${config.API_BASE_URL}/linked/device/${currentDeviceId}/attributes`, attribute);
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);

            // Update fieldsConfig with the new field
            setFieldsConfig(prevFieldsConfig => {
                const updatedFieldsConfig = { ...prevFieldsConfig };
                const deviceFields = updatedFieldsConfig[currentDeviceId] || [];

                updatedFieldsConfig[currentDeviceId] = [
                    ...deviceFields,
                    {
                        key: newField.key,
                        label: formatLabel(newField.key),
                        visible: true,
                        isAttribute: true,
                    }
                ];

                // Persist to localStorage
                const visibleFieldsArray = updatedFieldsConfig[currentDeviceId]
                    .filter(field => field.visible)
                    .map(field => field.key);
                const deviceSpecificKey = `linkedDeviceVisibleFields_${currentDeviceId}`;
                localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

                return updatedFieldsConfig;
            });

            setFieldError(null); // Clear any existing errors
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field. Please try again.');
        }

        setNewField({ key: '', value: '' });
        setShowAddFieldForm(false);
        setShowFieldModal(false);
    };

    // Function to handle deleting a custom field
    const handleDeleteField = async () => {
        if (!fieldToDelete) return;

        try {
            // URL Encode the attribute name to handle special characters
            const encodedAttributeName = encodeURIComponent(fieldToDelete);

            // Delete the attribute from the linked device using currentDeviceId
            await axios.delete(`${config.API_BASE_URL}/linked/device/${currentDeviceId}/${encodedAttributeName}`);

            // Update linkedDevices state
            const updatedLinkedDevices = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);

            // Remove the field from fieldsConfig for the current device
            setFieldsConfig(prevFieldsConfig => {
                const updatedFieldsConfig = { ...prevFieldsConfig };
                const deviceFields = updatedFieldsConfig[currentDeviceId] || [];

                updatedFieldsConfig[currentDeviceId] = deviceFields.filter(field => field.key !== fieldToDelete);

                // Persist to localStorage
                const visibleFieldsArray = updatedFieldsConfig[currentDeviceId]
                    .filter(field => field.visible)
                    .map(field => field.key);
                const deviceSpecificKey = `linkedDeviceVisibleFields_${currentDeviceId}`;
                localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

                return updatedFieldsConfig;
            });

            // Close the confirmation modal and reset deletion state
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        } catch (error) {
            console.error('Error deleting field:', error);
            setFieldError('Failed to delete field. Please try again.');
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        }
    };

    // Function to render device fields based on visibility
    const renderFields = (deviceId) => {
        const deviceFieldsConfig = fieldsConfig[deviceId] || [];

        return deviceFieldsConfig.map(field => {
            const device = linkedDevices.find(device => device.id === deviceId);
            const value = field.isAttribute ? device.attributes?.[field.key] : device[field.key];
            if (field.visible && value !== undefined && value !== null) {
                return (
                    <div key={field.key} className="mb-1">
                        <strong>{field.label}: </strong> {value}
                    </div>
                );
            }
            return null;
        });
    };

    // Function to handle linking a device
    const handleLinkDevice = async () => {
        if (!selectedLinkedDeviceId) {
            setFieldError('Please select a device to link.');
            return;
        }
        try {
            await axios.put(`${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`);
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(response.data);
            initializeFieldsConfig(response.data);
            setShowModal(false);
            setSelectedLinkedDeviceId(""); // Reset selection after linking
            setFieldError(null); // Clear any existing errors
        } catch (error) {
            console.error('Error linking device:', error);
            setFieldError('Failed to link the device. Please try again.');
        }
    };

    // Function to handle adding a new linked device
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
            initializeFieldsConfig(updatedLinkedDevices.data);
            setShowAddNewDeviceForm(false);
            setShowModal(false);
        } catch (error) {
            console.error('Error adding new linked device:', error);
            setFieldError('Failed to add and link the new device. Please try again.');
        }
    };

    // Function to open the field management modal
    const openFieldModal = (deviceId) => {
        setCurrentDeviceId(deviceId);
        setShowFieldModal(true);
    };

    // Function to open the comments modal
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
                                    <Card.Title style={{ display: "flex", justifyContent: "space-between" }}>
                                        {linkedDevice.name}
                                        <Button variant="link" onClick={() => openFieldModal(linkedDevice.id)}>
                                            <FontAwesomeIcon icon={faCog} title="Edit visible fields" />
                                        </Button>
                                    </Card.Title>
                                    {renderFields(linkedDevice.id)}
                                    <Button variant="info" onClick={() => openCommentsModal(linkedDevice.id)}>View Comments</Button>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No linked devices available.</Alert>
            )}

            {/* Link Device Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!showAddNewDeviceForm && (
                        <>
                            <Form.Group controlId="selectDevice">
                                <Form.Label>Select Device to Link</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedLinkedDeviceId}
                                    onChange={(e) => setSelectedLinkedDeviceId(e.target.value)}
                                >
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
                            <Form.Group controlId="newDeviceComment" className="mt-3">
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

            {/* Edit Visible Fields Modal */}
            <Modal show={showFieldModal} onHide={() => setShowFieldModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Linked Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        defaultActiveKey="visibleFields"
                        id="linked-device-fields-tabs"
                        className="mb-3"
                        onSelect={(k) => {
                            if (k !== 'visibleFields') {
                                setShowAddFieldForm(false);
                            }
                        }}
                    >
                        <Tab eventKey="visibleFields" title="Visible Fields">
                            <Form className="mt-3">
                                {currentDeviceId && fieldsConfig[currentDeviceId] && fieldsConfig[currentDeviceId].map(field => (
                                    <Form.Check
                                        key={field.key}
                                        type="checkbox"
                                        label={field.label}
                                        checked={field.visible}
                                        onChange={() => handleFieldToggle(currentDeviceId, field.key)}
                                    />
                                ))}
                            </Form>
                        </Tab>

                        <Tab eventKey="addField" title="Add Field">
                            <Form className="mt-3">
                                {fieldError && (
                                    <Alert variant="danger" onClose={() => setFieldError(null)} dismissible>
                                        {fieldError}
                                    </Alert>
                                )}
                                <Form.Group controlId="newFieldKey" className="mb-3">
                                    <Form.Label>Field Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.key}
                                        onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                                        placeholder="Enter unique field key (e.g., warrantyPeriod)"
                                    />
                                </Form.Group>
                                <Form.Group controlId="newFieldValue" className="mb-3">
                                    <Form.Label>Field Value</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.value}
                                        onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                                        placeholder="Enter field value"
                                    />
                                </Form.Group>
                                <Button variant="success" onClick={handleAddField}>
                                    Add Field
                                </Button>
                            </Form>
                        </Tab>

                        <Tab eventKey="customAttributes" title="Custom Attributes">
                            <h5 className="mt-3">Custom Attributes</h5>
                            <Form className="mt-3">
                                {currentDeviceId && fieldsConfig[currentDeviceId] && fieldsConfig[currentDeviceId]
                                    .filter(field => field.isAttribute)
                                    .map(field => (
                                        <div key={field.key} className="d-flex align-items-center mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                label={field.label}
                                                checked={field.visible}
                                                onChange={() => handleFieldToggle(currentDeviceId, field.key)}
                                                className="flex-grow-1"
                                            />
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 text-danger ms-2"
                                                onClick={() => {
                                                    setFieldToDelete(field.key);
                                                    setShowDeleteConfirmModal(true);
                                                }}
                                                title="Delete Attribute"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    ))}
                            </Form>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirmModal}
                onHide={() => setShowDeleteConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the attribute "
                    <strong>{fieldToDelete}</strong>"?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowDeleteConfirmModal(false);
                            setFieldToDelete(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteField}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Comments Modal */}
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
