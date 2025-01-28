// src/pages/OneDevicePage/DeviceDetails.js

import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Modal,
    Row,
    Tab,
    Tabs,
} from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,
    faEdit,
    faHistory,
    faComments,
} from '@fortawesome/free-solid-svg-icons';
import '../../css/AllDevicesPage/Devices.css';
import DeviceStatusManager from './DeviceStatusManager';
import EditDevice from "./EditDevice";
import {format} from "date-fns";
import axiosInstance from "../../config/axiosInstance";

function DeviceDetails({
                           device,
                           navigate,
                           setShowCommentsModal,
                           setRefresh,
                       }) {
    // State variables
    const [fieldsConfig, setFieldsConfig] = useState([]);
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [activeTab, setActiveTab] = useState('addField');
    const [newField, setNewField] = useState({
        key: '',
        value: '',
        addToAll: false,
    });
    const [localDevice, setLocalDevice] = useState(device);
    const locationHook = useLocation();
    const [fieldError, setFieldError] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigateHook = useNavigate(); // Use navigate from react-router-dom



    // Define default fields configuration
    const defaultFieldsConfig = [
        { key: 'deviceName', label: 'Device Name', isAttribute: false },
        { key: 'clientName', label: 'Customer Name', isAttribute: false },
        { key: 'locationName', label: 'Location Name', isAttribute: false },
        { key: 'department', label: 'Department', isAttribute: false },
        { key: 'room', label: 'Room', isAttribute: false },
        { key: 'version', label: 'Version', isAttribute: false },
        { key: 'versionUpdateDate', label: 'Version Update Date', isAttribute: false },
        { key: 'softwareKey', label: 'Software Key', isAttribute: false },
        { key: 'introducedDate', label: 'Introduced Date', isAttribute: false },
        { key: 'firstIPAddress', label: 'First IP Address', isAttribute: false },
        { key: 'secondIPAddress', label: 'Second IP Address', isAttribute: false },
        { key: 'subnetMask', label: 'Subnet Mask', isAttribute: false },
        // Add more default fields as needed
        { key: 'workstationNo', label: 'Workstation No', isAttribute: false },
        { key: 'cameraNo', label: 'Camera No', isAttribute: false },
        { key: 'otherNo', label: 'Other No', isAttribute: false },
    ];

    // Initialize fields configuration
    useEffect(() => {
        if (device) {
            setLocalDevice(device);
            initializeFieldsConfig(device);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device]);

    const initializeFieldsConfig = (data) => {
        let initialFieldsConfig = [...defaultFieldsConfig];

        // Add dynamic fields from attributes
        if (data.attributes) {
            Object.keys(data.attributes).forEach((attrKey) => {
                if (!initialFieldsConfig.some((field) => field.key === attrKey)) {
                    initialFieldsConfig.push({
                        key: attrKey,
                        label: formatLabel(attrKey),
                        isAttribute: true,
                    });
                }
            });
        }

        setFieldsConfig(initialFieldsConfig);
    };

    const formatLabel = (label) => {
        const abbreviations = ['IP', 'API', 'ID'];
        return label
            .replace(/clientName/, 'Customer Name')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .split(' ')
            .map((word) => {
                if (abbreviations.includes(word.toUpperCase())) {
                    return word.toUpperCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const handleAddField = async () => {
        if (newField.key.trim() === '') {
            setFieldError('Please enter key for the new field.');
            return;
        }

        // Check for duplicate field keys
        if (
            fieldsConfig.some(
                (field) => field.key.toLowerCase() === newField.key.toLowerCase()
            )
        ) {
            setFieldError('Field key already exists. Please use a unique key.');
            return;
        }

        const attribute = { [newField.key]: newField.value };

        try {
            if (newField.addToAll) {
                // Add the new attribute to all devices
                await axiosInstance.post(
                    `${config.API_BASE_URL}/device/attributes/add-to-all`,
                    attribute
                );
                console.log('Field added to all devices');
                window.location.reload();
            } else {
                // Add the new attribute to the current device
                await axiosInstance.put(
                    `${config.API_BASE_URL}/device/${device.id}/attributes`,
                    attribute
                );
                const updatedDevice = {
                    ...localDevice,
                    attributes: {
                        ...localDevice.attributes,
                        ...attribute,
                    },
                };
                setLocalDevice(updatedDevice);

                // Update fieldsConfig with the new field
                setFieldsConfig((prevConfig) => [
                    ...prevConfig,
                    {
                        key: newField.key,
                        label: formatLabel(newField.key),
                        isAttribute: true,
                    },
                ]);
            }
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field.');
        }

        // Reset newField state and close the add field form
        setNewField({ key: '', value: '', addToAll: false });
        setFieldError(null);
    };

    const handleDeleteField = async () => {
        if (!fieldToDelete) return;

        try {
            // Delete the attribute from the device
            await axiosInstance.delete(
                `${config.API_BASE_URL}/device/${device.id}/${fieldToDelete}`
            );

            // Update localDevice state
            const updatedAttributes = { ...localDevice.attributes };
            delete updatedAttributes[fieldToDelete];
            setLocalDevice((prevDevice) => ({
                ...prevDevice,
                attributes: updatedAttributes,
            }));

            // Remove the field from fieldsConfig
            setFieldsConfig((prevConfig) =>
                prevConfig.filter((field) => field.key !== fieldToDelete)
            );

            // Close the confirmation modal
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        } catch (error) {
            console.error('Error deleting field:', error);
            setFieldError('Failed to delete field.');
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        }
    };

    // Function to render device fields with enhanced layout
    const renderFields = () => {
        if (!fieldsConfig || fieldsConfig.length === 0) return null;

        // Organize fields into sections
        const topSectionFields = fieldsConfig.filter((field) =>
            ['deviceName', 'clientName', 'locationName', 'department', 'room'].includes(
                field.key
            )
        );

        const leftColumnFields = fieldsConfig.filter((field) =>
            ['version', 'versionUpdateDate', 'softwareKey','workstationNo', 'introducedDate'].includes(
                field.key
            )
        );

        const rightColumnFields = fieldsConfig.filter((field) =>
            ['firstIPAddress', 'secondIPAddress', 'subnetMask', 'cameraNo', 'otherNo'].includes(field.key)
        );

        // Custom attributes (new fields)
        const customAttributeFields = fieldsConfig.filter(
            (field) => field.isAttribute
        );

        return (
            <>
                {/* Header Section */}
                <Row className="mb-3 align-items-center">
                    <Col>
                        <h4>
                            <strong>{localDevice.deviceName}</strong> -{' '}
                            {localDevice.clientName || 'N/A'} / {localDevice.locationName || 'N/A'} /{' '}
                            {localDevice.department || 'N/A'} / {localDevice.room || 'N/A'}
                        </h4>
                    </Col>
                    {/* Action Buttons at Top Right Corner */}
                    <Col className="col-md-auto">
                        <div className="d-flex">
                            <Button
                                variant="link"
                                className="text-primary me-2"
                                onClick={() => setShowDeviceFieldModal(true)}
                                title="Add/Delete Fields"
                            >
                                <FontAwesomeIcon icon={faCog} />
                            </Button>
                            <Button
                                variant="link"
                                className="text-primary me-2"
                                onClick={handleEditDevice} // Open the edit modal
                                title="Edit Device"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                                variant="link"
                                className="text-primary me-2"
                                onClick={handleNavigate}
                                title="View History"
                            >
                                <FontAwesomeIcon icon={faHistory} />
                            </Button>
                            <Button
                                variant="link"
                                className="text-primary"
                                onClick={() => setShowCommentsModal(true)}
                                title="View Comments"
                            >
                                <FontAwesomeIcon icon={faComments} />
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Fields Section */}
                <Row className="mb-3">
                    {/* Left Column */}
                    <Col md={6}>
                        {leftColumnFields.map((field) => {
                            let value =
                                localDevice[field.key] || localDevice.attributes?.[field.key];
                            if (value !== undefined && value !== null) {
                                // Format dates in Estonian format
                                if (
                                    field.key === 'versionUpdateDate' ||
                                    field.key === 'introducedDate'
                                ) {
                                    value = format(new Date(value), 'dd.MM.yyyy', )
                                }
                                return (
                                    <div key={field.key} className="mb-1">
                                        <strong>{field.label}: </strong> {value}
                                    </div>
                                );
                            }
                            return null;
                        })}

                    </Col>
                    {/* Right Column */}
                    <Col md={6}>
                        {rightColumnFields.map((field) => {
                            const value =
                                localDevice[field.key] || localDevice.attributes?.[field.key];
                            if (value !== undefined && value !== null) {
                                return (
                                    <div key={field.key} className="mb-1">
                                        <strong>{field.label}: </strong> {value}
                                    </div>
                                );
                            }
                            return null;
                        })}
                        {/* Custom Attributes Under Right Column */}
                        {customAttributeFields.length > 0 && (
                            <>
                                <hr />
                                <Row>
                                    {customAttributeFields.map((field) => {
                                        const value = localDevice.attributes?.[field.key];
                                        if (value !== undefined && value !== null) {
                                            return (
                                                <Col md={6} key={field.key}>
                                                    <div className="mb-1">
                                                        <strong>{field.label}: </strong> {value}
                                                    </div>
                                                </Col>
                                            );
                                        }
                                        return null;
                                    })}
                                </Row>
                            </>
                        )}
                    </Col>
                </Row>
            </>
        );
    };

    const handleNavigate = () => {
        if (device && device.id) {
            navigate('/history', {
                state: { endpoint: `device/history/${device.id}` },
            });
        } else {
            console.error('Device or device id is undefined');
        }
    };

    const handleEditDevice = () => {
        setShowEditModal(true);
    };


    return (
        <>
            {localDevice ? (
                <Card className="mb-4">
                    <Card.Body>
                        {renderFields()}

                        <DeviceStatusManager
                            deviceId={localDevice.id}
                            introducedDate={localDevice.introducedDate}
                            writtenOffDate={localDevice.writtenOffDate}
                            setRefresh={setRefresh}
                        />
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}

            {/* Add/Delete Fields Modal */}
            <Modal
                backdrop="static"
                show={showDeviceFieldModal}
                onHide={() => setShowDeviceFieldModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add/Delete Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="addField" title="Add Field">
                            <Form className="mt-3">
                                {fieldError && <Alert variant="danger">{fieldError}</Alert>}
                                <Form.Group controlId="newFieldKey" className="mb-3">
                                    <Form.Label>Field Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.key}
                                        onChange={(e) =>
                                            setNewField({ ...newField, key: e.target.value })
                                        }
                                        placeholder="Enter unique field key (e.g., warrantyPeriod)"
                                    />
                                </Form.Group>
                                <Form.Group controlId="newFieldValue" className="mb-3">
                                    <Form.Label>Field Value</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.value}
                                        onChange={(e) =>
                                            setNewField({ ...newField, value: e.target.value })
                                        }
                                        placeholder="Enter field value"
                                    />
                                </Form.Group>
                                <Form.Check
                                    type="checkbox"
                                    label="Add to all devices"
                                    checked={newField.addToAll}
                                    onChange={(e) =>
                                        setNewField({ ...newField, addToAll: e.target.checked })
                                    }
                                    className="mb-3"
                                />
                                <Button variant="primary" onClick={handleAddField}>
                                    Add Field
                                </Button>
                            </Form>
                        </Tab>

                        <Tab eventKey="customAttributes" title="Delete Field">
                            <Form className="mt-3">
                                {fieldsConfig
                                    .filter((field) => field.isAttribute)
                                    .map((field) => (
                                        <div
                                            key={field.key}
                                            className="d-flex align-items-center mb-2"
                                        >
                                            <div className="flex-grow-1">
                                                <strong>{field.label}</strong>
                                            </div>
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
                    <Button
                        variant="outline-info"
                        onClick={() => setShowDeviceFieldModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {showEditModal && (
                <EditDevice
                    deviceId={localDevice.id}
                    onClose={() => {
                        setShowEditModal(false);
                        setRefresh((prev) => !prev); // Refresh device details after editing
                    }}
                    setRefresh={setRefresh}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                backdrop="static"
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
        </>
    );
}

export default DeviceDetails;
