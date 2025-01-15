import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";
import '../../css/DarkenedModal.css';

/**
 * Flexible AddClientWorker modal.
 *
 * PROPS:
 * - show (boolean): Whether the modal is visible
 * - onClose (function): Closes the modal
 * - onSuccess (function): Callback once worker is successfully created
 * - reFetchRoles (function?): Optional. If you want to refresh roles after adding a new role
 *
 * - modalTitle (string?): Custom header text. Defaults to "Add Contact".
 *
 * - showLocationField (boolean?): Whether to show/fetch a location dropdown (default: false).
 *   If `true`, you should pass a valid clientId so we can fetch that client’s locations.
 *
 * - clientId (number?): If you intend to link this new worker to a specific client or fetch
 *   that client’s locations (only if showLocationField = true).
 */
function AddClientWorker({
                             show,
                             onClose,
                             onSuccess,
                             reFetchRoles,
                             modalTitle,
                             showLocationField = false,
                             clientId
                         }) {
    const [firstName,     setFirstName]     = useState('');
    const [lastName,      setLastName]      = useState('');
    const [email,         setEmail]         = useState('');
    const [phoneNumber,   setPhoneNumber]   = useState('');
    const [title,         setTitle]         = useState('');

    // Only used if showLocationField = true
    const [locationId,    setLocationId]    = useState('');
    const [locations,     setLocations]     = useState([]);

    // Roles
    const [roles,         setRoles]         = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    // UI states
    const [error,             setError]             = useState(null);
    const [phoneNumberError,  setPhoneNumberError]  = useState('');
    const [isSubmitting,      setIsSubmitting]      = useState(false);

    // "Add New Role" submodal
    const [showRoleModal,    setShowRoleModal]    = useState(false);
    const [newRole,          setNewRole]          = useState({ role: '' });
    const [isSubmittingRole, setIsSubmittingRole] = useState(false);

    //---------------------------------------------------------------------------
    // 1) Possibly fetch client’s locations if user wants location + we have clientId
    //---------------------------------------------------------------------------
    useEffect(() => {
        if (showLocationField && clientId) {
            const fetchClientLocations = async () => {
                try {
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                    // Convert to react-select options
                    const locOptions = response.data.map(loc => ({
                        value: loc.id,
                        label: loc.name
                    }));
                    // Sort them
                    const sorted = locOptions.sort((a, b) => a.label.localeCompare(b.label));
                    setLocations(sorted);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchClientLocations();
        }
    }, [showLocationField, clientId]);

    //---------------------------------------------------------------------------
    // 2) Fetch roles to show in "Select roles" dropdown
    //---------------------------------------------------------------------------
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/classificator/all`);
                const rolesMap = response.data.map(role => ({
                    value: role.id,
                    label: role.role
                }));
                // Sort them once
                const sorted   = rolesMap.sort((a, b) => a.label.localeCompare(b.label));
                setRoles(sorted);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRoles();
    }, []);

    // No additional effect that re-sorts `roles` on every render.
    // That was the cause of the infinite re-render.

    //---------------------------------------------------------------------------
    // MAIN "Add Worker" submission
    //---------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        // Validate phone
        const trimmedPhone = phoneNumber.trim();
        if (trimmedPhone && !/^\+?\d+(?:\s\d+)*$/.test(trimmedPhone)) {
            setPhoneNumberError('Phone must contain only numbers/spaces, can start with +.');
            setIsSubmitting(false);
            return;
        }
        setPhoneNumberError('');

        try {
            // 1) Create the worker
            const payload = {
                firstName,
                lastName,
                email,
                phoneNumber: trimmedPhone || null,
                title
            };

            // If we show location, then attach locationId (plus any client-side logic)
            if (showLocationField && clientId) {
                payload.locationId = locationId || null;
            }

            // POST /worker/add
            const resp = await axiosInstance.post(`${config.API_BASE_URL}/worker/add`, payload);
            let workerId = null;
            if (resp.data && resp.data.token) {
                workerId = resp.data.token;
            }

            // 2) Assign roles
            if (workerId) {
                for (const role of selectedRoles) {
                    await axiosInstance.put(`${config.API_BASE_URL}/worker/role/${workerId}/${role.value}`);
                }
            }

            // 3) If we have clientId => link the worker to that client
            if (showLocationField && clientId && workerId) {
                await axiosInstance.put(`${config.API_BASE_URL}/worker/${workerId}/${clientId}`);
            }

            // 4) Create a local "new worker" object
            const newWorker = {
                id: workerId,
                firstName,
                lastName,
                email,
                phoneNumber: trimmedPhone || null,
                title,
                locationId: showLocationField ? locationId : null,
                location: showLocationField
                    ? locations.find(l => l.value === locationId)
                    : null,
                roles: selectedRoles.map(r => r.label),
                roleIds: selectedRoles.map(r => r.value)
            };

            if (onSuccess) {
                onSuccess(newWorker);
            }
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    //---------------------------------------------------------------------------
    // Submodal: "Add New Role"
    //---------------------------------------------------------------------------
    const handleAddRole = async (e) => {
        e.preventDefault();
        if (isSubmittingRole) return;
        setIsSubmittingRole(true);

        const { role } = newRole;
        if (!role.trim()) {
            setError('Please enter a role name.');
            setIsSubmittingRole(false);
            return;
        }

        try {
            const resp = await axiosInstance.post(
                `${config.API_BASE_URL}/worker/classificator/add`,
                { role }
            );
            const addedRole = resp.data; // e.g. { id, role: 'MyNewRole' }
            const newRoleOption = { value: addedRole.id, label: addedRole.role };

            // Insert into roles array, and re-sort
            setRoles(prev => {
                const updated = [...prev, newRoleOption];
                updated.sort((a, b) => a.label.localeCompare(b.label));
                return updated;
            });

            // Auto-select it
            setSelectedRoles(prev => [...prev, newRoleOption]);

            handleCloseRoleModal();
            setError(null);
        } catch (err) {
            setError('Error adding role.');
            console.error(err);
        } finally {
            setIsSubmittingRole(false);
            // if there's a reFetchRoles prop, call it
            if (typeof reFetchRoles === 'function') {
                reFetchRoles();
            }
        }
    };

    //---------------------------------------------------------------------------
    // Helper: close main modal & reset fields
    //---------------------------------------------------------------------------
    const handleClose = () => {
        onClose();
        resetFields();
    };

    const resetFields = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setTitle('');
        setLocationId('');
        setSelectedRoles([]);
        setError(null);
        setPhoneNumberError('');
    };

    //---------------------------------------------------------------------------
    // Submodal close
    //---------------------------------------------------------------------------
    const handleCloseRoleModal = () => {
        setShowRoleModal(false);
        setNewRole({ role: '' });
    };

    //---------------------------------------------------------------------------
    // RENDER
    //---------------------------------------------------------------------------
    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle || "Add Contact"}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        {/* First Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter First Name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Last Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Last Name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {/* Phone Number */}
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Phone Number"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                isInvalid={!!phoneNumberError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Title */}
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Location (only if showLocationField) */}
                        {showLocationField && (
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Select
                                    options={locations}
                                    value={locations.find(l => l.value === locationId)}
                                    onChange={opt => setLocationId(opt?.value || '')}
                                    placeholder="Select a location"
                                />
                            </Form.Group>
                        )}

                        {/* Roles */}
                        <Form.Group className="mb-3">
                            <Form.Label>Roles</Form.Label>{' '}
                            <Button variant="link" onClick={() => setShowRoleModal(true)}>
                                Add New
                            </Button>
                            <Select
                                isMulti
                                options={roles}
                                value={selectedRoles}
                                onChange={setSelectedRoles}
                                placeholder="Select roles"
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Contact'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Submodal for "Add New Role" */}
            <Modal show={showRoleModal} onHide={handleCloseRoleModal}>
                <Form onSubmit={handleAddRole}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Role</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Role Name"
                                value={newRole.role}
                                onChange={e => setNewRole({ role: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleCloseRoleModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingRole}>
                            {isSubmittingRole ? 'Adding...' : 'Add Role'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default AddClientWorker;
