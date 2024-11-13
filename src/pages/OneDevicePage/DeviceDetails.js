import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Card,
    Button,
    Modal,
    Form,
    Alert,
    Col,
    Row,
    Tabs,
    Tab,
} from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config/config';
import DeviceFileList from './DeviceFileList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import '../../css/AllDevicesPage/Devices.css';
import DeviceStatusManager from './DeviceStatusManager';

function DeviceDetails({
                           device,
                           navigate,
                           setShowCommentsModal,
                           setRefresh,
                       }) {
    // State for managing field configurations
    const [fieldsConfig, setFieldsConfig] = useState([]);
    // State to control the visibility of the Manage Fields modal
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    // Active tab within the Manage Fields modal
    const [activeTab, setActiveTab] = useState('visibleFields');
    // State for adding a new field
    const [newField, setNewField] = useState({
        key: '',
        value: '',
        addToAll: false,
    });
    const [localDevice, setLocalDevice] = useState(device);
    const locationHook = useLocation();
    const introducedDate = device?.introducedDate;
    const [fieldError, setFieldError] = useState(null);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // Define default fields configuration
    const defaultFieldsConfig = [
        {
            key: 'deviceName',
            label: 'Device Name',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'clientName',
            label: 'Customer Name',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'locationName',
            label: 'Location Name',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'classificatorName',
            label: 'Classificator Name',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'introducedDate',
            label: 'Introduced Date',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'version',
            label: 'Version',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'versionUpdateDate',
            label: 'Version Update Date',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'firstIPAddress',
            label: 'First IP Address',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'secondIPAddress',
            label: 'Second IP Address',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'subnetMask',
            label: 'Subnet Mask',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'softwareKey',
            label: 'Software Key',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'writtenOffDate',
            label: 'Written Off Date',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'department',
            label: 'Department',
            visible: true,
            isAttribute: false,
        },
        {
            key: 'room',
            label: 'Room',
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
            key: 'licenseNumber',
            label: 'License Number',
            visible: true,
            isAttribute: false,
        },
        // Add more default fields as needed
    ];

    // Initialize fields configuration on component mount or when device changes
    useEffect(() => {
        if (device) {
            setLocalDevice(device);
            initializeFieldsConfig(device);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device]);

    // Function to initialize fields configuration
    const initializeFieldsConfig = (data) => {
        const deviceSpecificKey = `deviceVisibleFields_${data.id}`;
        const storedVisibleFields = localStorage.getItem(deviceSpecificKey);
        let initialFieldsConfig = [...defaultFieldsConfig];

        if (storedVisibleFields) {
            try {
                const parsedVisibleFields = JSON.parse(storedVisibleFields);
                let visibleFieldsArray = [];

                if (Array.isArray(parsedVisibleFields)) {
                    visibleFieldsArray = parsedVisibleFields;
                } else if (typeof parsedVisibleFields === 'object' && parsedVisibleFields !== null) {
                    // Convert object to array by filtering keys with true values
                    visibleFieldsArray = Object.keys(parsedVisibleFields).filter(
                        (key) => parsedVisibleFields[key]
                    );
                }

                initialFieldsConfig = initialFieldsConfig.map((field) => ({
                    ...field,
                    visible: visibleFieldsArray.includes(field.key),
                }));
            } catch (error) {
                console.error('Error parsing visibleFields from localStorage:', error);
                // If parsing fails, default to all fields visible
                initialFieldsConfig = initialFieldsConfig.map((field) => ({
                    ...field,
                    visible: true,
                }));
            }
        }

        // Add dynamic fields from attributes
        if (data.attributes) {
            Object.keys(data.attributes).forEach((attrKey) => {
                if (
                    !initialFieldsConfig.some(
                        (field) => field.key === attrKey
                    )
                ) {
                    initialFieldsConfig.push({
                        key: attrKey,
                        label: formatLabel(attrKey),
                        visible: true,
                        isAttribute: true,
                    });
                }
            });
        }

        setFieldsConfig(initialFieldsConfig);
    };

    // Function to format field labels for better readability
    const formatLabel = (label) => {
        const abbreviations = ['IP', 'API', 'ID']; // Add more as needed
        return label
            .replace(/clientName/, 'Customer Name')
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Handle consecutive uppercase letters
            .split(' ')
            .map((word) => {
                if (abbreviations.includes(word.toUpperCase())) {
                    return word.toUpperCase();
                }
                return (
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
            })
            .join(' ');
    };

    // Function to toggle field visibility
    const handleFieldToggle = (key) => {
        setFieldsConfig((prevConfig) =>
            prevConfig.map((field) =>
                field.key === key
                    ? { ...field, visible: !field.visible }
                    : field
            )
        );

        // Update localStorage after state update
        setTimeout(() => {
            const updatedFields = fieldsConfig.map((field) =>
                field.key === key
                    ? { ...field, visible: !field.visible }
                    : field
            );
            const visibleFieldsArray = updatedFields
                .filter((field) => field.visible)
                .map((field) => field.key);
            const deviceSpecificKey = `deviceVisibleFields_${device.id}`;
            localStorage.setItem(
                deviceSpecificKey,
                JSON.stringify(visibleFieldsArray)
            );
        }, 0);
    };

    // Function to handle adding a new field
    const handleAddField = async () => {
        if (
            newField.key.trim() === '' ||
            newField.value.trim() === ''
        ) {
            setFieldError('Please enter both key and value for the new field.');
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
                await axios.post(
                    `${config.API_BASE_URL}/device/attributes/add-to-all`,
                    attribute
                );
                console.log('Field added to all devices');

                // Update visibility for all devices in localStorage
                const globalVisibleFields =
                    JSON.parse(localStorage.getItem('globalVisibleFields') || '{}');
                globalVisibleFields[newField.key] = true;
                localStorage.setItem(
                    'globalVisibleFields',
                    JSON.stringify(globalVisibleFields)
                );

                // Update visibility for each device
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('deviceVisibleFields_')) {
                        const deviceFields = JSON.parse(
                            localStorage.getItem(key)
                        );
                        deviceFields[newField.key] = true;
                        localStorage.setItem(key, JSON.stringify(deviceFields));
                    }
                }
                window.location.reload();
            } else {
                // Add the new attribute to the current device
                await axios.put(
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
                        visible: true,
                        isAttribute: true,
                    },
                ]);

                // Update visibility settings in localStorage
                const deviceSpecificKey = `deviceVisibleFields_${device.id}`;
                const updatedVisibleFields = fieldsConfig
                    .filter((field) => field.visible)
                    .map((field) => field.key)
                    .concat(newField.key);
                localStorage.setItem(
                    deviceSpecificKey,
                    JSON.stringify(updatedVisibleFields)
                );
            }
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field.');
        }

        // Reset newField state and close the add field form
        setNewField({ key: '', value: '', addToAll: false });
        setFieldError(null);
    };

    // Function to handle deleting a custom field
    const handleDeleteField = async () => {
        if (!fieldToDelete) return;

        try {
            // Delete the attribute from the device
            await axios.delete(
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

            // Update visibility settings in localStorage
            const deviceSpecificKey = `deviceVisibleFields_${device.id}`;
            const updatedVisibleFields = fieldsConfig
                .filter((field) => field.visible && field.key !== fieldToDelete)
                .map((field) => field.key);
            localStorage.setItem(
                deviceSpecificKey,
                JSON.stringify(updatedVisibleFields)
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

    // Function to render device fields based on visibility
    const renderFields = () => {
        return fieldsConfig.map((field) => {
            const value =
                localDevice[field.key] || localDevice.attributes?.[field.key];
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

    // Function to handle navigating to device history
    const handleNavigate = () => {
        if (device && device.id) {
            navigate('/history', {
                state: { endpoint: `device/history/${device.id}` },
            });
        } else {
            console.error('Device or device id is undefined');
        }
    };

    return (
        <>
            {localDevice ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col>
                                {renderFields()}
                            </Col>
                            <Col className="col-md-auto">
                                <Row>
                                    <Col className="col-md-auto">
                                        <Button
                                            variant="link"
                                            className="me-2"
                                            onClick={() => setShowDeviceFieldModal(true)}
                                            title="Manage Fields"
                                        >
                                            <FontAwesomeIcon icon={faCog} />
                                        </Button>
                                    </Col>
                                    <Col className="col-md-auto">
                                        <Row>
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    navigate(`/device/edit/${localDevice.id}`, {
                                                        state: locationHook.state,
                                                    })
                                                }
                                            >
                                                Edit Device
                                            </Button>
                                        </Row>
                                        <Row>
                                            <Button
                                                onClick={handleNavigate}
                                                className="mt-2 mb-2"
                                            >
                                                See History
                                            </Button>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>



                        <Button
                            variant="info"
                            onClick={() => setShowCommentsModal(true)}
                        >
                            View Comments
                        </Button>


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

            {/* Manage Fields Modal */}
            <Modal
                show={showDeviceFieldModal}
                onHide={() => setShowDeviceFieldModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Manage Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        {/* Inside the "Manage Fields" modal */}
                        <Tab eventKey="visibleFields" title="Visible Fields">
                            <Form className="mt-3">
                                {fieldsConfig.map((field) => (
                                    <Form.Check
                                        key={field.key}
                                        type="checkbox"
                                        label={field.label}
                                        checked={field.visible}
                                        onChange={() => handleFieldToggle(field.key)}
                                    />
                                ))}
                            </Form>
                        </Tab>

                        <Tab eventKey="addField" title="Add Field">
                            <Form className="mt-3">
                                {fieldError && (
                                    <Alert variant="danger">{fieldError}</Alert>
                                )}
                                <Form.Group controlId="newFieldKey" className="mb-3">
                                    <Form.Label>Field Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newField.key}
                                        onChange={(e) =>
                                            setNewField({
                                                ...newField,
                                                key: e.target.value,
                                            })
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
                                            setNewField({
                                                ...newField,
                                                value: e.target.value,
                                            })
                                        }
                                        placeholder="Enter field value"
                                    />
                                </Form.Group>
                                <Form.Check
                                    type="checkbox"
                                    label="Add to all devices"
                                    checked={newField.addToAll}
                                    onChange={(e) =>
                                        setNewField({
                                            ...newField,
                                            addToAll: e.target.checked,
                                        })
                                    }
                                    className="mb-3"
                                />
                                <Button variant="success" onClick={handleAddField}>
                                    Add Field
                                </Button>
                            </Form>
                        </Tab>

                        {/* Add a new Tab for Managing Custom Attributes with Trashcan Icons */}
                        <Tab eventKey="customAttributes" title="Custom Attributes">
                            <h5 className="mt-3">Custom Attributes</h5>
                            <Form className="mt-3">
                                {fieldsConfig
                                    .filter((field) => field.isAttribute)
                                    .map((field) => (
                                        <div key={field.key} className="d-flex align-items-center mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                label={field.label}
                                                checked={field.visible}
                                                onChange={() => handleFieldToggle(field.key)}
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
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeviceFieldModal(false)}
                    >
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
