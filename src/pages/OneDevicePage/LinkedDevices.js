// src/pages/OneDevicePage/LinkedDevices.js

import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Alert, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import { FaTrash, FaCog, FaComments, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axiosInstance from "../../config/axiosInstance";
import {DateUtils} from "../../utils/DateUtils";

function LinkedDevices({
                           linkedDevices,
                           availableLinkedDevices,
                           deviceId,
                           setLinkedDevices,
                           showModal,
                           setShowModal,
                           refreshData,
                       }) {
    // State variables
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState('');
    const [showAddNewDeviceForm, setShowAddNewDeviceForm] = useState(false);
    const [newLinkedDevice, setNewLinkedDevice] = useState({
        name: '',
        manufacturer: '',
        productCode: '',
        serialNumber: '',
        comment: '',
    });
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [fieldsConfig, setFieldsConfig] = useState({});
    const [newField, setNewField] = useState({ key: '', value: '' });
    const [fieldError, setFieldError] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [submitIndex, setSubmitIndex] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [showUnlinkConfirmModal, setShowUnlinkConfirmModal] = useState(false);


    // Default fields to display
    const defaultFields = [
        { key: 'name', label: 'Name' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'productCode', label: 'Product Code' },
        { key: 'serialNumber', label: 'Serial Number' },
    ];

    // Initialize fields configuration
    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeFieldsConfig(linkedDevices);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedDevices]);

    const initializeFieldsConfig = (devices) => {
        const initialFieldsConfig = {};
        devices.forEach((device) => {
            const deviceSpecificKey = `linkedDeviceVisibleFields_${device.id}`;
            const storedVisibleFields = localStorage.getItem(deviceSpecificKey);
            let fieldsConfigForDevice = defaultFields.map((field) => ({
                ...field,
                visible: true,
                isAttribute: false,
            }));

            if (storedVisibleFields) {
                try {
                    const parsedVisibleFields = JSON.parse(storedVisibleFields);
                    fieldsConfigForDevice = fieldsConfigForDevice.map((field) => ({
                        ...field,
                        visible: parsedVisibleFields.includes(field.key),
                    }));
                } catch (error) {
                    console.error(`Error parsing visibleFields for device ${device.id}:`, error);
                }
            }

            // Add dynamic fields from attributes
            if (device.attributes) {
                Object.keys(device.attributes).forEach((attrKey) => {
                    if (!fieldsConfigForDevice.some((field) => field.key === attrKey)) {
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

    const formatLabel = (label) => {
        const abbreviations = ['IP', 'API', 'ID'];
        return label
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .split(' ')
            .map((word) => {
                if (abbreviations.includes(word.toUpperCase())) {
                    return word.toUpperCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    // Sorting functionality
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedLinkedDevices = [...linkedDevices].sort((a, b) => {
        const valueA = a[sortConfig.key] || '';
        const valueB = b[sortConfig.key] || '';

        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const renderSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    // Handle clicking on a linked device
    const handleLinkedDeviceClick = (deviceId) => {
        setCurrentDeviceId(deviceId);
        setShowDeviceModal(true);
        setActiveTab('details');
        fetchComments(deviceId); // Fetch comments when opening the modal
    };

    // Function to handle linking a device
    const handleLinkDevice = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!selectedLinkedDeviceId) {
            setFieldError('Please select a device to link.');
            setIsSubmitting(false);
            return;
        }
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`);
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(response.data);
            initializeFieldsConfig(response.data);
            setShowModal(false);
            setSelectedLinkedDeviceId('');
            setFieldError(null);
        } catch (error) {
            console.error('Error linking device:', error);
            setFieldError('Failed to link the device. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle adding a new linked device
    const handleAddNewLinkedDevice = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/linked/device/add`, newLinkedDevice);
            setNewLinkedDevice({
                name: '',
                manufacturer: '',
                productCode: '',
                serialNumber: '',
                comment: '',
            });
            const newDeviceId = response.data.token;

            await axiosInstance.put(`${config.API_BASE_URL}/linked/device/link/${newDeviceId}/${deviceId}`);
            const updatedLinkedDevices = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);
            setShowAddNewDeviceForm(false);
            setShowModal(false);
        } catch (error) {
            console.error('Error adding new linked device:', error);
            setFieldError('Failed to add and link the new device. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to render fields in the device modal
    const renderFieldsForModal = (deviceId) => {
        const deviceFieldsConfig = fieldsConfig[deviceId] || [];
        const device = linkedDevices.find((device) => device.id === deviceId);

        return deviceFieldsConfig.map((field) => {
            const value = field.isAttribute ? device.attributes?.[field.key] : device[field.key];
            if (field.visible && value !== undefined && value !== null) {
                return (
                    <div key={field.key} className="mb-2">
                        <strong>{field.label}:</strong> {value}
                    </div>
                );
            }
            return null;
        });
    };

    // Function to toggle field visibility
    const handleFieldToggle = (deviceId, key) => {
        setFieldsConfig((prevFieldsConfig) => {
            const updatedFieldsConfig = { ...prevFieldsConfig };
            const deviceFields = updatedFieldsConfig[deviceId] || [];

            updatedFieldsConfig[deviceId] = deviceFields.map((field) =>
                field.key === key ? { ...field, visible: !field.visible } : field
            );

            // Persist to localStorage
            const visibleFieldsArray = updatedFieldsConfig[deviceId]
                .filter((field) => field.visible)
                .map((field) => field.key);
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
        if (deviceFields.some((field) => field.key.toLowerCase() === newField.key.toLowerCase())) {
            setFieldError('Field key already exists. Please use a unique key.');
            return;
        }

        const attribute = { [newField.key]: newField.value };

        try {
            // Add the new attribute to the current device
            await axiosInstance.put(`${config.API_BASE_URL}/linked/device/${currentDeviceId}/attributes`, attribute);
            const updatedLinkedDevices = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);

            // Update fieldsConfig with the new field
            setFieldsConfig((prevFieldsConfig) => {
                const updatedFieldsConfig = { ...prevFieldsConfig };
                const deviceFields = updatedFieldsConfig[currentDeviceId] || [];

                updatedFieldsConfig[currentDeviceId] = [
                    ...deviceFields,
                    {
                        key: newField.key,
                        label: formatLabel(newField.key),
                        visible: true,
                        isAttribute: true,
                    },
                ];

                // Persist to localStorage
                const visibleFieldsArray = updatedFieldsConfig[currentDeviceId]
                    .filter((field) => field.visible)
                    .map((field) => field.key);
                const deviceSpecificKey = `linkedDeviceVisibleFields_${currentDeviceId}`;
                localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

                return updatedFieldsConfig;
            });

            setFieldError(null);
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field. Please try again.');
        }

        setNewField({ key: '', value: '' });
    };

    // Function to handle deleting a custom field
    const handleDeleteField = async () => {
        if (!fieldToDelete) return;

        try {
            const encodedAttributeName = encodeURIComponent(fieldToDelete);
            await axiosInstance.delete(`${config.API_BASE_URL}/linked/device/${currentDeviceId}/${encodedAttributeName}`);

            const updatedLinkedDevices = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);

            setFieldsConfig((prevFieldsConfig) => {
                const updatedFieldsConfig = { ...prevFieldsConfig };
                const deviceFields = updatedFieldsConfig[currentDeviceId] || [];

                updatedFieldsConfig[currentDeviceId] = deviceFields.filter((field) => field.key !== fieldToDelete);

                // Persist to localStorage
                const visibleFieldsArray = updatedFieldsConfig[currentDeviceId]
                    .filter((field) => field.visible)
                    .map((field) => field.key);
                const deviceSpecificKey = `linkedDeviceVisibleFields_${currentDeviceId}`;
                localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

                return updatedFieldsConfig;
            });

            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        } catch (error) {
            console.error('Error deleting field:', error);
            setFieldError('Failed to delete field. Please try again.');
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        }
    };

    // Fetch comments for the linked device
    const fetchComments = async (deviceId) => {
        try {
            const url = `${config.API_BASE_URL}/linked/device/comment/${deviceId}`;
            const response = await axiosInstance.get(url);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    // Handle adding a new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (newComment.trim() === '') {
            setIsSubmitting(false);
            return;
        }

        try {
            const url = `${config.API_BASE_URL}/linked/device/comment/${currentDeviceId}`;
            await axiosInstance.put(url,
                newComment,
                {
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    }
                }
            );
            setComments([{ comment: newComment, timestamp: new Date() }, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlinkDevice = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await axiosInstance.put(`${config.API_BASE_URL}/linked/device/remove/${currentDeviceId}`);
            // Re-fetch the linked devices
            const updatedLinkedDevicesResponse = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedLinkedDevicesResponse.data);
            initializeFieldsConfig(updatedLinkedDevicesResponse.data);
            if (refreshData) {
                refreshData();
            }
            setShowUnlinkConfirmModal(false);
            setShowDeviceModal(false);
        } catch (error) {
            console.error('Error unlinking device:', error);
            // Optionally display an error message to the user
            setFieldError('Failed to unlink the device. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitIndex === 0) {
            handleAddNewLinkedDevice(e)
        } else {
            handleLinkDevice(e);
        }
    }

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: '20px' }}>
                        Linked Devices
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Link Device
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row style={{ fontWeight: 'bold' }} className="text-center">
                {defaultFields.map((field) => (
                    <Col
                        key={field.key}
                        md={3}
                        onClick={() => handleSort(field.key)}
                        style={{ cursor: 'pointer' }}
                    >
                        {field.label} {renderSortIcon(field.key)}
                    </Col>
                ))}
            </Row>
            <hr />

            {/* Linked Devices List */}
            {sortedLinkedDevices.length > 0 ? (
                sortedLinkedDevices.map((device, index) => {
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    return (
                        <Row
                            key={device.id}
                            className="align-items-center text-center py-2"
                            style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                            onClick={() => handleLinkedDeviceClick(device.id)}
                        >
                            {defaultFields.map((field) => (
                                <Col key={field.key} md={3}>
                                    {device[field.key]}
                                </Col>
                            ))}
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">
                    No linked devices available.
                </Alert>
            )}

            {/* Link Device Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {fieldError && (
                            <Alert variant="danger" onClose={() => setFieldError(null)} dismissible>
                                {fieldError}
                            </Alert>
                        )}
                        {!showAddNewDeviceForm && (
                            <>
                                <Form.Group controlId="selectDevice">
                                    <Form.Label>Select Device to Link</Form.Label>
                                    <Button variant="link" onClick={() => setShowAddNewDeviceForm(true)}>
                                        Add new linked device
                                    </Button>
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
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="newDeviceManufacturer">
                                    <Form.Label>Manufacturer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newLinkedDevice.manufacturer}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, manufacturer: e.target.value })
                                        }
                                        placeholder="Enter manufacturer"
                                    />
                                </Form.Group>
                                <Form.Group controlId="newDeviceProductCode">
                                    <Form.Label>Product Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newLinkedDevice.productCode}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, productCode: e.target.value })
                                        }
                                        placeholder="Enter product code"
                                    />
                                </Form.Group>
                                <Form.Group controlId="newDeviceSerialNumber">
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newLinkedDevice.serialNumber}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, serialNumber: e.target.value })
                                        }
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
                        <Button variant="outline-info" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        {showAddNewDeviceForm ? (
                            <Button variant="primary" type="submit" disabled={isSubmitting} onMouseDown={() => setSubmitIndex(0)}>
                                {isSubmitting ? 'Adding...' : 'Add and Link Device'}
                            </Button>
                        ) : (
                            <Button variant="primary" type="submit" disabled={isSubmitting} onMouseDown={() => setSubmitIndex(1)}>
                                {isSubmitting ? 'Adding...' : 'Link Device'}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Device Details Modal */}
            <Modal show={showDeviceModal} onHide={() => setShowDeviceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Linked Device Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                        <Tab eventKey="details" title="Details">
                            {currentDeviceId && renderFieldsForModal(currentDeviceId)}
                        </Tab>

                        <Tab eventKey="manageFields" title="Manage Fields">
                            <Form className="mt-3">
                                {currentDeviceId &&
                                    fieldsConfig[currentDeviceId] &&
                                    fieldsConfig[currentDeviceId].map((field) => (
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
                                        placeholder="Enter unique field key"
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

                        <Tab eventKey="customAttributes" title="Delete Fields">
                            <Form className="mt-3">
                                {currentDeviceId &&
                                    fieldsConfig[currentDeviceId] &&
                                    fieldsConfig[currentDeviceId]
                                        .filter((field) => field.isAttribute)
                                        .map((field) => (
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

                        {/* Comments Tab */}
                        <Tab eventKey="comments" title="Comments">
                            <Form onSubmit={handleAddComment}>
                                <Form.Group controlId="newComment">
                                    <Form.Label>New Comment</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Enter your comment"
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" disabled={isSubmitting} type="submit" className="mt-3">
                                    {isSubmitting ? 'Adding..' : 'Add Comment'}
                                </Button>
                            </Form>
                            <hr />
                            <h5>Existing Comments</h5>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <div key={index} className="mb-2">
                                        <strong>{DateUtils.formatDate(comment.timestamp)}</strong>: {comment.comment}
                                    </div>
                                ))
                            ) : (
                                <p>No comments available.</p>
                            )}
                        </Tab>
                        <Tab eventKey="unlink" title="Unlink Device">
                            <Button variant="danger" onClick={() => setShowUnlinkConfirmModal(true)}>
                                Unlink Device
                            </Button>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowDeviceModal(false)}>
                        Close
                    </Button>
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
                    Are you sure you want to delete the attribute "<strong>{fieldToDelete}</strong>"?
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

            {/* Unlink Confirmation Modal */}
            <Modal show={showUnlinkConfirmModal} onHide={() => setShowUnlinkConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Unlink</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to unlink this device?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowUnlinkConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleUnlinkDevice}>
                        Unlink
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}

export default LinkedDevices;
