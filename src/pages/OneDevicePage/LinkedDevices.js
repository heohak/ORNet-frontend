import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Alert, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { FaTrash, FaCog, FaComments, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import { DateUtils } from '../../utils/DateUtils';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

function LinkedDevices({
                           linkedDevices,
                           availableLinkedDevices,
                           deviceId,
                           setLinkedDevices,
                           showModal,
                           setShowModal,
                           refreshData
                       }) {
    // =======================
    // State for linking/adding
    // =======================
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState('');
    const [showAddNewDeviceForm, setShowAddNewDeviceForm] = useState(false);
    const [newLinkedDevice, setNewLinkedDevice] = useState({
        name: '',
        manufacturer: '',
        productCode: '',
        serialNumber: '',
        description: '',
        introducedDate: null,
        locationId: '',
    });

    const [submitIndex, setSubmitIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldError, setFieldError] = useState(null);

    // =======================
    // For the main table row
    // =======================
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // We show some fields in the row, others not
    const defaultFields = [
        { key: 'name', label: 'Name', showInRow: true },
        { key: 'manufacturer', label: 'Manufacturer', showInRow: true },
        { key: 'productCode', label: 'Product Code', showInRow: true },
        { key: 'serialNumber', label: 'Serial Number', showInRow: true },

        // New fields that won't appear in the row, but do appear in Manage Fields & Details
        { key: 'locationId', label: 'Location', showInRow: false },
        { key: 'introducedDate', label: 'Introduced Date', showInRow: false },
        { key: 'description', label: 'Description', showInRow: false },
    ];

    // =======================
    // For the device details modal
    // =======================
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [fieldsConfig, setFieldsConfig] = useState({});
    const [newField, setNewField] = useState({ key: '', value: '' });
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // =======================
    // Comments
    // =======================
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // =======================
    // Unlink
    // =======================
    const [showUnlinkConfirmModal, setShowUnlinkConfirmModal] = useState(false);

    // =======================
    // Locations for the dropdown
    // =======================
    const [locations, setLocations] = useState([]);

    // Right alongside your other states:
    const [editName, setEditName] = useState('');
    const [editManufacturer, setEditManufacturer] = useState('');
    const [editProductCode, setEditProductCode] = useState('');
    const [editSerialNumber, setEditSerialNumber] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIntroducedDate, setEditIntroducedDate] = useState(null);
    const [editLocationId, setEditLocationId] = useState('');
    const [editError, setEditError] = useState(null);
    const [showDeleteLinkedDeviceModal, setShowDeleteLinkedDeviceModal] = useState(false);



    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    // If we have linked devices, initialize their field config
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

            // Start with all defaultFields (including your new ones)
            let fieldsConfigForDevice = defaultFields.map((field) => ({
                ...field,
                visible: true,
                isAttribute: false,
            }));

            // If we stored which fields are visible in localStorage, apply that
            if (storedVisibleFields) {
                try {
                    const parsedVisible = JSON.parse(storedVisibleFields);
                    fieldsConfigForDevice = fieldsConfigForDevice.map((field) => ({
                        ...field,
                        visible: parsedVisible.includes(field.key),
                    }));
                } catch (error) {
                    console.error(`Error parsing visibleFields for device ${device.id}:`, error);
                }
            }

            // Also add any dynamic attribute fields from device.attributes
            if (device.attributes) {
                Object.keys(device.attributes).forEach((attrKey) => {
                    if (!fieldsConfigForDevice.some((f) => f.key === attrKey)) {
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

    // =======================
    // Sort & Render Row
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
    // Table row click -> details
    // =======================
    const handleLinkedDeviceClick = (devId) => {

        // Inside handleLinkedDeviceClick
        const device = linkedDevices.find((d) => d.id === devId);
        if (device) {
            setEditName(device.name || '');
            setEditManufacturer(device.manufacturer || '');
            setEditProductCode(device.productCode || '');
            setEditSerialNumber(device.serialNumber || '');
            setEditDescription(device.description || '');
            const parsedDate = device.introducedDate ? new Date(device.introducedDate) : null;
            setEditIntroducedDate(parsedDate);
            setEditLocationId(device.locationId || '');
            setEditError(null);
        }

        setCurrentDeviceId(devId);
        setShowDeviceModal(true);
        setActiveTab('details');
        fetchComments(devId);
    };

    const handleDeleteLinkedDevice = async () => {
        try {
            await axiosInstance.delete(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}`
            );
            const updatedRes = await axiosInstance.get(
                `${config.API_BASE_URL}/linked/device/${deviceId}`
            );
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            setShowDeleteLinkedDeviceModal(false);
            setShowDeviceModal(false);
            if (refreshData) {
                refreshData();
            }
        } catch (error) {
            console.error('Error deleting linked device:', error);
            setEditError('Error deleting linked device');
        }
    };

    // =======================
    // Linking existing / Creating new device
    // =======================
    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitIndex === 0) {
            handleAddNewLinkedDevice(e);
        } else {
            handleLinkDevice(e);
        }
    };

    // Link existing
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
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`
            );
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

    // Create new + link
    const handleAddNewLinkedDevice = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Convert introducedDate if set
            let introducedDateFormatted = null;
            if (newLinkedDevice.introducedDate) {
                introducedDateFormatted = format(newLinkedDevice.introducedDate, 'yyyy-MM-dd');
            }

            const payload = {
                name: newLinkedDevice.name,
                manufacturer: newLinkedDevice.manufacturer,
                productCode: newLinkedDevice.productCode,
                serialNumber: newLinkedDevice.serialNumber,
                description: newLinkedDevice.description,
                introducedDate: introducedDateFormatted,
                locationId: newLinkedDevice.locationId
                    ? parseInt(newLinkedDevice.locationId, 10)
                    : null,
            };

            // 1) Create the device
            const response = await axiosInstance.post(
                `${config.API_BASE_URL}/linked/device/add`,
                payload
            );

            // 2) Link it
            const newDeviceId = response.data.token;
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/link/${newDeviceId}/${deviceId}`
            );

            // 3) Re-fetch updated devices
            const updatedLinkedDevices = await axiosInstance.get(
                `${config.API_BASE_URL}/linked/device/${deviceId}`
            );
            setLinkedDevices(updatedLinkedDevices.data);
            initializeFieldsConfig(updatedLinkedDevices.data);

            // 4) Reset form
            setNewLinkedDevice({
                name: '',
                manufacturer: '',
                productCode: '',
                serialNumber: '',
                description: '',
                introducedDate: null,
                locationId: '',
            });
            setShowAddNewDeviceForm(false);
            setShowModal(false);
        } catch (error) {
            console.error('Error adding new linked device:', error);
            setFieldError('Failed to add and link the new device. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // =======================
    // Manage Fields / Details
    // =======================

    // main function to display in the Details tab
    const renderFieldsForModal = (devId) => {
        const deviceFieldsConfig = fieldsConfig[devId] || [];
        const device = linkedDevices.find((d) => d.id === devId);
        if (!device) return null;

        return deviceFieldsConfig.map((field) => {
            // Skip if toggled off
            if (!field.visible) return null;

            // The raw data
            let value = field.isAttribute
                ? device.attributes?.[field.key]
                : device[field.key];

            if (value == null) return null;

            // Transform introducedDate
            if (field.key === 'introducedDate') {
                // e.g. "yyyy-MM-dd" from backend
                // Format to dd/MM/yyyy
                value = format(new Date(value), 'dd/MM/yyyy');
            }

            // Transform locationId -> location name
            if (field.key === 'locationId') {
                const foundLoc = locations.find((loc) => loc.id === value);
                value = foundLoc ? foundLoc.name : `Location ID: ${value}`;
            }

            return (
                <div key={field.key} className="mb-2">
                    <strong>{field.label}:</strong> {value}
                </div>
            );
        });
    };

    // toggling field visibility
    const handleFieldToggle = (devId, key) => {
        setFieldsConfig((prev) => {
            const updated = { ...prev };
            const devFields = updated[devId] || [];

            updated[devId] = devFields.map((f) =>
                f.key === key ? { ...f, visible: !f.visible } : f
            );

            // Persist to localStorage
            const visibleFieldsArray = updated[devId]
                .filter((f) => f.visible)
                .map((f) => f.key);
            const deviceSpecificKey = `linkedDeviceVisibleFields_${devId}`;
            localStorage.setItem(deviceSpecificKey, JSON.stringify(visibleFieldsArray));

            return updated;
        });
    };

    // Add new custom field to attributes
    const handleAddField = async () => {
        if (!newField.key.trim() || !newField.value.trim()) {
            setFieldError('Please enter both key and value for the new field.');
            return;
        }
        const devFields = fieldsConfig[currentDeviceId] || [];
        if (devFields.some((f) => f.key.toLowerCase() === newField.key.toLowerCase())) {
            setFieldError('Field key already exists. Use a unique key.');
            return;
        }

        const attribute = { [newField.key]: newField.value };
        try {
            // PUT to /linked/device/{currentDeviceId}/attributes
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}/attributes`,
                attribute
            );
            // Refresh
            const updated = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updated.data);
            initializeFieldsConfig(updated.data);

            setFieldError(null);
            setNewField({ key: '', value: '' });
        } catch (error) {
            console.error('Error adding new field:', error);
            setFieldError('Failed to add new field.');
        }
    };

    // Deleting an attribute field
    const handleDeleteField = async () => {
        if (!fieldToDelete) return;
        try {
            const encoded = encodeURIComponent(fieldToDelete);
            await axiosInstance.delete(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}/${encoded}`
            );

            // Refresh
            const updated = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
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

    // New function to send the PUT request
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

            const updatedRes = await axiosInstance.get(
                `${config.API_BASE_URL}/linked/device/${deviceId}`
            );
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            setActiveTab('details');
        } catch (error) {
            console.error('Error updating linked device:', error);
            setEditError('Error updating linked device');
        }
    };


    // =======================
    // Comments
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

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!newComment.trim()) {
            setIsSubmitting(false);
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
        } finally {
            setIsSubmitting(false);
        }
    };

    // =======================
    // Unlink
    // =======================
    const handleUnlinkDevice = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/remove/${currentDeviceId}`
            );
            const updatedRes = await axiosInstance.get(
                `${config.API_BASE_URL}/linked/device/${deviceId}`
            );
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);

            if (refreshData) {
                refreshData();
            }
            setShowUnlinkConfirmModal(false);
            setShowDeviceModal(false);
        } catch (error) {
            console.error('Error unlinking device:', error);
            setFieldError('Failed to unlink the device.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // =======================
    // Render
    // =======================
    return (
        <>
            {/* Heading + Link Device button */}
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
                {defaultFields
                    .filter((field) => field.showInRow)
                    .map((field) => (
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

            {/* Linked Devices List Rows */}
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
                            {defaultFields
                                .filter((f) => f.showInRow)
                                .map((field) => (
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
            <Modal backdrop="static" show={showModal} onHide={() => setShowModal(false)}>
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
                                <Form.Group controlId="selectDevice" className="mb-3">
                                    <Form.Label>Select Device to Link</Form.Label>
                                    <Button
                                        variant="link"
                                        onClick={() => setShowAddNewDeviceForm(true)}
                                    >
                                        Add new linked device
                                    </Button>
                                    <Form.Control
                                        as="select"
                                        value={selectedLinkedDeviceId}
                                        onChange={(e) => setSelectedLinkedDeviceId(e.target.value)}
                                    >
                                        <option value="">Select a device...</option>
                                        {availableLinkedDevices.map((ld) => (
                                            <option key={ld.id} value={ld.id}>
                                                {ld.name} (Serial: {ld.serialNumber})
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </>
                        )}
                        {showAddNewDeviceForm && (
                            <>
                                <Form.Group controlId="newDeviceName" className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newLinkedDevice.name}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, name: e.target.value })
                                        }
                                        placeholder="Enter name"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="newDeviceManufacturer" className="mb-3">
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

                                <Form.Group controlId="newDeviceProductCode" className="mb-3">
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

                                <Form.Group controlId="newDeviceSerialNumber" className="mb-3">
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

                                <Form.Group controlId="newDeviceIntroducedDate" className="mb-3">
                                    <Form.Label>Introduced Date</Form.Label>
                                    <ReactDatePicker
                                        selected={newLinkedDevice.introducedDate}
                                        onChange={(date) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, introducedDate: date })
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                        placeholderText="Select introduced date"
                                        isClearable
                                    />
                                </Form.Group>

                                <Form.Group controlId="newDeviceLocationId" className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={newLinkedDevice.locationId}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, locationId: e.target.value })
                                        }
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="newDeviceDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={newLinkedDevice.description}
                                        onChange={(e) =>
                                            setNewLinkedDevice({ ...newLinkedDevice, description: e.target.value })
                                        }
                                        placeholder="Enter description"
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
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                                onMouseDown={() => setSubmitIndex(0)}
                            >
                                {isSubmitting ? 'Adding...' : 'Add and Link Device'}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                                onMouseDown={() => setSubmitIndex(1)}
                            >
                                {isSubmitting ? 'Linking...' : 'Link Device'}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Device Details Modal */}
            <Modal backdrop="static" show={showDeviceModal} onHide={() => setShowDeviceModal(false)} size="lg">
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
                                    <Alert variant="danger" dismissible onClose={() => setFieldError(null)}>
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
                                    {isSubmitting ? 'Adding...' : 'Add Comment'}
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

                        <Tab eventKey="edit" title="Edit">
                            {editError && (
                                <Alert variant="danger" onClose={() => setEditError(null)} dismissible>
                                    {editError}
                                </Alert>
                            )}
                            <Form onSubmit={handleUpdateLinkedDevice}>
                                <Form.Group controlId="editName" className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="editManufacturer" className="mb-3">
                                    <Form.Label>Manufacturer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editManufacturer}
                                        onChange={(e) => setEditManufacturer(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="editProductCode" className="mb-3">
                                    <Form.Label>Product Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editProductCode}
                                        onChange={(e) => setEditProductCode(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="editSerialNumber" className="mb-3">
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editSerialNumber}
                                        onChange={(e) => setEditSerialNumber(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="editDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="editIntroducedDate" className="mb-3">
                                    <Form.Label>Introduced Date</Form.Label>
                                    <ReactDatePicker
                                        selected={editIntroducedDate}
                                        onChange={(date) => setEditIntroducedDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control"
                                        isClearable
                                    />
                                </Form.Group>

                                <Form.Group controlId="editLocationId" className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={editLocationId}
                                        onChange={(e) => setEditLocationId(e.target.value)}
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button variant="danger" onClick={() => setShowDeleteLinkedDeviceModal(true)}>
                                        Delete Linked Device
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
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
            <Modal backdrop="static" show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
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

            <Modal
                backdrop="static"
                show={showDeleteLinkedDeviceModal}
                onHide={() => setShowDeleteLinkedDeviceModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <strong>delete</strong> this linked device entirely?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-info"
                        onClick={() => setShowDeleteLinkedDeviceModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteLinkedDevice}>
                        Delete Linked Device
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* Unlink Confirmation Modal */}
            <Modal
                backdrop="static"
                show={showUnlinkConfirmModal}
                onHide={() => setShowUnlinkConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Unlink</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to unlink this device?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-info"
                        onClick={() => setShowUnlinkConfirmModal(false)}
                    >
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
