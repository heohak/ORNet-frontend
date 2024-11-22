// EditClient.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Alert, ListGroup, Row, Col, Modal, Badge } from 'react-bootstrap';
import config from '../../config/config';
import { validatePhoneAndPostalCode } from '../../utils/Validation';
import AddThirdPartyITModal from "./AddThirdPartyITModal";
import AsyncSelect from "react-select/async";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

function EditClient({ clientId, onClose, onSave }) {
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
        locations: [],
        thirdPartyIds: [],
        thirdPartyITs: [],
        country: '',
        prospect: false,
        agreement: false,
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

    const [showModal, setShowModal] = useState(true);

    // Fetch client data
    const fetchClientData = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            const client = response.data;

            // Fetch locations
            const locationResponses = await Promise.all(
                client.locationIds.map(id => axios.get(`${config.API_BASE_URL}/location/${id}`))
            );
            const locations = locationResponses.map(res => res.data);

            // Fetch third-party ITs
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
        fetchAllThirdPartyITs();
    }, [clientId]);

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
            const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
            setAllThirdPartyITs(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    // Handlers for adding/removing third-party ITs
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

    // Handlers for adding/removing locations
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

    // Handler for adding a new location
    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (isSubmittingLocation) return;
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
            setIsSubmittingLocation(false);
            return;
        }

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
            await fetchLocations();
            setShowLocationModal(false);
            setNewLocation({
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
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];

        if (new Date(clientData.lastMaintenance) > new Date(today)) {
            setError('Last Maintenance date cannot be in the future.');
            return;
        }

        if (new Date(clientData.nextMaintenance) < new Date(clientData.lastMaintenance)) {
            setError('Next Maintenance date cannot be before the Last Maintenance date.');
            return;
        }
        try {
            const updatedClientData = {
                ...clientData,
                locations: undefined,
                thirdPartyITs: undefined,
            };

            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, updatedClientData);

            const updatedClientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            const updatedClient = updatedClientResponse.data;

            if (onSave) {
                onSave(updatedClient);
            }

            if (onClose) {
                onClose();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Available options
    const availableLocations = allLocations.filter(
        (loc) => !clientData.locations.some((clientLoc) => clientLoc.id === loc.id)
    );

    const availableThirdPartyITs = allThirdPartyITs.filter(
        (it) => !clientData.thirdPartyITs.some((clientIt) => clientIt.id === it.id)
    );

    // Close modal handler
    const handleClose = () => {
        setShowModal(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal show={showModal} onHide={handleClose} size="xl" backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="w-100 text-center">Edit Customer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert ref={errorRef} variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    {/* Row 1: Full Name and Short Name */}
                    <Row>
                        <Col md={8}>
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
                        </Col>
                        <Col>
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
                        </Col>
                    </Row>

                    {/* Row 2: Locations and Country */}
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">
                                            Locations
                                        </Form.Label>
                                    </Col>
                                    <Col className="col-md-auto px-0 py-0">
                                        <Button variant="link" onClick={() => setShowLocationModal(true)}>
                                            Add New Location
                                        </Button>
                                    </Col>
                                </Row>
                                {clientData.locations.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {clientData.locations.map((location) => (
                                            <ListGroup.Item key={location.id}>
                                                <Row className="align-items-center">
                                                    <Col>{location.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => handleLocationRemove(location.id)}
                                                            style={{ color: 'grey' }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>


                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                <Form.Select
                                    onChange={handleLocationAdd}
                                    value=""
                                >
                                    <option value="" disabled>Select Location</option>
                                    {availableLocations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
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
                        </Col>
                    </Row>

                    {/* Third Party ITs */}
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">
                                            Third Party ITs
                                        </Form.Label>
                                    </Col>
                                    <Col className="col-md-auto px-0 py-0">
                                        <Button variant="link" onClick={() => setShowThirdPartyITModal(true)}>
                                            Add New Third Party IT
                                        </Button>
                                    </Col>
                                </Row>
                                {clientData.thirdPartyITs.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {clientData.thirdPartyITs.map((thirdPartyIT) => (
                                            <ListGroup.Item key={thirdPartyIT.id}>
                                                <Row className="align-items-center">
                                                    <Col>{thirdPartyIT.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => handleThirdPartyITRemove(thirdPartyIT.id)}
                                                            style={{ color: 'grey' }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                <Form.Select
                                    onChange={handleThirdPartyITAdd}
                                    value=""
                                >
                                    <option value="" disabled>Select Third Party IT</option>
                                    {availableThirdPartyITs.map((it) => (
                                        <option key={it.id} value={it.id}>
                                            {it.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Customer Types: Header and Checkboxes on the Same Line */}
                    <Form.Group className="mb-3 d-flex align-items-center">
                        <Form.Label className="me-3 mb-0">Customer Types:</Form.Label>
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Pathology"
                            name="pathologyClient"
                            checked={clientData.pathologyClient}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Surgery"
                            name="surgeryClient"
                            checked={clientData.surgeryClient}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Editor"
                            name="editorClient"
                            checked={clientData.editorClient}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Other Medical Devices"
                            name="otherMedicalDevices"
                            checked={clientData.otherMedicalDevices}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Prospect"
                            name="prospect"
                            checked={clientData.prospect}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            inline
                            type="checkbox"
                            label="Agreement"
                            name="agreement"
                            checked={clientData.agreement}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    {/* Maintenance Dates */}
                    <Row>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Maintenance</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="lastMaintenance"
                                    value={clientData.lastMaintenance}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Next Maintenance</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="nextMaintenance"
                                    value={clientData.nextMaintenance}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" className="me-2" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>

            {/* Location Modal */}
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Location</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLocation}>
                    <Modal.Body>
                        {/* Location form fields (similar to your existing code) */}
                        {/* ... */}
                        {/* Form fields for adding a new location */}
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
                        {/* Other fields... */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingLocation}>
                            {isSubmittingLocation ? 'Adding...' : 'Add Location'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Third Party IT Modal */}
            <AddThirdPartyITModal
                show={showThirdPartyITModal}
                onHide={() => setShowThirdPartyITModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />
        </Modal>
    );
}

export default EditClient;
