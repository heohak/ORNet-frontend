import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {Container, Form, Button, Alert, ListGroup, Row, Col, Modal} from 'react-bootstrap';
import config from '../../config/config';
import { validatePhoneAndPostalCode } from '../../utils/Validation';
import AddThirdPartyITModal from "./AddThirdPartyITModal";
import AsyncSelect from "react-select/async";

function EditClient() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState({
        fullName: '',
        shortName: '',
        pathologyClient: false,
        surgeryClient: false,
        editorClient: false,
        otherMedicalDevices: false,
        lastMaintenance: '',
        nextMaintenance: '',
        locationIds: [],
        locations: [], // This will store location objects
        thirdPartyIds: [], // New state to store third party IT IDs
        thirdPartyITs: [] // To store third party IT objects
    });
    const [allThirdPartyITs, setAllThirdPartyITs] = useState([]);
    const [showThirdPartyITModal, setShowThirdPartyITModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        city: '',
        country: '',
        email: '',
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
    const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);




    const fetchClientData = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            const client = response.data;

            // Fetch the location details for the locationIds
            const locationResponses = await Promise.all(
                client.locationIds.map(id => axios.get(`${config.API_BASE_URL}/location/${id}`))
            );

            const locations = locationResponses.map(res => res.data);

            const thirdPartyResponses = await Promise.all(
                client.thirdPartyIds.map(id => axios.get(`${config.API_BASE_URL}/third-party/${id}`))
            );
            const thirdPartyITs = thirdPartyResponses.map(res => res.data);

            setClientData({ ...client, locations, thirdPartyITs });
        } catch (error) {
            setError(error.message);
        }
    };
    const loadCountryOptions = async (inputValue) => {
        try {
            const response = inputValue
                ? await axios.get(`https://restcountries.com/v3.1/name/${inputValue}`)
                : await axios.get('https://restcountries.com/v3.1/all');

            return response.data.map((country) => ({
                value: country.cca3,
                label: country.name.common,
            }));
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    };


    useEffect(() => {

        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth' });
        }


        fetchClientData();
        fetchLocations();
        fetchAllThirdPartyITs()
    }, [clientId, error]);

    // After fetching client data
    useEffect(() => {
        if (clientData.country) {
            loadCountryOptions('').then((options) => {
                const countryOption = options.find(option => option.value === clientData.country);
                setSelectedCountry(countryOption || null);
            });
        }
    }, [clientData.country]);

    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/location/all`);
            setAllLocations(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchAllThirdPartyITs = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/third-party/all`); // Example endpoint for all third-party ITs
            setAllThirdPartyITs(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleThirdPartyITAdd = (e) => {
        const thirdPartyITId = e.target.value;
        const thirdPartyITToAdd = allThirdPartyITs.find(it => it.id === parseInt(thirdPartyITId));

        setClientData({
            ...clientData,
            thirdPartyITs: [...clientData.thirdPartyITs, thirdPartyITToAdd],
            thirdPartyIds: [...clientData.thirdPartyIds, thirdPartyITToAdd.id],
        });
    };

    const handleThirdPartyITRemove = (thirdPartyITId) => {
        setClientData({
            ...clientData,
            thirdPartyITs: clientData.thirdPartyITs.filter(it => it.id !== thirdPartyITId),
            thirdPartyIds: clientData.thirdPartyIds.filter(id => id !== thirdPartyITId),
        });
    };
    const handleNewThirdPartyIT = (newThirdPartyIT) => {
        // Add the new third-party IT to the client's data
        setClientData(prevData => ({
            ...prevData,
            thirdPartyITs: [...prevData.thirdPartyITs, newThirdPartyIT],
            thirdPartyIds: [...prevData.thirdPartyIds, newThirdPartyIT.id],
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClientData({
            ...clientData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        setClientData({ ...clientData, country: selectedOption ? selectedOption.value : '' });
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
        if (isSubmittingLocation) return; // Prevent multiple submissions
        setIsSubmittingLocation(true);
        const { name, city, country, email, postalCode, streetAddress, phone } = newLocation;
        const isValid = validatePhoneAndPostalCode(
            phone,
            postalCode,
            setPhoneNumberError,
            setPostalCodeError,
            () => setNewLocation({ ...newLocation, phone }),
            () => setNewLocation({ ...newLocation, postalCode })
        );

        if (!isValid) {
            setIsSubmittingLocation(false); // Reset submitting state if validation fails
            return;
        }


        if (isValid) {

            try {
                const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                    name,
                    country,
                    city,
                    streetAddress,
                    postalCode,
                    phone,
                    email
                });

                const addedLocation = response.data;
                setAllLocations(prevLocations => [...prevLocations, addedLocation]);
                await fetchLocations(); // Silent refresh
                setShowLocationModal(false);
                setNewLocation({  // After adding make the fields empty again
                    name: '',
                    city: '',
                    country: '',
                    email: '',
                    postalCode: '',
                    streetAddress: '',
                    phone: ''
                });
            } catch (error) {
                setError('Error adding location.');
                console.error('Error adding location:', error);
            } finally {
                setIsSubmittingLocation(false);
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
                locations: undefined,
                thirdPartyITs: undefined,
                // Remove locations array to avoid sending it
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

    const availableThirdPartyITs = allThirdPartyITs.filter(
        (it) => !clientData.thirdPartyITs.some((clientIt) => clientIt.id === it.id)
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
                    <Form.Label>Pathology Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="pathologyClient"
                        checked={clientData.pathologyClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="surgeryClient"
                        checked={clientData.surgeryClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="editorClient"
                        checked={clientData.editorClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Other Medical Devices</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="otherMedicalDevices"
                        checked={clientData.otherMedicalDevices}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Prospect</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="prospect"
                        checked={clientData.prospect}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Agreement</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="agreement"
                        checked={clientData.agreement}
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
                    {clientData.locations.length > 0 &&
                        <ListGroup className="mb-2">
                            {clientData.locations.map((location) => (
                                <ListGroup.Item key={location.id}>
                                    <Row className="align-items-center">
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
                    }
                    <Form.Select
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

                <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadCountryOptions}
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        placeholder="Select a country..."
                        isClearable
                    />
                </Form.Group>


                {/* Third Party IT Management */}
                <Form.Group className="mb-3">
                    <Form.Label>Third Party ITs</Form.Label>
                    {clientData.thirdPartyITs.length > 0 &&
                        <ListGroup className="mb-2">
                            {clientData.thirdPartyITs.map((thirdPartyIT) => (
                                <ListGroup.Item key={thirdPartyIT.id}>
                                    <Row className="align-items-center">
                                        <Col>{thirdPartyIT.name}</Col>
                                        <Col xs="auto">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleThirdPartyITRemove(thirdPartyIT.id)}
                                            >
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    }
                    <Form.Select
                        onChange={handleThirdPartyITAdd}
                        value="" // Ensure the dropdown resets to the default option after selection
                    >
                        <option value="" disabled>Select Third Party IT</option>
                        {availableThirdPartyITs.map((it) => (
                            <option key={it.id} value={it.id}>
                                {it.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                        Can't find the third-party IT?{' '}
                        <Button variant="link" onClick={() => setShowThirdPartyITModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>

                <Button variant="success" type="submit">Save Changes</Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(`/customer/${clientId}`)}>Cancel</Button>
            </Form>


            {/* Location Modal */}
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Location</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLocation}>
                    <Modal.Body>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.name}
                                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCity" className="mt-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.city}
                                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                                placeholder="Enter city"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCountry" className="mt-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.country}
                                onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                                placeholder="Enter country"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newLocation.email}
                                onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPostalCode" className="mt-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.postalCode}
                                onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                placeholder="Enter postal code"
                                required
                                isInvalid={!!postalCodeError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {postalCodeError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formStreetAddress" className="mt-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.streetAddress}
                                onChange={(e) => setNewLocation({ ...newLocation, streetAddress: e.target.value })}
                                placeholder="Enter street address"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone" className="mt-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={newLocation.phone}
                                onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                                placeholder="Enter phone number"
                                isInvalid={!!phoneNumberError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingLocation}>
                            {isSubmittingLocation ? 'Adding...' : 'Add Location'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <AddThirdPartyITModal
                show={showThirdPartyITModal}
                onHide={() => setShowThirdPartyITModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />
        </Container>
    );
}

export default EditClient;
