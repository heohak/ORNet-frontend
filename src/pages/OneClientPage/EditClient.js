// EditClient.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Alert, ListGroup, Row, Col, Modal, Badge } from 'react-bootstrap';
import config from '../../config/config';
import AddThirdPartyITModal from "./AddThirdPartyITModal";
import AddLocationModal from "./AddLocationModal";
import AsyncSelect from "react-select/async";
import AddTechnicalInfoModal from "./AddTechnicalInfoModal";
import AddClientWorker from "./AddClientWorker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {format} from "date-fns";
import '../../css/DarkenedModal.css';


function EditClient({ clientId, onClose, onSave, setRefresh }) {
    const [clientData, setClientData] = useState({
        fullName: '',
        shortName: '',
        pathologyClient: false,
        surgeryClient: false,
        editorClient: false,
        otherMedicalDevices: false,
        lastMaintenance: null,
        nextMaintenance: null,
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
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [error, setError] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const errorRef = useRef(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showModal, setShowModal] = useState(true);
    const [assignedSoftwares, setAssignedSoftwares] = useState([]);
    const [allSoftwares, setAllSoftwares] = useState([]);
    const [showAddSoftwareModal, setShowAddSoftwareModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]); // State for all contacts
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [clientContacts, setClientContacts] = useState([]);


    const fetchAllContacts = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/all`);
            setAllContacts(response.data);
        } catch (error) {
            setError(error.message);
        }
    };


    const fetchAllSoftwares = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/software/all`);
            setAllSoftwares(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

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

            const softwareResponse = await axios.get(`${config.API_BASE_URL}/software/client/${clientId}`);
            const softwares = softwareResponse.data;

            const contactResponse = await axios.get(`${config.API_BASE_URL}/worker/${clientId}`);
            const contacts = contactResponse.data;

            const lastMaintenanceDate = client.lastMaintenance ? new Date(client.lastMaintenance) : null;
            const nextMaintenanceDate = client.nextMaintenance ? new Date(client.nextMaintenance) : null;

            setClientData({
                ...client,
                contacts,
                locations,
                thirdPartyITs,
                lastMaintenance: lastMaintenanceDate,
                nextMaintenance: nextMaintenanceDate,
            });
            setAssignedSoftwares(softwares);
            setClientContacts(contacts);
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
        fetchAllContacts();
        fetchAllSoftwares();
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
    const handleAddLocation = (addedLocation) => {
        setAllLocations(prevLocations => [...prevLocations, addedLocation]);
        setClientData(prevData => ({
            ...prevData,
            locations: [...prevData.locations, addedLocation],
            locationIds: [...prevData.locationIds, addedLocation.id],
        }));
    };
    const handleSoftwareAdd = async (e) => {
        const softwareId = parseInt(e.target.value);
        const softwareToAdd = allSoftwares.find((sw) => sw.id === softwareId);

        try {
            await axios.put(`${config.API_BASE_URL}/software/add/client/${softwareId}/${clientId}`);

            // Update assignedSoftwares state
            setAssignedSoftwares((prevSoftwares) => [...prevSoftwares, softwareToAdd]);

            // Trigger refresh to update availableSoftwares
            setRefresh((prev) => !prev);
        } catch (error) {
            setError('Failed to assign Technical Information.');
            console.error('Error assigning software:', error);
        }
    };


    const handleUnassignSoftware = async (softwareId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/software/remove/${softwareId}`);

            // Update assignedSoftwares state
            setAssignedSoftwares((prevSoftwares) =>
                prevSoftwares.filter((software) => software.id !== softwareId)
            );

            // Trigger refresh to update availableSoftwares
            setRefresh((prev) => !prev);
        } catch (error) {
            setError('Failed to unassign Technical Information.');
            console.error('Error unassigning software:', error);
        }
    };

    const handleContactAdd = async (e) => {
        const contactId = parseInt(e.target.value);
        const contactToAdd = allContacts.find((contact) => contact.id === contactId);

        try {
            await axios.put(`${config.API_BASE_URL}/worker/${contactId}/${clientId}`); // Assign contact to client

            setClientContacts((prevContacts) => [...prevContacts, contactToAdd]);
            setRefresh((prev) => !prev);
        } catch (error) {
            setError('Failed to add contact.');
            console.error('Error adding contact:', error);
        }
    };


    const handleContactRemove = async (contactId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/worker/remove/${contactId}/${clientId}`);

            setClientContacts((prevContacts) =>
                prevContacts.filter((contact) => contact.id !== contactId)
            );
        } catch (error) {
            setError('Failed to remove contact.');
            console.error('Error removing contact:', error);
        }
    };



    const handleNewContact = (newWorker) => {
        setClientContacts((prevContacts) => [...prevContacts, newWorker]);
        setRefresh((prev) => !prev);
    };




    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date();

        if (clientData.lastMaintenance && clientData.lastMaintenance > today) {
            setError('Last Maintenance date cannot be in the future.');
            return;
        }

        if (
            clientData.lastMaintenance &&
            clientData.nextMaintenance &&
            clientData.nextMaintenance < clientData.lastMaintenance
        ) {
            setError('Next Maintenance date cannot be before the Last Maintenance date.');
            return;
        }
        try {
            const updatedClientData = {
                ...clientData,
                lastMaintenance: clientData.lastMaintenance ? format(clientData.lastMaintenance, 'yyyy-MM-dd') : null,
                nextMaintenance: clientData.nextMaintenance ? format(clientData.nextMaintenance, 'yyyy-MM-dd') : null,
                locations: undefined,
                thirdPartyITs: undefined,
            };

            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, updatedClientData);


            const updatedClientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            const updatedClient = updatedClientResponse.data;

            if (onSave) {
                onSave(updatedClient);
            }

            // Optionally, trigger a refresh
            if (setRefresh) {
                setRefresh((prev) => !prev);
            }

            if (onClose) {
                onClose();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const availableContacts = allContacts.filter(
        (contact) => !clientContacts.some((clientContact) => clientContact.id === contact.id)
    );

    const availableSoftwares = allSoftwares.filter(
        (software) => !assignedSoftwares.some((assignedSoftware) => assignedSoftware.id === software.id)
    );

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
        <Modal
            show={showModal}
            onHide={handleClose}
            size="xl"
            backdrop="static"
            keyboard={false}
            dialogClassName={showThirdPartyITModal || showAddContactModal || showLocationModal || showAddSoftwareModal ? "dimmed" : ""}
        >
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
                        {/* Left Column (col-md-8) */}
                        <Col md={8}>
                            {/* Full Name */}
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

                            {/* Locations */}
                            <Form.Group className="mb-3">
                                <Row className="mb-2" style={{height: "24px"}}>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">Locations</Form.Label>
                                    </Col>
                                    <Col className="col-md-auto">
                                        <Button
                                            className="px-0 py-0"
                                            variant="link"
                                            onClick={() => setShowLocationModal(true)}
                                        >
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
                                <Form.Select onChange={handleLocationAdd} value="">
                                    <option value="" disabled>Select Location</option>
                                    {availableLocations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Technical Information */}
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">Technical Information</Form.Label>
                                    </Col>
                                    <Col className="col-md-auto px-0 py-0">
                                        <Button variant="link" onClick={() => setShowAddSoftwareModal(true)}>
                                            Add New Technical Information
                                        </Button>
                                    </Col>
                                </Row>
                                {assignedSoftwares.length > 0 ? (
                                    <ListGroup className="mb-2">
                                        {assignedSoftwares.map((software) => (
                                            <ListGroup.Item key={software.id}>
                                                <Row className="align-items-center">
                                                    <Col>{software.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => handleUnassignSoftware(software.id)}
                                                            style={{ color: 'grey' }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <p>No Technical Information assigned.</p>
                                )}
                                <Form.Select onChange={handleSoftwareAdd} value="">
                                    <option value="" disabled>
                                        Select Technical Information
                                    </option>
                                    {availableSoftwares.map((software) => (
                                        <option key={software.id} value={software.id}>
                                            {software.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Right Column (col-md-4) */}
                        <Col md={4}>
                            {/* Short Name */}
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

                            {/* Country */}
                            <Form.Group className="mb-3">
                                <Row className="mb-2">
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">Country</Form.Label>
                                    </Col>
                                </Row>
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

                            {/* Contacts */}
                            <Form.Group className="mb-3">
                                <Row className="mb-3" style={{height: "24px"}}>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">Contacts</Form.Label>
                                    </Col>
                                    <Col className="col-md-auto">
                                        <Button
                                            variant="link"
                                            onClick={() => setShowAddContactModal(true)}
                                            className="px-0 py-0"
                                        >
                                            Add New Contact
                                        </Button>
                                    </Col>
                                </Row>
                                {clientContacts.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {clientContacts.map((contact) => (
                                            <ListGroup.Item key={contact.id}>
                                                <Row className="align-items-center">
                                                    <Col>{`${contact.firstName} ${contact.lastName}`}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => handleContactRemove(contact.id)}
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
                                <Form.Select onChange={handleContactAdd} value="">
                                    <option value="" disabled>
                                        Select Contact
                                    </option>
                                    {availableContacts.map((contact) => (
                                        <option key={contact.id} value={contact.id}>
                                            {`${contact.firstName} ${contact.lastName}`}
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
                                <ReactDatePicker
                                    selected={clientData.lastMaintenance}
                                    onChange={(date) => setClientData({ ...clientData, lastMaintenance: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select Last Maintenance Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Form.Group>

                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Next Maintenance</Form.Label>
                                <ReactDatePicker
                                    selected={clientData.nextMaintenance}
                                    onChange={(date) => setClientData({ ...clientData, nextMaintenance: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select Next Maintenance Date"
                                    minDate={clientData.lastMaintenance || new Date()}
                                    isClearable
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

            {/* Use AddLocationModal */}
            <AddLocationModal
                show={showLocationModal}
                onHide={() => setShowLocationModal(false)}
                onAddLocation={handleAddLocation}
            />

            {/* Third Party IT Modal */}
            <AddThirdPartyITModal
                show={showThirdPartyITModal}
                onHide={() => setShowThirdPartyITModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />

            {/* Add Technical Information Modal */}
            <AddTechnicalInfoModal
                show={showAddSoftwareModal}
                onHide={() => setShowAddSoftwareModal(false)}
                onAddTechnicalInfo={() => {
                    setRefresh((prev) => !prev); // Use the prop 'setRefresh' to trigger refresh in parent
                    setShowAddSoftwareModal(false);
                    fetchClientData(); // Fetch updated client data
                }}
                clientId={clientId}
            />

            {/* AddClientWorker Modal */}
            <AddClientWorker
                show={showAddContactModal}
                onClose={() => setShowAddContactModal(false)}
                clientId={clientId}
                onSuccess={handleNewContact}
            />



        </Modal>
    );
}

export default EditClient;
