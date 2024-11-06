import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import config from "../../config/config";

function AddContactModal({ show, handleClose, onSave, locationOptions }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState({ role: '' });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [phoneNumberError, setPhoneNumberError] = useState('');

    const [error, setError] = useState(null);

    // Fetch roles when the component mounts
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
                setRoles(rolesResponse.data.map(role => ({ value: role.id, label: role.role })));
            } catch (error) {
                setError('Error fetching roles');
            }
        };

        fetchRoles();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Phone number validation
        const trimmedPhoneNumber = phoneNumber.trim();
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return;
        }
        setPhoneNumberError('');

        if (!firstName || !lastName || !email || !phoneNumber || !title || !selectedLocation || selectedRoles.length === 0) {
            setError('Please fill in all fields.');
            return;
        }

        setError(null);

        const newContact = {
            firstName,
            lastName,
            email,
            phoneNumber,
            title,
            locationId: selectedLocation.value,
            roles: selectedRoles.map(role => ({ id: role.value, role: role.label })),
        };

        onSave(newContact);
        handleClose();

        // Reset form fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setTitle('');
        setSelectedLocation(null);
        setSelectedRoles([]);
    };

    const handleAddRole = async () => {
        const { role } = newRole;

        if (!role.trim()) {
            setError('Please enter a role name.');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/worker/classificator/add`, {
                role,
            });

            const addedRole = response.data;
            const newRoleOption = { value: addedRole.id, label: role };

            setRoles(prevRoles => [...prevRoles, newRoleOption]);
            setSelectedRoles(prevSelected => [...prevSelected, newRoleOption]);
            setNewRole({ role: '' });
            setShowRoleModal(false);
        } catch (error) {
            setError('Error adding role.');
            console.error('Error adding role:', error);
        }
    };


    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        {/* First Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {/* Last Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {/* Phone Number */}
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {/* Location */}
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Select
                                options={locationOptions}
                                value={selectedLocation}
                                onChange={setSelectedLocation}
                                placeholder="Select a location"
                                isClearable
                                required
                            />
                        </Form.Group>

                        {/* Roles */}
                        <Form.Group className="mb-3">
                            <Form.Label>Roles</Form.Label>
                            <Select
                                isMulti
                                options={roles}
                                value={selectedRoles}
                                onChange={setSelectedRoles}
                                placeholder="Select roles"
                            />
                            <Form.Text className="text-muted">
                                Can't find the role?{' '}
                                <Button variant="link" onClick={() => setShowRoleModal(true)}>Add New</Button>
                            </Form.Text>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Add Contact
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for adding a new role */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                value={newRole.role}
                                onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddRole}>Add Role</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddContactModal;
