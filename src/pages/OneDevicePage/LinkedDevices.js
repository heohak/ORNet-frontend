// LinkedDevices.js

import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Button,
    Alert,
    Modal,
    Form,
} from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// IMPORT your new DeviceDetailsModal
import DeviceDetailsModal from './DeviceDetailsModal';

function LinkedDevices({
                           linkedDevices,
                           availableLinkedDevices,
                           deviceId,
                           setLinkedDevices,
                           showModal,
                           setShowModal,
                           refreshData,
    clientId
                       }) {
    // =======================
    // States for linking / adding new device
    // =======================
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState('');
    const [showAddNewDeviceForm, setShowAddNewDeviceForm] = useState(true);
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
    // Sorting / table display
    // =======================
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const defaultFields = [
        { key: 'name', label: 'Name', showInRow: true },
        { key: 'manufacturer', label: 'Manufacturer', showInRow: true },
        { key: 'productCode', label: 'Product Code', showInRow: true },
        { key: 'serialNumber', label: 'Serial Number', showInRow: true },

        // Additional fields that won't appear in the row
        { key: 'locationId', label: 'Location', showInRow: false },
        { key: 'introducedDate', label: 'Introduced Date', showInRow: false },
        { key: 'description', label: 'Description', showInRow: false },
    ];

    // =======================
    // Device Details Modal States
    // =======================
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // For fields config
    const [fieldsConfig, setFieldsConfig] = useState({});
    const [newField, setNewField] = useState({ key: '', value: '' });
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Unlink
    const [showUnlinkConfirmModal, setShowUnlinkConfirmModal] = useState(false);

    // For location dropdown
    const [locations, setLocations] = useState([]);

    // For editing top-level fields in “Edit” tab
    const [editName, setEditName] = useState('');
    const [editManufacturer, setEditManufacturer] = useState('');
    const [editProductCode, setEditProductCode] = useState('');
    const [editSerialNumber, setEditSerialNumber] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIntroducedDate, setEditIntroducedDate] = useState(null);
    const [editLocationId, setEditLocationId] = useState('');
    const [editError, setEditError] = useState(null);
    const [showDeleteLinkedDeviceModal, setShowDeleteLinkedDeviceModal] = useState(false);
    const [templates, setTemplates] = useState([]);

    // =======================
    // Effects
    // =======================
    useEffect(() => {
        fetchLocations();
        fetchTemplates();
    }, []);

    // For demonstration, pretend we initialize fields config whenever linkedDevices changes
    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeFieldsConfig(linkedDevices);
        }
    }, [linkedDevices]);

    // =======================
    // Fetch locations
    // =======================
    // This function used to call /location/all
