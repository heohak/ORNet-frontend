// src/components/ViewThirdPartyITModal.js

import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Alert,
    Tabs,
    Tab,
    Spinner,
    Form,
} from "react-bootstrap";
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";

// Icons (adjust to your preference)
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaCity } from "react-icons/fa";

// Sub-modals from your code
import AddClientWorker from "./AddClientWorker";
import FileList from "../../modals/FileList";
import FileUploadModal from "../../modals/FileUploadModal";

function ViewThirdPartyITModal({
                                   show,
                                   onHide,
                                   thirdParty,
                                   onUpdate,    // callback if data changes
                                   clientId,    // optional for AddClientWorker
                               }) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // localThirdParty stores the fresh data from server
    const [localThirdParty, setLocalThirdParty] = useState(thirdParty || {});
    const [activeTab, setActiveTab] = useState("details");

    // Contact details
    const [contactLoading, setContactLoading] = useState(false);
    const [contactError, setContactError] = useState(null);
    const [contactData, setContactData] = useState(null);

    // Sub-modals
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [showFileModal, setShowFileModal] = useState(false);

    // Files list
    const [files, setFiles] = useState([]);

    // For the Edit tab:
    const [editValues, setEditValues] = useState({
        name: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        streetAddress: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState("");

    // For Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- 1. On open, fetch fresh data ---
    useEffect(() => {
        if (show && thirdParty?.id) {
            fetchThirdPartyIT(thirdParty.id);
        }
    }, [show, thirdParty]);

    const fetchThirdPartyIT = async (tpId) => {
        setLoading(true);
        setError(null);
        try {
            // GET /third-party/{thirdPartyId} to fetch details
            const response = await axiosInstance.get(`${config.API_BASE_URL}/third-party/${tpId}`);
            setLocalThirdParty(response.data);

            // Then fetch files
            const filesResp = await axiosInstance.get(`${config.API_BASE_URL}/third-party/files/${tpId}`);
            setFiles(filesResp.data);

            // Preload editValues for the Edit tab
            setEditValues({
                name: response.data.name || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                country: response.data.country || "",
                city: response.data.city || "",
                streetAddress: response.data.streetAddress || "",
            });
        } catch (err) {
            console.error(err);
            setError("Failed to load Third-Party IT details.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. If there's a contactId, fetch that contact's details ---
    useEffect(() => {
        if (localThirdParty?.contactId) {
            fetchContactDetails(localThirdParty.contactId);
        } else {
            setContactData(null);
        }
    }, [localThirdParty]);

    const fetchContactDetails = async (workerId) => {
        setContactLoading(true);
        setContactError(null);
        try {
            // Adjust if your real endpoint is different
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/id/${workerId}`);
            setContactData(response.data);
        } catch (err) {
            console.error(err);
            setContactError("Failed to load contact details.");
        } finally {
            setContactLoading(false);
        }
    };

    // --- 3. Add/replace contact
    const handleAddContactSuccess = async (newWorker) => {
        setShowAddContactModal(false);
        try {
            const payload = { contactId: newWorker.id };
            await axiosInstance.put(
                `${config.API_BASE_URL}/third-party/update/${localThirdParty.id}`,
                payload
            );
            fetchThirdPartyIT(localThirdParty.id); // re-fetch
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Error assigning contact:", err);
            setError("Failed to assign contact.");
        }
    };

    // --- 4. File Upload success
    const handleFileOpSuccess = () => {
        setShowFileModal(false);
        fetchThirdPartyIT(localThirdParty.id);
        if (onUpdate) onUpdate();
    };

    // ========== (A) DETAILS TAB ==========
    const renderDetailsTab = () => {
        if (loading) return <Spinner animation="border" />;
        return (
            <>
                <div className="mb-3">
                    <FaMapMarkerAlt className="me-2" />
                    {localThirdParty.name || "N/A"}
                </div>
                <div className="mb-3">
                    <FaPhone className="me-2" />
                    {localThirdParty.phone || "N/A"}
                </div>
                <div className="mb-3">
                    <FaEnvelope className="me-2" />
                    {localThirdParty.email || "N/A"}
                </div>
                <div className="mb-3">
                    <FaGlobe className="me-2" />
                    {localThirdParty.country || "N/A"}
                </div>
                <div className="mb-3">
                    <FaCity className="me-2" />
                    {localThirdParty.city || "N/A"}
                </div>
                <div className="mb-3">
                    <FaMapMarkerAlt className="me-2" />
                    {localThirdParty.streetAddress || "N/A"}
                </div>
            </>
        );
    };

    // ========== (B) CONTACT TAB ==========
    const renderContactTab = () => {
        if (contactLoading) return <Spinner animation="border" />;
        if (!localThirdParty.contactId) {
            return (
                <Alert variant="info">
                    No contact assigned yet.
                    <div className="mt-2">
                        <Button variant="primary" onClick={() => setShowAddContactModal(true)}>
                            Add Contact
                        </Button>
                    </div>
                </Alert>
            );
        }
        if (contactError) {
            return <Alert variant="danger">{contactError}</Alert>;
        }
        if (contactData) {
            return (
                <>
                    <Alert variant="info">
                        <strong>Contact Details</strong>
                        <div className="mt-2">
                            {contactData.firstName} {contactData.lastName} <br />
                            {contactData.email || "N/A"} <br />
                            {contactData.phoneNumber || "N/A"} <br />
                            {contactData.title || "N/A"}
                        </div>
                    </Alert>
                    <Button variant="primary" onClick={() => setShowAddContactModal(true)}>
                        Replace Contact
                    </Button>
                </>
            );
        }
        return <Alert variant="info">Loading contact data...</Alert>;
    };

    // ========== (C) FILES TAB ==========
    const renderFilesTab = () => {
        return (
            <>
                <FileList files={files} />
                <div className="mt-3">
                    <Button variant="primary" onClick={() => setShowFileModal(true)}>
                        Upload Files
                    </Button>
                </div>
            </>
        );
    };

    // ========== (D) EDIT TAB ==========
    const renderEditTab = () => {
        return (
            <Form onSubmit={handleEditSubmit}>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        placeholder="Enter name"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={editValues.email}
                        onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                        placeholder="Enter email"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        value={editValues.phone}
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                        placeholder="Enter phone number"
                        required
                        isInvalid={!!phoneNumberError}
                    />
                    <Form.Control.Feedback type="invalid">
                        {phoneNumberError}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        value={editValues.country}
                        onChange={(e) => setEditValues({ ...editValues, country: e.target.value })}
                        placeholder="Enter country"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        type="text"
                        value={editValues.city}
                        onChange={(e) => setEditValues({ ...editValues, city: e.target.value })}
                        placeholder="Enter city"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={editValues.streetAddress}
                        onChange={(e) => setEditValues({ ...editValues, streetAddress: e.target.value })}
                        placeholder="Enter street address"
                    />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                        Delete
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </Form>
        );
    };

    // handle edit form submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // phone validation
        const trimmedPhone = editValues.phone.trim();
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhone)) {
            setPhoneNumberError(
                "Phone number must contain only numbers/spaces, and may start with +."
            );
            setIsSubmitting(false);
            return;
        } else {
            setPhoneNumberError("");
        }

        try {
            const payload = {
                name: editValues.name,
                email: editValues.email,
                phone: trimmedPhone,
                country: editValues.country,
                city: editValues.city,
                streetAddress: editValues.streetAddress,
            };
            await axiosInstance.put(
                `${config.API_BASE_URL}/third-party/update/${localThirdParty.id}`,
                payload
            );
            // Refresh
            await fetchThirdPartyIT(localThirdParty.id);
            if (onUpdate) onUpdate();
            setActiveTab("details"); // jump back to "details" if you want
        } catch (err) {
            console.error("Update error:", err);
            setError("Failed to update third-party IT data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // handle deletion
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/third-party/${localThirdParty.id}`);
            if (onUpdate) onUpdate();
            setShowDeleteModal(false);
            onHide(); // close the entire modal
        } catch (err) {
            console.error("Delete error:", err);
            setError("Failed to delete third-party IT.");
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="lg"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Third-Party IT</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        id="thirdPartyITTabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k || "details")}
                        className="mb-3"
                    >
                        <Tab eventKey="details" title="Details">
                            {renderDetailsTab()}
                        </Tab>

                        <Tab eventKey="contact" title="Contact">
                            {renderContactTab()}
                        </Tab>

                        <Tab eventKey="files" title="Files">
                            {renderFilesTab()}
                        </Tab>

                        <Tab eventKey="edit" title="Edit">
                            {renderEditTab()}
                        </Tab>
                    </Tabs>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Sub-modal for adding a contact (AddClientWorker) */}
            <AddClientWorker
                show={showAddContactModal}
                onClose={() => setShowAddContactModal(false)}
                onSuccess={handleAddContactSuccess}
                reFetchRoles={() => {}}
                showLocationField={false}           // NO location for third-party
                modalTitle="Add Third-Party Contact"
            />

            {/* File Upload Modal */}
            <FileUploadModal
                show={showFileModal}
                handleClose={() => setShowFileModal(false)}
                uploadEndpoint={`${config.API_BASE_URL}/third-party/upload/${localThirdParty.id}`}
                onUploadSuccess={handleFileOpSuccess}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{localThirdParty.name}</strong>?
                    <div style={{ color: "red", marginTop: "1rem" }}>
                        This will remove the Third-Party IT entity from all associated clients
                        and cannot be undone.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ViewThirdPartyITModal;
