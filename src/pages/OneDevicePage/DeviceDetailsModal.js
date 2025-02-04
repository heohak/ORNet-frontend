// DeviceDetailsModal.js

import React from 'react';
import { Modal, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import { DateUtils } from '../../utils/DateUtils';
import {Link} from "react-router-dom";

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
    // find the device for “Details” tab
    const device = linkedDevices.find((d) => d.id === deviceId);

    // Render fields respecting "field.visible"
    const renderFieldsForModal = () => {
        if (!device) return null;
        const deviceFields = fieldsConfig[deviceId] || [];

        return deviceFields.map((field) => {
            if (!field.visible) return null;

            let value = field.isAttribute
                ? device.attributes?.[field.key]
                : device[field.key];

            if (value == null) return null;

            // Special handling for the field that holds the main device id
            if (field.key.toLowerCase() === 'deviceid') {
                // Look up the main device by id from the mainDevices prop
                const mainDevice = mainDevices.find(md => md.id === value);
                const mainName = mainDevice ? mainDevice.deviceName : value;
                const serial = device.serialNumber ? `, ${device.serialNumber}` : '';

                // If the main device was found, make the name clickable
                if (mainDevice) {
                    value = (
                        <span>
            <Link to={`/device/${mainDevice.id}`} state={{ fromPath: '/linkeddevices' }}>{mainName}</Link>{serial}
          </span>
                    );
                } else {
                    value = `${mainName}${serial}`;
                }
            }

            // Format introducedDate
            if (field.key === 'introducedDate') {
                value = format(new Date(value), 'dd/MM/yyyy');
            }
            // Map locationId
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

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Linked Device Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="details" title="Details">
                            {deviceId && renderFieldsForModal()}
                        </Tab>

                        <Tab eventKey="manageFields" title="Manage Fields">
                            <Form className="mt-3">
                                {deviceId &&
                                    fieldsConfig[deviceId] &&
                                    fieldsConfig[deviceId].map((field) => (
                                        <Form.Check
                                            key={field.key}
                                            type="checkbox"
                                            label={field.label}
                                            checked={field.visible}
                                            onChange={() => handleFieldToggle(deviceId, field.key)}
                                        />
                                    ))}
                            </Form>
                        </Tab>

                        <Tab eventKey="addField" title="Add Field">
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
                                        onChange={(e) =>
                                            setNewField({ ...newField, key: e.target.value })
                                        }
                                        placeholder="Enter unique field key"
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
                                <Button variant="success" onClick={handleAddField}>
                                    Add Field
                                </Button>
                            </Form>
                        </Tab>

                        <Tab eventKey="customAttributes" title="Delete Fields">
                            <Form className="mt-3">
                                {deviceId &&
                                    fieldsConfig[deviceId] &&
                                    fieldsConfig[deviceId]
                                        .filter((f) => f.isAttribute)
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
                                <Button
                                    variant="primary"
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="mt-3"
                                >
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
                        {!isLinkedDevicePage && (
                        <Tab eventKey="unlink" title="Unlink Device">
                            <Button variant="danger" onClick={() => setShowUnlinkConfirmModal(true)}>
                                Unlink Device
                            </Button>
                        </Tab>
                            )}

                        <Tab eventKey="edit" title="Edit">
                            {editError && (
                                <Alert variant="danger" onClose={() => {}} dismissible>
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
                                    <Button
                                        variant="danger"
                                        onClick={() => setShowDeleteLinkedDeviceModal(true)}
                                    >
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
                    <Button variant="outline-info" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Attribute Confirmation Modal */}
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
            <Modal
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

            {/* Delete Linked Device Confirmation Modal */}
            <Modal
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
        </>
    );
}

export default DeviceDetailsModal;

