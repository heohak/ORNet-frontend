import React from 'react';
import { Modal, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import { DateUtils } from '../../utils/DateUtils';
import { Link } from 'react-router-dom';
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";

function DeviceDetailsModal({
                                show,
                                onHide,
                                deviceId,
                                activeTab,
                                setActiveTab,
                                linkedDevices,
                                fieldsConfig,
                                locations,
                                handleFieldToggle,
                                handleDeleteField,
                                fieldToDelete,
                                showDeleteConfirmModal,
                                setShowDeleteConfirmModal,
                                setFieldToDelete,
                                fieldError,
                                newField,
                                setNewField,
                                handleAddField,
                                comments,
    setComments,
                                newComment,
                                setNewComment,
                                isSubmitting,
                                handleAddComment,
                                showUnlinkConfirmModal,
                                setShowUnlinkConfirmModal,
                                handleUnlinkDevice,
                                isLinkedDevicePage,
                                // Edit states
                                editName,
                                setEditName,
                                editManufacturer,
                                setEditManufacturer,
                                editProductCode,
                                setEditProductCode,
                                editSerialNumber,
                                setEditSerialNumber,
                                editDescription,
                                setEditDescription,
                                editIntroducedDate,
                                setEditIntroducedDate,
                                editLocationId,
                                setEditLocationId,
                                editError,
                                handleUpdateLinkedDevice,
                                showDeleteLinkedDeviceModal,
                                setShowDeleteLinkedDeviceModal,
                                handleDeleteLinkedDevice,
                                mainDevices
                            }) {
    // Find the device whose details we are displaying
    const device = linkedDevices.find((d) => d.id === deviceId);
    const isTemplate = device?.template;
    // For template devices, only allow these keys (case-insensitive)
    const templateAllowedKeys = ['name', 'manufacturer', 'productcode', 'description'];

    // Render the content for the Details tab
    const renderDetails = () => {
        if (!device) return null;
        const deviceFields = fieldsConfig[deviceId] || [];
        const fieldsToRender = isTemplate
            ? deviceFields.filter(field => templateAllowedKeys.includes(field.key.toLowerCase()))
            : deviceFields;
        return fieldsToRender.map((field) => {
            if (!field.visible) return null;
            let value = field.isAttribute ? device.attributes?.[field.key] : device[field.key];
            if (value == null) return null;
            if (field.key.toLowerCase() === 'deviceid') {
                const mainDevice = mainDevices.find(md => md.id === value);
                const mainName = mainDevice ? mainDevice.deviceName : value;
                const serial = device.serialNumber ? `, ${device.serialNumber}` : '';
                value = mainDevice ? (
                    <span>
            <Link to={`/device/${mainDevice.id}`} state={{ fromPath: '/linkeddevices' }}>
              {mainName}
            </Link>{serial}
          </span>
                ) : `${mainName}${serial}`;
            }
            if (field.key === 'introducedDate') {
                value = format(new Date(value), 'dd/MM/yyyy');
            }
            if (field.key === 'locationId') {
                const foundLoc = locations.find(loc => loc.id === value);
                value = foundLoc ? foundLoc.name : `Location ID: ${value}`;
            }
            return (
                <div key={field.key} className="mb-2">
                    <strong>{field.label}:</strong> {value}
                </div>
            );
        });
    };

    // Render the content for the Edit tab.
    // If the device is a template, only four fields are editable.
    const renderEdit = () => {
        if (isTemplate) {
            return (
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
                        />
                    </Form.Group>
                    <Form.Group controlId="editProductCode" className="mb-3">
                        <Form.Label>Product Code</Form.Label>
                        <Form.Control
                            type="text"
                            value={editProductCode}
                            onChange={(e) => setEditProductCode(e.target.value)}
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
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="danger" onClick={() => setShowDeleteLinkedDeviceModal(true)}>
                            Delete Linked Device
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </div>
                </Form>
            );
        } else {
            return (
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
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="editLocationId" className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            as="select"
                            value={editLocationId}
                            onChange={(e) => setEditLocationId(e.target.value)}
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => (
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
            );
        }
    };

    // Build extra tabs for non‑template devices only
    const extraTabs = [];
    if (!isTemplate) {
        extraTabs.push(
            <Tab key="manageFields" eventKey="manageFields" title="Manage Fields">
                <Form className="mt-3">
                    {deviceId && fieldsConfig[deviceId] && fieldsConfig[deviceId].map((field) => (
                        <Form.Check
                            key={field.key}
                            type="checkbox"
                            label={field.label}
                            checked={field.visible}
                            onChange={() => handleFieldToggle(deviceId, field.key)}
                        />
                    ))}
                </Form>
            </Tab>,
            <Tab key="addField" eventKey="addField" title="Add Field">
                <Form className="mt-3">
                    {fieldError && (
                        <Alert variant="danger" dismissible onClose={() => {}}>
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
            </Tab>,
            <Tab key="customAttributes" eventKey="customAttributes" title="Delete Fields">
                <Form className="mt-3">
                    {deviceId && fieldsConfig[deviceId] && fieldsConfig[deviceId]
                        .filter(f => f.isAttribute)
                        .map((field) => (
                            <div key={field.key} className="d-flex align-items-center mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label={field.label}
                                    checked={field.visible}
                                    onChange={() => handleFieldToggle(deviceId, field.key)}
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
            </Tab>,
            <Tab key="comments" eventKey="comments" title="Comments">
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
                    comments.map((comment) => (
                        <div key={comment.id} className="mb-2 d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{DateUtils.formatDate(comment.timestamp)}</strong>: {comment.comment}
                            </div>
                            <Button
                                variant="link"
                                size="sm"
                                className="text-danger"
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Delete Comment"
                            >
                                <FaTrash />
                            </Button>
                        </div>
                    ))
                ) : (
                    <p>No comments available.</p>
                )}
            </Tab>
        );
        if (!isLinkedDevicePage) {
            extraTabs.push(
                <Tab key="unlink" eventKey="unlink" title="Unlink Device">
                    <Button variant="danger" onClick={() => setShowUnlinkConfirmModal(true)}>
                        Unlink Device
                    </Button>
                </Tab>
            );
        }
    }

    const fetchComments = async (linkedDeviceId) => {
        try {
            const url = `${config.API_BASE_URL}/linked/device/comment/${linkedDeviceId}`;
            const response = await axiosInstance.get(url);
            setComments(response.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/comment/${commentId}`);
            // Refresh comments after deletion:
            fetchComments(deviceId);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };




    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isTemplate ? "Template Details" : "Linked Device Details"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                        <Tab eventKey="details" title="Details">
                            {deviceId && renderDetails()}
                        </Tab>
                        <Tab eventKey="edit" title="Edit">
                            {renderEdit()}
                        </Tab>
                        {extraTabs}
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
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

            <Modal show={showDeleteLinkedDeviceModal} onHide={() => setShowDeleteLinkedDeviceModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <strong>delete</strong> this linked device entirely?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowDeleteLinkedDeviceModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteLinkedDevice}>
                        Delete Linked Device
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeviceDetailsModal;
