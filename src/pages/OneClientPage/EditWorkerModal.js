import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import Select from 'react-select';
import axiosInstance from "../../config/axiosInstance";

function EditWorkerModal({ show, handleClose, worker, onUpdateSuccess, roles, clientId }) {
    const [editingWorker, setEditingWorker] = useState(worker || {});
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState('');

    useEffect(() => {
        if (worker) {
            setEditingWorker(worker);
            setSelectedRoles(worker.roleIds.map(roleId => roles.find(role => role.value === roleId)));
            setSelectedLocation(locations.find(location => location.value === worker.locationId));
        }
    }, [worker, roles, locations]);

    useEffect(() => {
        fetchRoles();
        fetchLocations();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/classificator/all`);
            const fetchedRoles = response.data.map(role => ({ value: role.id, label: role.role }));
            setAvailableRoles(fetchedRoles);
            setSelectedRoles(worker.roleIds.map(roleId => fetchedRoles.find(role => role.value === roleId)));
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
            const fetchedLocations = response.data.map(location => ({ value: location.id, label: location.name }));
            setLocations(fetchedLocations);
            setSelectedLocation(fetchedLocations.find(location => location.value === worker.locationId));
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleUpdateWorker = async (e) => {
        e.preventDefault();
        const trimmedPhoneNumber = editingWorker.phoneNumber.trim();

        // Check if the phone number contains only digits and allowed characters
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return false;
        }

        // Reset the error message if validation passes
        setPhoneNumberError('');
        setEditingWorker({ ...editingWorker, phoneNumber: trimmedPhoneNumber });

        try {
            const updatedWorker = {
                ...editingWorker,
                roleIds: selectedRoles.map(role => role.value),
                locationId: selectedLocation ? selectedLocation.value : null,
            };

            await axiosInstance.put(`${config.API_BASE_URL}/worker/update/${editingWorker.id}`, updatedWorker);
            onUpdateSuccess();
            handleClose();
        } catch (error) {
            console.error('Error updating worker:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Contact Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleUpdateWorker}>
                    {editingWorker && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={editingWorker.firstName}
                                    onChange={(e) => setEditingWorker({ ...editingWorker, firstName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={editingWorker.lastName}
                                    onChange={(e) => setEditingWorker({ ...editingWorker, lastName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    value={editingWorker.email}
                                    onChange={(e) => setEditingWorker({ ...editingWorker, email: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={editingWorker.phoneNumber}
                                    onChange={(e) => setEditingWorker({ ...editingWorker, phoneNumber: e.target.value })}
                                    isInvalid={!!phoneNumberError}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {phoneNumberError}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={editingWorker.title}
                                    onChange={(e) => setEditingWorker({ ...editingWorker, title: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Roles</Form.Label>
                                <Select
                                    isMulti
                                    options={availableRoles}
                                    value={selectedRoles}
                                    onChange={setSelectedRoles}
                                    placeholder="Select roles"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Select
                                    options={locations}
                                    value={selectedLocation}
                                    onChange={setSelectedLocation}
                                    placeholder="Select location"
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" className="me-2" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdateWorker}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>

    );
}

export default EditWorkerModal;
