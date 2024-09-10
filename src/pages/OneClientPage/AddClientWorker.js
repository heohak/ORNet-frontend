import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";

function AddClientWorker({ clientId, onClose, onSuccess }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [error, setError] = useState(null);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', country: '', district: '', postalCode: '', streetAddress: '', city: '', phone: '' });

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState({ role: '' });
    const [phoneNumberError, setPhoneNumberError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationsResponse, rolesResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/worker/classificator/all`)
                ]);
                setLocations(locationsResponse.data.map(loc => ({ value: loc.id, label: loc.name })));
                setRoles(rolesResponse.data.map(role => ({ value: role.id, label: role.role })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const trimmedPhoneNumber = phoneNumber.trim();
        // Check if the phone number contains only digits
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return;
        }
        // Reset the error message if validation passes
        setPhoneNumberError('');
        setPhoneNumber(trimmedPhoneNumber);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/worker/add`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
                locationId,
            });

            if (response.data && response.data.token) {
                const workerId = response.data.token;

                await axios.put(`${config.API_BASE_URL}/worker/${workerId}/${clientId}`);

                for (const role of selectedRoles) {
                    await axios.put(`${config.API_BASE_URL}/worker/role/${workerId}/${role.value}`);
                }

                const newWorker = {
                    id: workerId,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    title,
                    location: locations.find(loc => loc.value === locationId),
                    locationId: locationId,
                    roles: selectedRoles.map(role => role.label),
                    roleIds: selectedRoles.map(role => role.value)
                };

                onSuccess(newWorker); // Call the onSuccess function with the new worker data
            }

            onClose(); // Close the modal after adding the worker
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddLocation = async () => {
        const { name, country, district, postalCode, streetAddress, city, phone } = newLocation;

        if (!name.trim() || !country.trim() || !district.trim() || !postalCode.trim() || !streetAddress.trim() || !city.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new location.');
            return;
        }

        const combinedAddress = `${streetAddress}, ${city}, ${district}, ${postalCode}, ${country}`;

        try {
            const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address: combinedAddress,
                phone,
            });

            const addedLocation = response.data;
            const newLocationOption = { value: addedLocation.id, label: addedLocation.name };
            setLocations(prevLocations => [...prevLocations, newLocationOption]);
            setLocationId(newLocationOption.value); // Automatically select the new location
            setNewLocation({ name: '', country: '', district: '', postalCode: '', streetAddress: '', city: '', phone: '' });
            setShowLocationModal(false);
        } catch (error) {
            setError('Error adding location.');
        }
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
            const id = parseInt(addedRole.token);  // Backend returns the id of a role as a string
            const newRoleOption = { value: id, label: role };
            console.log(newRoleOption);

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
        <Container>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        isInvalid={!!phoneNumberError} // Display error styling if there's an error
                    />
                    <Form.Control.Feedback type="invalid">
                        {phoneNumberError}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Select
                        options={locations}
                        value={locations.find(loc => loc.value === locationId)}
                        onChange={selectedOption => setLocationId(selectedOption.value)}
                    />
                    <Form.Text className="text-muted">
                        Can't find the location? <Button variant="link" onClick={() => setShowLocationModal(true)}>Add New</Button>
                    </Form.Text>
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
                        Can't find the role? <Button variant="link" onClick={() => setShowRoleModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Worker
                </Button>
            </Form>

            {/* Modal for adding a new location */}
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.country}
                            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.city}
                            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>District</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.district}
                            onChange={(e) => setNewLocation({ ...newLocation, district: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.postalCode}
                            onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.streetAddress}
                            onChange={(e) => setNewLocation({ ...newLocation, streetAddress: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.phone}
                            onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddLocation}>Add Location</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding a new role */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddRole}>Add Role</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AddClientWorker;
