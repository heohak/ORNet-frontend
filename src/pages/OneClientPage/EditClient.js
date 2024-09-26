import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {Container, Form, Button, Alert, ListGroup, Row, Col, Modal} from 'react-bootstrap';
import config from '../../config/config';
import { validatePhoneAndPostalCode } from '../../utils/Validation';

function EditClient() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState({
        fullName: '',
        shortName: '',
        pathologyClient: false,
        surgeryClient: false,
        editorClient: false,
        otherMedicalInformation: '',
        lastMaintenance: '',
        nextMaintenance: '',
        locationIds: [],
        locations: [], // This will store location objects
    });
    const [newLocation, setNewLocation] = useState({
        name: '',
        city: '',
        country: '',
        district: '',
        postalCode: '',
        streetAddress: '',
        phone: ''
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [error, setError] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');
    const errorRef = useRef(null);

    useEffect(() => {

        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        const fetchClientData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
                const client = response.data;

                // Fetch the location details for the locationIds
                const locationResponses = await Promise.all(
                    client.locationIds.map(id => axios.get(`${config.API_BASE_URL}/location/${id}`))
                );

                const locations = locationResponses.map(res => res.data);

                setClientData({ ...client, locations });
            } catch (error) {
                setError(error.message);
            }
        };



        fetchClientData();
        fetchLocations();
    }, [clientId, error]);

    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/location/all`);
            setAllLocations(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClientData({
            ...clientData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleLocationAdd = (e) => {
        const locationId = e.target.value;
        const locationToAdd = allLocations.find((loc) => loc.id === parseInt(locationId));

        setClientData({
            ...clientData,
            locations: [...clientData.locations, locationToAdd],
            locationIds: [...clientData.locationIds, locationToAdd.id],
        });
    };

    const handleLocationRemove = (locationId) => {
        setClientData({
            ...clientData,
            locations: clientData.locations.filter((loc) => loc.id !== locationId),
            locationIds: clientData.locationIds.filter((id) => id !== locationId),
        });
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        const { name, city, country, district, postalCode, streetAddress, phone } = newLocation;
        const isValid = validatePhoneAndPostalCode(
            phone,
            postalCode,
            setPhoneNumberError,
            setPostalCodeError,
            () => setNewLocation({ ...newLocation, phone }),
            () => setNewLocation({ ...newLocation, postalCode })
        );


        if (isValid) {
            const combinedAddress = `${streetAddress}, ${district}, ${city}, ${postalCode}, ${country}`;

            try {
                const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                    name,
                    address: combinedAddress,
                    phone,
                });

                const addedLocation = response.data;
                setAllLocations(prevLocations => [...prevLocations, addedLocation]);
                await fetchLocations(); // Silent refresh
                setShowLocationModal(false);
                setNewLocation({  // After adding make the fields empty again
                    name: '',
                    city: '',
                    country: '',
                    district: '',
                    postalCode: '',
                    streetAddress: '',
                    phone: ''
                });
            } catch (error) {
                setError('Error adding location.');
                console.error('Error adding location:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];

        // Ensure Last Maintenance is not in the future
        if (new Date(clientData.lastMaintenance) > new Date(today)) {
            setError('Last Maintenance date cannot be in the future.');
            return;
        }

        // Ensure Next Maintenance is after Last Maintenance
        if (new Date(clientData.nextMaintenance) < new Date(clientData.lastMaintenance)) {
            setError('Next Maintenance date cannot be before the Last Maintenance date.');
            return;
        }
        try {
            // Submit only the locationIds, not the full location objects
            const updatedClientData = {
                ...clientData,
                locations: undefined, // Remove locations array to avoid sending it
            };

            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, updatedClientData);
            navigate(`/customer/${clientId}`); // Redirect to the client details page
        } catch (error) {
            setError(error.message);
        }
    };

    // Filter out already added locations from the dropdown list
    const availableLocations = allLocations.filter(
        (loc) => !clientData.locations.some((clientLoc) => clientLoc.id === loc.id)
    );



    return (
        <Container className="mt-5">
            <h1>Edit Customer</h1>
            {error && (
                <Alert ref={errorRef} variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="fullName"
                        value={clientData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Short Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="shortName"
                        value={clientData.shortName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Pathology Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="pathologyClient"
                        checked={clientData.pathologyClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="surgeryClient"
                        checked={clientData.surgeryClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="editorClient"
                        checked={clientData.editorClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Other Medical Information</Form.Label>
                    <Form.Control
                        type="text"
                        name="otherMedicalInformation"
                        value={clientData.otherMedicalInformation}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="lastMaintenance"
                        value={clientData.lastMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Next Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="nextMaintenance"
                        value={clientData.nextMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <ListGroup>
                        {clientData.locations.map((location) => (
                            <ListGroup.Item key={location.id}>
                                <Row>
                                    <Col>{location.name}</Col>
                                    <Col xs="auto">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleLocationRemove(location.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Form.Select
                        className="mt-3"
                        onChange={handleLocationAdd}
                        value="" // Ensure the dropdown resets to the default option after selection
                    >
                        <option value="" disabled>Select Location</option>
                        {availableLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                        Can't find the location? <Button variant="link" onClick={() => setShowLocationModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit">Save Changes</Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(`/client/${clientId}`)}>Cancel</Button>
            </Form>
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Location</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLocation}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Location Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.name}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.city}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.country}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, country: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>District</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.district}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, district: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.postalCode}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, postalCode: e.target.value }))}
                                required
                                isInvalid={!!postalCodeError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {postalCodeError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.streetAddress}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, streetAddress: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.phone}
                                onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                                required
                                isInvalid={!!phoneNumberError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                        <Button variant="primary" type='submit'>Add Location</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default EditClient;
