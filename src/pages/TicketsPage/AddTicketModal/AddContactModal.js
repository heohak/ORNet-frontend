import React, {useEffect, useState} from 'react';
import {Modal, Button, Form, Alert} from 'react-bootstrap';
import axios from 'axios';
import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";
import Select from "react-select";

const AddContactModal = ({ show, handleClose, onAdd, locations, clientId, selectedLocation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [locationId, setLocationId] = useState('');
    const [title, setTitle] = useState('');
    const [newRole, setNewRole] = useState({ role: '' });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);





    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesResponse = await axiosInstance.get(`${config.API_BASE_URL}/worker/classificator/all`);
                setRoles(rolesResponse.data.map(role => ({ value: role.id, label: role.role })));
            } catch (error) {
                console.error("Error fetching roles: ", error);
            }
        };

        fetchRoles();
    }, []);

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/worker/add`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                locationId: selectedLocation,
                title
            });

            if (response.data && response.data.token) {
                const workerId = response.data.token;

                for (const role of selectedRoles) {
                    await axiosInstance.put(`${config.API_BASE_URL}/worker/role/${workerId}/${role.value}`);
                }
            }

                onAdd();
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhoneNumber('');
                setLocationId('');
                setTitle('');
                setSelectedRoles([]);
                setNewRole('');
                handleClose();
            } catch (error) {
                console.error('Error adding new contact:', error);
            } finally {
                setIsSubmitting(false)
            }
        }


    const handleAddRole = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const { role } = newRole;

        if (!role.trim()) {
            setError('Please enter a role name.');
            return;
        }

        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/worker/classificator/add`, {
                role,
            });

            const addedRole = response.data;
            const newRoleOption = { value: addedRole.id, label: role };

            setRoles(prevRoles => [...prevRoles, newRoleOption]);
            setSelectedRoles(prevSelected => [...prevSelected, newRoleOption]);
            setNewRole({ role: '' });
            setShowRoleModal(false);
            setError(null);
        } catch (error) {
            setError('Error adding role.');
            console.error('Error adding role:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Modal backdrop="static" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Contact</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddContact}>
                    <Modal.Body>
                        <Form.Group controlId="firstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="lastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}

                            />
                        </Form.Group>
                        <Form.Group controlId="phoneNumber">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="locationId">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedLocation ? selectedLocation : ""}
                                onChange={(e) => setLocationId(e.target.value)}
                                disabled
                            >
                                <option value="">Select Location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={isSubmitting}
                                type="submit">
                            {isSubmitting ? 'Adding...' : 'Add Contact'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            {/* Modal for adding a new role */}
            <Modal backdrop="static" show={showRoleModal} onHide={() => setShowRoleModal(false)}>
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
                                value={newRole.role}
                                onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                        <Button variant="primary" disabled={isSubmitting}
                                type="submit">
                            {isSubmitting ? 'Adding...' : 'Add Role'}
                        </Button>
                    </Modal.Footer>


                </Form>
            </Modal>
        </>
    );
};

export default AddContactModal;