// Now it calls /location/locations/{clientId}
    const fetchLocations = async () => {
        if (!clientId) return;  // Only fetch if clientId is known

        try {
            const response = await axiosInstance.get(
                `${config.API_BASE_URL}/client/locations/${clientId}`
            );
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching client-specific locations:', err);
        }
    };


    // =======================
    // Fetch Linked Devices Templates
    // =======================
    const fetchTemplates = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/search`,{
                params: {
                    template: true
                }
            });
            setTemplates(response.data);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };


    // =======================
    // Initialize fields config
    // =======================
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
    // Table row -> open details
    // =======================
    const handleLinkedDeviceClick = (devId) => {
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

    // For deleting the entire linked device from “Edit”
    const handleDeleteLinkedDevice = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/linked/device/${currentDeviceId}`);
            const updatedRes = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            setShowDeleteLinkedDeviceModal(false);
            setShowDeviceModal(false);
            if (refreshData) refreshData();
        } catch (error) {
            console.error('Error deleting linked device:', error);
            setEditError('Error deleting linked device');
        }
    };

    // =======================
    // Link Device & Add New
    // =======================
    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitIndex === 0) {
            handleAddNewLinkedDevice();
        } else {
            handleLinkDevice(e);
        }
    };


    const handleTemplateSelect = (templateId) => {
        if (!templateId) return; // If no template is selected, do nothing

        const template = templates.find(t => t.id === Number(templateId)); // Ensure correct ID type
        if (template) {
            setNewLinkedDevice({
                ...newLinkedDevice, // Preserve other fields
                name: template.name,
                manufacturer: template.manufacturer,
                productCode: template.productCode,
                description: template.description,
            });
        }
    };


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

    const handleAddNewLinkedDevice = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
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

            const response = await axiosInstance.post(
                `${config.API_BASE_URL}/linked/device/add`,
                payload
            );

            const newDeviceId = response.data.token;
            await axiosInstance.put(
                `${config.API_BASE_URL}/linked/device/link/${newDeviceId}/${deviceId}`
            );

            const updated = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updated.data);
            initializeFieldsConfig(updated.data);

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
    // Manage Fields / Add Field / Delete Field
    // =======================
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

    const handleDeleteField = async () => {
        if (!fieldToDelete) return;
        try {
            const encoded = encodeURIComponent(fieldToDelete);
            await axiosInstance.delete(
                `${config.API_BASE_URL}/linked/device/${currentDeviceId}/${encoded}`
            );
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
            const updatedRes = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            if (refreshData) refreshData();
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
    // Updating the device (Edit Tab)
    // =======================
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

            const updatedRes = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(updatedRes.data);
            initializeFieldsConfig(updatedRes.data);
            setActiveTab('details');
        } catch (error) {
            console.error('Error updating linked device:', error);
            setEditError('Error updating linked device');
        }
    };

    // =======================
    // RENDER
    // =======================
    return (
        <>
            {/* Heading + "Link Device" button */}
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

            {/* Linked Devices Rows */}
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

            {/* "Link Device" Modal (Existing or New) */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {/* TOP TOGGLE BUTTONS */}
                        <Row className=" mb-2">
                            <Col className="text-start">
                                {showAddNewDeviceForm ? (
                                    <Button
                                        variant="link"
                                        onClick={() => setShowAddNewDeviceForm(false)}
                                        style={{ marginLeft: '-12px' }}
                                    >
                                        Select existing device
                                    </Button>
                                ) : (
                                    <Button
                                        variant="link"
                                        onClick={() => setShowAddNewDeviceForm(true)}
                                        style={{ marginLeft: '-12px' }}
                                    >
                                        Back to creating new Linked Device
                                    </Button>
                                )}
                            </Col>
                        </Row>

                        {fieldError && (
                            <Alert
                                variant="danger"
                                dismissible
                                onClose={() => setFieldError(null)}
                            >
                                {fieldError}
                            </Alert>
                        )}

                        {/* CONDITIONAL RENDERING BASED ON THE TOGGLE */}
                        {!showAddNewDeviceForm && (
                            <>
                                <Form.Group controlId="selectDevice" className="mb-3">
                                    <Form.Label>Select Device to Link</Form.Label>
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
                                <Form.Group controlId="formTemplateSelect" className="mb-3">
                                    <Form.Label>Select Template</Form.Label>
                                    <Form.Control
                                        as="select"
                                        onChange={(e) => handleTemplateSelect(e.target.value)}
                                    >
                                        <option value="">Select a template...</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="newDeviceName" className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newLinkedDevice.name}
                                        onChange={(e) =>
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                name: e.target.value,
                                            })
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
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                manufacturer: e.target.value,
                                            })
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
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                productCode: e.target.value,
                                            })
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
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                serialNumber: e.target.value,
                                            })
                                        }
                                        placeholder="Enter serial number"
                                    />
                                </Form.Group>

                                <Form.Group controlId="newDeviceIntroducedDate" className="mb-3">
                                    <Form.Label>Introduced Date</Form.Label>
                                    <div>
                                        <ReactDatePicker
                                            selected={newLinkedDevice.introducedDate}
                                            onChange={(date) =>
                                                setNewLinkedDevice({
                                                    ...newLinkedDevice,
                                                    introducedDate: date,
                                                })
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            className="form-control"
                                            placeholderText="Select introduced date"
                                            isClearable
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="newDeviceLocationId" className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={newLinkedDevice.locationId}
                                        onChange={(e) =>
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                locationId: e.target.value,
                                            })
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
                                            setNewLinkedDevice({
                                                ...newLinkedDevice,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Enter description"
                                    />
                                </Form.Group>
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


            {/* =========================
          Device Details Modal
          (Extracted into separate component)
       ========================= */}
            <DeviceDetailsModal
                show={showDeviceModal}
                onHide={() => setShowDeviceModal(false)}
                deviceId={currentDeviceId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                linkedDevices={linkedDevices}
                fieldsConfig={fieldsConfig}
                locations={locations}
                handleFieldToggle={handleFieldToggle}
                handleDeleteField={handleDeleteField}
                fieldToDelete={fieldToDelete}
                showDeleteConfirmModal={showDeleteConfirmModal}
                setShowDeleteConfirmModal={setShowDeleteConfirmModal}
                setFieldToDelete={setFieldToDelete}
                fieldError={fieldError}
                newField={newField}
                setNewField={setNewField}
                handleAddField={handleAddField}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                isSubmitting={isSubmitting}
                handleAddComment={handleAddComment}
                showUnlinkConfirmModal={showUnlinkConfirmModal}
                setShowUnlinkConfirmModal={setShowUnlinkConfirmModal}
                handleUnlinkDevice={handleUnlinkDevice}
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
                isLinkedDevicePage={false}
            />
        </>
    );
}

export default LinkedDevices;
