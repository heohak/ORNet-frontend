// src/pages/SettingsPage/ViewLinkedDevices.js

import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Button,
    Alert,
    Modal,
    Form,
    Spinner,
    Container, // Import Container
} from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// Import your DeviceDetailsModal
import DeviceDetailsModal from '../OneDevicePage/DeviceDetailsModal'; // Keep your original import path

function ViewLinkedDevices({}) {
    // =======================
    // States
    // =======================
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States for adding a new Linked Device
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [productCode, setProductCode] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [description, setDescription] = useState('');
    const [introducedDate, setIntroducedDate] = useState(null);
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);

    // States for sorting
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // States for DeviceDetailsModal
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // Fields configuration
    const [fieldsConfig, setFieldsConfig] = useState({});

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Additional States for DeviceDetailsModal
    const [fieldError, setFieldError] = useState(null);
    const [newField, setNewField] = useState({ key: '', value: '' });
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    const [editName, setEditName] = useState('');
    const [editManufacturer, setEditManufacturer] = useState('');
    const [editProductCode, setEditProductCode] = useState('');
    const [editSerialNumber, setEditSerialNumber] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIntroducedDate, setEditIntroducedDate] = useState(null);
    const [editLocationId, setEditLocationId] = useState('');
    const [editError, setEditError] = useState(null);
    const [showDeleteLinkedDeviceModal, setShowDeleteLinkedDeviceModal] = useState(false);

    // =======================
    // Effects
    // =======================
    useEffect(() => {
        fetchLinkedDevices();
        fetchAllLocations();
    }, []);

    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeFieldsConfig(linkedDevices);
        }
    }, [linkedDevices]);

    // =======================
    // Fetch Linked Devices
    // =======================
    const fetchLinkedDevices = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching linked devices:', err);
            setError('Error fetching linked devices');
        } finally {
            setLoading(false);
        }
    };

    // =======================
    // Fetch Locations
    // =======================
    const fetchAllLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    // =======================
    // Initialize Fields Config
    // =======================
    const initializeFieldsConfig = (devices) => {
        const defaultFields = [
            { key: 'name', label: 'Name', showInRow: true },
            { key: 'manufacturer', label: 'Manufacturer', showInRow: true },
            { key: 'productCode', label: 'Product Code', showInRow: true },
            { key: 'serialNumber', label: 'Serial Number', showInRow: true },
        ];

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
                    const parsed = JSON.parse(storedVisibleFields);
                    fieldsConfigForDevice = fieldsConfigForDevice.map((f) => ({
                        ...f,
                        visible: parsed.includes(f.key),
                    }));
                } catch (error) {
                    console.error(`Error parsing visibleFields for device ${device.id}:`, error);
                }
            }

            if (device.attributes) {
                Object.keys(device.attributes).forEach((attrKey) => {
                    if (!fieldsConfigForDevice.some((f) => f.key === attrKey)) {
                        fieldsConfigForDevice.push({
                            key: attrKey,
                            label: attrKey,
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

    // =======================
    // Sorting
    // =======================
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const sortedLinkedDevices = [...linkedDevices].sort((a, b) => {
        const valueA = a[sortConfig.key] || '';
        const valueB = b[sortConfig.key] || '';
        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    // =======================
    // Table Row Click -> Open Details
    // =======================
    const handleLinkedDeviceClick = (devId) => {
        const device = linkedDevices.find(d => d.id === devId);
        if (device) {
            // Initialize edit states with current device values
            setEditName(device.name || '');
            setEditManufacturer(device.manufacturer || '');
            setEditProductCode(device.productCode || '');
            setEditSerialNumber(device.serialNumber || '');
            setEditDescription(device.description || '');
            setEditIntroducedDate(device.introducedDate ? new Date(device.introducedDate) : null);
            setEditLocationId(device.locationId || '');
            setEditError(null);
        }
        setCurrentDeviceId(devId);
        setShowDeviceModal(true);
        setActiveTab('details');
        fetchComments(devId);
    };

    const handleUpdateLinkedDevice = async (e) => {
        e.preventDefault();
        try {
            let introducedDateIso = null;
            if (editIntroducedDate) {
                introducedDateIso = format(editIntroducedDate, 'yyyy-MM-dd');
            }

            const payload = {
                name: editName,
                manufacturer: editManufacturer,
                productCode: editProductCode,
                serialNumber: editSerialNumber,
                description: editDescription,
                introducedDate: introducedDateIso,
                locationId: editLocationId ? parseInt(editLocationId, 10) : null,
            };

            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/update/${currentDeviceId}`,
                payload
            );

            // Refresh the device list
            const updatedRes = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            setActiveTab('details');
        } catch (error) {
            console.error('Error updating linked device:', error);
            setEditError('Error updating linked device');
        }
    };

    const handleDeleteLinkedDevice = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/linked/device/${currentDeviceId}`);
            const updatedRes = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(updatedRes.data);
            setShowDeleteLinkedDeviceModal(false);
            setShowDeviceModal(false);
        } catch (error) {
            console.error('Error deleting linked device:', error);
            setEditError('Error deleting linked device');
        }
    };

    // =======================
    // Fetch Comments
    // =======================
    const fetchComments = async (devId) => {
        try {
            const url = `${config.API_BASE_URL}/linked/device/comment/${devId}`;
            const response = await axiosInstance.get(url);
            setComments(response.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    // =======================
    // Comments Handling
    // =======================
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (isSubmittingComment) return;
        setIsSubmittingComment(true);

        if (!newComment.trim()) {
            setIsSubmittingComment(false);
            return;
        }

        try {
            const url = `${config.API_BASE_URL}/linked/device/comment/${currentDeviceId}`;
            await axiosInstance.put(url, newComment, {
                headers: { 'Content-Type': 'text/plain' }
            });
            setComments([{ comment: newComment, timestamp: new Date() }, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            // Optionally set an error state here
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // =======================
    // Manage Fields / Add Field / Delete Field
    // =======================
    const handleFieldToggleLocal = (devId, key) => {
        handleFieldToggle(devId, key);
    };

    const handleDeleteFieldLocal = () => {
        handleDeleteField();
    };

    const handleAddFieldLocal = () => {
        handleAddField();
    };

    const handleFieldToggle = (devId, key) => {
        setFieldsConfig((prev) => {
            const updated = { ...prev };
            const devFields = updated[devId] || [];
            updated[devId] = devFields.map((f) =>
                f.key === key ? { ...f, visible: !f.visible } : f
            );
            const visibleList = updated[devId]
                .filter((f) => f.visible)
                .map((f) => f.key);
            localStorage.setItem(`linkedDeviceVisibleFields_${devId}`, JSON.stringify(visibleList));
            return updated;
        });
    };

    const handleDeleteField = async () => {
        if (!fieldToDelete) return;
        try {
            const encoded = encodeURIComponent(fieldToDelete);
            await axiosInstance.delete(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}/${encoded}`
            );
            const updated = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(updated.data);
            initializeFieldsConfig(updated.data);
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        } catch (error) {
            console.error('Error deleting field:', error);
            setFieldError('Failed to delete field.');
            setShowDeleteConfirmModal(false);
            setFieldToDelete(null);
        }
    };

    const handleAddField = async () => {
        if (!newField.key.trim() || !newField.value.trim()) {
            setFieldError('Please enter both key and value for the new field.');
            return;
        }
        const devFields = fieldsConfig[currentDeviceId] || [];
        if (
            devFields.some(
                (f) => f.key.toLowerCase() === newField.key.toLowerCase()
            )
        ) {
            setFieldError('Field key already exists. Use a unique key.');
            return;
        }

        const attribute = { [newField.key]: newField.value };
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}/attributes`,
                attribute
            );
            const updated = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(updated.data);
            initializeFieldsConfig(updated.data);
            setFieldError(null);
            setNewField({ key: '', value: '' });
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field.');
        }
    };

    // =======================
    // Add New Linked Device
    // =======================
    const handleAddLinkedDeviceSubmit = async (e) => {
        e.preventDefault();
        try {
            let introducedDateFormatted = null;
            if (introducedDate) {
                introducedDateFormatted = format(introducedDate, 'yyyy-MM-dd');
            }

            const devicePayload = {
                name,
                manufacturer,
                productCode,
                serialNumber,
                description,
                introducedDate: introducedDateFormatted,
                locationId: locationId ? parseInt(locationId, 10) : null,
            };

            await axiosInstance.post(`${config.API_BASE_URL}/linked/device/add`, devicePayload);
            fetchLinkedDevices();
            setShowAddModal(false);

            // Clear fields
            setName('');
            setManufacturer('');
            setProductCode('');
            setSerialNumber('');
            setDescription('');
            setIntroducedDate(null);
            setLocationId('');
        } catch (err) {
            console.error('Error adding linked device:', err);
            setError('Error adding linked device');
        }
    };

    // =======================
    // Render
    // =======================
    return (
        <Container className="mt-4"> {/* Wrap content in Container */}
            <Row>
                <Col>
                    {/* Heading + "Add New Linked Device" button */}
                    <Row className="d-flex justify-content-between align-items-center mb-2">
                        <Col>
                            <h2 className="mb-0">Linked Devices</h2>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                Add New Linked Device
                            </Button>
                        </Col>
                    </Row>

                    {/* Sortable Table Headers */}
                    <Row style={{ fontWeight: 'bold' }} className="text-center">
                        <Col md={3} onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            Name {renderSortIcon('name')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('manufacturer')} style={{ cursor: 'pointer' }}>
                            Manufacturer {renderSortIcon('manufacturer')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('productCode')} style={{ cursor: 'pointer' }}>
                            Product Code {renderSortIcon('productCode')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('serialNumber')} style={{ cursor: 'pointer' }}>
                            Serial Number {renderSortIcon('serialNumber')}
                        </Col>
                    </Row>
                    <hr />

                    {/* Linked Devices Rows */}
                    {loading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : linkedDevices.length === 0 ? (
                        <Alert variant="info">No linked devices found.</Alert>
                    ) : (
                        sortedLinkedDevices.map((device, index) => {
                            const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                            return (
                                <Row
                                    key={device.id}
                                    className="align-items-center text-center py-2"
                                    style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                    onClick={() => handleLinkedDeviceClick(device.id)}
                                >
                                    <Col md={3}>{device.name}</Col>
                                    <Col md={3}>{device.manufacturer}</Col>
                                    <Col md={3}>{device.productCode}</Col>
                                    <Col md={3}>{device.serialNumber}</Col>
                                </Row>
                            );
                        })
                    )}

                    {/* Add Linked Device Modal */}
                    <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Linked Device</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleAddLinkedDeviceSubmit}>
                            <Modal.Body>
                                {error && (
                                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                        {error}
                                    </Alert>
                                )}
                                <Form.Group controlId="formName" className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter name"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formManufacturer" className="mb-3">
                                    <Form.Label>Manufacturer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={manufacturer}
                                        onChange={(e) => setManufacturer(e.target.value)}
                                        placeholder="Enter manufacturer"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formProductCode" className="mb-3">
                                    <Form.Label>Product Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={productCode}
                                        onChange={(e) => setProductCode(e.target.value)}
                                        placeholder="Enter product code"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formSerialNumber" className="mb-3">
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        placeholder="Enter serial number"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formLocation" className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={locationId}
                                        onChange={(e) => setLocationId(e.target.value)}
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="formIntroducedDate" className="mb-3">
                                    <Form.Label>Introduced Date</Form.Label>
                                    <ReactDatePicker
                                        selected={introducedDate}
                                        onChange={(date) => setIntroducedDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                        placeholderText="Select introduced date"
                                        isClearable
                                    />
                                </Form.Group>

                                <Form.Group controlId="formDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter description"
                                    />
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    Add Linked Device
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* DeviceDetailsModal */}
                    {currentDeviceId && (
                        <DeviceDetailsModal
                            show={showDeviceModal}
                            onHide={() => setShowDeviceModal(false)}
                            deviceId={currentDeviceId}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            linkedDevices={linkedDevices}
                            fieldsConfig={fieldsConfig}
                            locations={locations}
                            handleFieldToggle={handleFieldToggleLocal}
                            handleDeleteField={handleDeleteFieldLocal}
                            fieldToDelete={fieldToDelete}
                            showDeleteConfirmModal={showDeleteConfirmModal}
                            setShowDeleteConfirmModal={setShowDeleteConfirmModal}
                            setFieldToDelete={setFieldToDelete}
                            fieldError={fieldError}
                            newField={newField}
                            setNewField={setNewField}
                            handleAddField={handleAddFieldLocal}
                            comments={comments}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            isSubmitting={isSubmittingComment}
                            handleAddComment={handleAddComment}
                            isLinkedDevicePage={true} // Indicate the context to hide link/unlink

                            editName={editName}
                            setEditName={setEditName}
                            editManufacturer={editManufacturer}
                            setEditManufacturer={setEditManufacturer}
                            editProductCode={editProductCode}
                            setEditProductCode={setEditProductCode}
                            editSerialNumber={editSerialNumber}
                            setEditSerialNumber={setEditSerialNumber}
                            editDescription={editDescription}
                            setEditDescription={setEditDescription}
                            editIntroducedDate={editIntroducedDate}
                            setEditIntroducedDate={setEditIntroducedDate}
                            editLocationId={editLocationId}
                            setEditLocationId={setEditLocationId}
                            editError={editError}
                            handleUpdateLinkedDevice={handleUpdateLinkedDevice}
                            showDeleteLinkedDeviceModal={showDeleteLinkedDeviceModal}
                            setShowDeleteLinkedDeviceModal={setShowDeleteLinkedDeviceModal}
                            handleDeleteLinkedDevice={handleDeleteLinkedDevice}
                        />
                    )}

                    {/* Delete Linked Device Confirmation Modal */}
                    {/* Since this functionality is excluded in "All Linked Devices", ensure it's handled within DeviceDetailsModal */}
                </Col>
            </Row>
        </Container>

        );
}

export default ViewLinkedDevices;
