import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,
    faHistory,
    faComments,
} from '@fortawesome/free-solid-svg-icons';
import '../../css/AllDevicesPage/Devices.css';
import EditDevice from './EditDevice';
import { format } from 'date-fns';
import axiosInstance from '../../config/axiosInstance';
import ReactDatePicker from 'react-datepicker';
import {faEdit} from "@fortawesome/free-solid-svg-icons/faEdit";

function DeviceDetails({ device, navigate, setRefresh }) {
    // Basic state variables
    const [fieldsConfig, setFieldsConfig] = useState([]);
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [activeTab, setActiveTab] = useState('addField');
    const [newField, setNewField] = useState({ key: '', value: '', addToAll: false });
    const [localDevice, setLocalDevice] = useState(device);
    const [fieldError, setFieldError] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fast edit for entire left column
    const [leftColumnEditMode, setLeftColumnEditMode] = useState(false);
    const [leftColumnValues, setLeftColumnValues] = useState({});

    // Default fields configuration
    const defaultFieldsConfig = [
        { key: 'deviceName', label: 'Device Name', isAttribute: false },
        { key: 'clientName', label: 'Customer Name', isAttribute: false },
        { key: 'locationName', label: 'Location Name', isAttribute: false },
        { key: 'department', label: 'Department', isAttribute: false },
        { key: 'room', label: 'Room', isAttribute: false },
        { key: 'version', label: 'Version', isAttribute: false },
        { key: 'versionUpdateDate', label: 'Version Update Date', isAttribute: false },
        { key: 'softwareKey', label: 'Software Key', isAttribute: false },
        { key: 'licenseNumber', label: 'License Number', isAttribute: false },
        { key: 'firstIPAddress', label: 'First IP Address', isAttribute: false },
        { key: 'secondIPAddress', label: 'Second IP Address', isAttribute: false },
        { key: 'subnetMask', label: 'Subnet Mask', isAttribute: false },
        { key: 'workstationNo', label: 'Workstation No', isAttribute: false },
        { key: 'cameraNo', label: 'Camera No', isAttribute: false },
        { key: 'otherNo', label: 'Other No', isAttribute: false },
        { key: 'introducedDate', label: 'Introduced Date', isAttribute: false },
    ];

    // When device changes, initialize fields config and left column values.
    useEffect(() => {
        if (device) {
            setLocalDevice(device);
            initializeFieldsConfig(device);
        }
    }, [device]);

    const initializeFieldsConfig = (data) => {
        let initialFieldsConfig = [...defaultFieldsConfig];
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

        // Initialize left column fast-edit values for specific keys.
        const leftKeys = [
            'version',
            'versionUpdateDate',
            'softwareKey',
            'licenseNumber',
            'firstIPAddress',
            'secondIPAddress',
            'subnetMask',
        ];
        const initialLeftValues = {};
        leftKeys.forEach((key) => {
            initialLeftValues[key] =
                data[key] !== undefined
                    ? data[key]
                    : data.attributes && data.attributes[key]
                        ? data.attributes[key]
                        : '';
        });
        setLeftColumnValues(initialLeftValues);
    };

    const formatLabel = (label) => {
        const abbreviations = ['IP', 'API', 'ID'];
        return label
            .replace(/clientName/, 'Customer Name')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .split(' ')
            .map((word) => {
                if (abbreviations.includes(word.toUpperCase())) return word.toUpperCase();
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const handleAddField = async () => {
        if (newField.key.trim() === '') {
            setFieldError('Please enter key for the new field.');
            return;
        }
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
                await axiosInstance.post(
                    `${config.API_BASE_URL}/device/attributes/add-to-all`,
                    attribute
                );
                window.location.reload();
            } else {
                await axiosInstance.put(
                    `${config.API_BASE_URL}/device/${device.id}/attributes`,
                    attribute
                );
                const updatedDevice = {
                    ...localDevice,
                    attributes: { ...localDevice.attributes, ...attribute },
                };
                setLocalDevice(updatedDevice);
                setFieldsConfig((prevConfig) => [
                    ...prevConfig,
                    { key: newField.key, label: formatLabel(newField.key), isAttribute: true },
                ]);
            }
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field.');
        }
        setNewField({ key: '', value: '', addToAll: false });
        setFieldError(null);
    };

    const handleDeleteField = async () => {
        if (!fieldToDelete) return;
        try {
            await axiosInstance.delete(
                `${config.API_BASE_URL}/device/${device.id}/${fieldToDelete}`
            );
            const updatedAttributes = { ...localDevice.attributes };
            delete updatedAttributes[fieldToDelete];
            setLocalDevice((prev) => ({ ...prev, attributes: updatedAttributes }));
            setFieldsConfig((prev) => prev.filter((field) => field.key !== fieldToDelete));
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        } catch (error) {
            console.error('Error deleting field:', error);
            setFieldError('Failed to delete field.');
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        }
    };

    // When the left column edit icon is clicked:
    // If in edit mode, save automatically; otherwise, enable edit mode.
    const handleLeftColumnToggle = () => {
        if (leftColumnEditMode) {
            handleLeftColumnSave();
        } else {
            setLeftColumnEditMode(true);
        }
    };

    // Handler for saving updates for the entire left column.
    const handleLeftColumnSave = async () => {
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/device/update/${device.id}`,
                leftColumnValues
            );
            setLocalDevice((prev) => ({ ...prev, ...leftColumnValues }));
            setLeftColumnEditMode(false);
            if (setRefresh) setRefresh((prev) => !prev);
        } catch (error) {
            console.error('Error updating left column fields', error);
        }
    };

    // Render fields grouped into header, left column, and right column.
    const renderFields = () => {
        if (!fieldsConfig || fieldsConfig.length === 0) return null;

        const headerFields = fieldsConfig.filter((field) =>
            ['deviceName', 'clientName', 'locationName', 'department', 'room'].includes(field.key)
        );
        const leftColumnFields = fieldsConfig.filter((field) =>
            ['version', 'versionUpdateDate', 'softwareKey', 'licenseNumber', 'firstIPAddress', 'secondIPAddress', 'subnetMask'].includes(field.key)
        );
        const rightColumnFields = fieldsConfig.filter((field) =>
            ['cameraNo', 'otherNo', 'workstationNo', 'introducedDate'].includes(field.key)
        );
        const customAttributeFields = fieldsConfig.filter((field) => field.isAttribute);

        return (
            <>
                {/* Header Section */}
                <Row className="mb-3 align-items-center">
                    <Col>
                        <h4>
                            {[
                                localDevice.clientName,
                                localDevice.locationName,
                                localDevice.department,
                                localDevice.room,
                            ]
                                .filter(Boolean)
                                .join(' / ')}
                        </h4>
                    </Col>
                    <Col className="col-md-auto" style={{ alignSelf: "flex-start" }}>
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
                                onClick={handleEditDevice}
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
                        </div>
                    </Col>
                </Row>

                {/* Fields Section */}
                <Row className="mb-3">
                    {/* Left Column with Fast Edit */}
                    <Col
                        md={6}
                        style={
                            leftColumnEditMode
                                ? {
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #ddd',
                                    padding: '10px',
                                    borderRadius: '4px',
                                }
                                : {}
                        }
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5>Technical Info</h5>
                            <Button
                                variant="link"
                                onClick={handleLeftColumnToggle}
                                title={leftColumnEditMode ? 'Save' : 'Edit'}
                            >
                                {leftColumnEditMode ? (
                                    <FaSave style={{ fontSize: '1.2rem' }} />
                                ) : (
                                    <FaEdit style={{ fontSize: '1.2rem' }} />
                                )}
                            </Button>
                        </div>
                        {leftColumnEditMode ? (
                            <>
                                {leftColumnFields.map((field) => {
                                    const key = field.key;
                                    const label = field.label;
                                    const value = leftColumnValues[key] || '';
                                    return (
                                        // Render inline: label and input side by side.
                                        <div key={key} className="d-flex align-items-center mb-2">
                      <span style={{ minWidth: '140px', fontWeight: 'bold' }}>
                        {label}:
                      </span>
                                            {key === 'versionUpdateDate' ? (
                                                <ReactDatePicker
                                                    selected={value ? new Date(value) : null}
                                                    onChange={(date) =>
                                                        setLeftColumnValues((prev) => ({ ...prev, [key]: date }))
                                                    }
                                                    dateFormat="dd.MM.yyyy"
                                                    className="form-control inline-edit"
                                                    placeholderText="Select date"
                                                    isClearable
                                                />
                                            ) : (
                                                <Form.Control
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) =>
                                                        setLeftColumnValues((prev) => ({ ...prev, [key]: e.target.value }))
                                                    }
                                                    className="form-control inline-edit"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            leftColumnFields.map((field) => {
                                let value = localDevice[field.key] || localDevice.attributes?.[field.key];
                                if (value !== undefined && value !== null) {
                                    if (field.key === 'versionUpdateDate') {
                                        value = format(new Date(value), 'dd.MM.yyyy');
                                    }
                                    return (
                                        <div key={field.key} className="mb-1">
                                            <strong>{field.label}: </strong>
                                            <span>{value}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })
                        )}
                    </Col>

                    {/* Right Column */}
                    <Col md={6}>
                        {rightColumnFields.map((field) => {
                            const value = localDevice[field.key] || localDevice.attributes?.[field.key];
                            if (value !== undefined && value !== null) {
                                return (
                                    <div key={field.key} className="mb-1">
                                        <strong>{field.label}: </strong> {value}
                                    </div>
                                );
                            }
                            return null;
                        })}
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
            navigate('/history', { state: { endpoint: `device/history/${device.id}` } });
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
                    <Card.Body>{renderFields()}</Card.Body>
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
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                        <Tab eventKey="addField" title="Add Field">
                            <Form className="mt-3">
                                {fieldError && <Alert variant="danger">{fieldError}</Alert>}
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
                                <Form.Check
                                    type="checkbox"
                                    label="Add to all devices"
                                    checked={newField.addToAll}
                                    onChange={(e) => setNewField({ ...newField, addToAll: e.target.checked })}
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
                                        <div key={field.key} className="d-flex align-items-center mb-2">
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
                    <Button variant="outline-info" onClick={() => setShowDeviceFieldModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {showEditModal && (
                <EditDevice
                    deviceId={localDevice.id}
                    onClose={() => {
                        setShowEditModal(false);
                        setRefresh((prev) => !prev);
                    }}
                    setRefresh={setRefresh}
                    introducedDate={localDevice.introducedDate}
                    writtenOffDate={localDevice.writtenOffDate}
                />
            )}

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
                    Are you sure you want to delete the attribute "<strong>{fieldToDelete}</strong>"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowDeleteConfirmModal(false); setFieldToDelete(null); }}>
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
