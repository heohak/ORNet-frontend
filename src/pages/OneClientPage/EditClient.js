import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Alert, ListGroup, Row, Col, Modal } from 'react-bootstrap';
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
import ConfirmationModal from "./ConfirmationModal";

function EditClient({ clientId, onClose, onSave, setRefresh }) {
    const [originalClientData, setOriginalClientData] = useState(null);
    const [clientData, setClientData] = useState(null);
    const [allThirdPartyITs, setAllThirdPartyITs] = useState([]);
    const [showThirdPartyITModal, setShowThirdPartyITModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [error, setError] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const errorRef = useRef(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showModal, setShowModal] = useState(true);

    const [allSoftwares, setAllSoftwares] = useState([]);
    const [showAddSoftwareModal, setShowAddSoftwareModal] = useState(false);

    const [allContacts, setAllContacts] = useState([]);
    const [showAddContactModal, setShowAddContactModal] = useState(false);

    // Local arrays for edits:
    const [localContacts, setLocalContacts] = useState([]);
    const [localSoftwares, setLocalSoftwares] = useState([]);
    const [localThirdPartyITs, setLocalThirdPartyITs] = useState([]);
    const [localLocations, setLocalLocations] = useState([]);

    const [confirmation, setConfirmation] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
    });

    // Confirmation modal logic
    const openConfirmationModal = (type, item) => {
        let title = '';
        let message = '';
        let onConfirm = null;

        switch (type) {
            case 'location':
                title = 'Confirm Removal';
                message = `Are you sure you want to remove the location "${item.name}"?`;
                onConfirm = () => {
                    handleLocationRemove(item.id);
                    setConfirmation({ show: false, title: '', message: '', onConfirm: null });
                };
                break;
            case 'thirdPartyIT':
                title = 'Confirm Removal';
                message = `Are you sure you want to remove the Third-Party IT "${item.name}"?`;
                onConfirm = () => {
                    handleThirdPartyITRemove(item.id);
                    setConfirmation({ show: false, title: '', message: '', onConfirm: null });
                };
                break;
            case 'contact':
                title = 'Confirm Removal';
                message = `Are you sure you want to remove the contact "${item.firstName} ${item.lastName}"?`;
                onConfirm = () => {
                    handleContactRemove(item.id);
                    setConfirmation({ show: false, title: '', message: '', onConfirm: null });
                };
                break;
            case 'technicalInfo':
                title = 'Confirm Removal';
                message = `Are you sure you want to remove the Technical Information "${item.name}"?`;
                onConfirm = () => {
                    handleSoftwareRemove(item.id);
                    setConfirmation({ show: false, title: '', message: '', onConfirm: null });
                };
                break;
            default:
                break;
        }

        setConfirmation({
            show: true,
            title,
            message,
            onConfirm,
        });
    };

    const fetchAllContacts = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/not-used`);
            const sortedContacts = response.data.sort((a, b) => {
                const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setAllContacts(sortedContacts);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchAllSoftwares = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/software/not-used`);
            setAllSoftwares(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

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

            // Fetch assigned softwares
            const softwareResponse = await axios.get(`${config.API_BASE_URL}/software/client/${clientId}`);
            const softwares = softwareResponse.data;

            // Fetch contacts
            const contactResponse = await axios.get(`${config.API_BASE_URL}/worker/${clientId}`);
            const contacts = contactResponse.data;
            contacts.sort((a, b) => {
                const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });

            const lastMaintenanceDate = client.lastMaintenance ? new Date(client.lastMaintenance) : null;
            const nextMaintenanceDate = client.nextMaintenance ? new Date(client.nextMaintenance) : null;

            const updatedClientData = {
                ...client,
                contacts,
                locations,
                thirdPartyITs,
                lastMaintenance: lastMaintenanceDate,
                nextMaintenance: nextMaintenanceDate,
            };

            setOriginalClientData(updatedClientData);
            setClientData({ ...updatedClientData });

            // Initialize local arrays for editing
            setLocalContacts([...contacts]);
            setLocalSoftwares([...softwares]);
            setLocalThirdPartyITs([...thirdPartyITs]);
            setLocalLocations([...locations]);
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
        if (clientData?.country) {
            loadCountryOptions('').then((options) => {
                const countryOption = options.find(option => option.value === clientData.country);
                setSelectedCountry(countryOption || null);
            });
        }
    }, [clientData?.country]);

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

    // Locations
    const handleLocationAdd = (e) => {
        const locationId = parseInt(e.target.value);
        const locationToAdd = allLocations.find((loc) => loc.id === locationId);
        setLocalLocations((prev) => [...prev, locationToAdd]);
    };
    const initiateLocationRemove = (location) => {
        openConfirmationModal('location', location);
    };
    const handleLocationRemove = (locationId) => {
        setLocalLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    };
    const handleAddLocation = (addedLocation) => {
        setAllLocations(prevLocations => [...prevLocations, addedLocation]);
        setLocalLocations(prev => [...prev, addedLocation]);
    };

    // Third-Party IT
    const handleThirdPartyITAdd = (e) => {
        const thirdPartyITId = parseInt(e.target.value);
        const thirdPartyITToAdd = allThirdPartyITs.find(it => it.id === thirdPartyITId);
        setLocalThirdPartyITs((prev) => [...prev, thirdPartyITToAdd]);
    };
    const initiateThirdPartyITRemove = (thirdPartyIT) => {
        openConfirmationModal('thirdPartyIT', thirdPartyIT);
    };
    const handleThirdPartyITRemove = (thirdPartyITId) => {
        setLocalThirdPartyITs((prev) => prev.filter(it => it.id !== thirdPartyITId));
    };
    const handleNewThirdPartyIT = (newThirdPartyIT) => {
        setLocalThirdPartyITs((prev) => [...prev, newThirdPartyIT]);
    };

    // Contacts
    const handleContactAdd = (e) => {
        const contactId = parseInt(e.target.value);
        const contactToAdd = allContacts.find((contact) => contact.id === contactId);
        setLocalContacts((prev) => [...prev, contactToAdd]);
    };
    const initiateContactRemove = (contact) => {
        openConfirmationModal('contact', contact);
    };
    const handleContactRemove = (contactId) => {
        setLocalContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    };
    const handleNewContact = (newWorker) => {
        setLocalContacts((prev) => [...prev, newWorker]);
    };

    // Technical Information (Software)
    const handleSoftwareAdd = (e) => {
        const softwareId = parseInt(e.target.value);
        const softwareToAdd = allSoftwares.find((sw) => sw.id === softwareId);
        setLocalSoftwares((prev) => [...prev, softwareToAdd]);
    };
    const initiateUnassignSoftware = (software) => {
        openConfirmationModal('technicalInfo', software);
    };
    const handleSoftwareRemove = (softwareId) => {
        setLocalSoftwares((prev) => prev.filter((software) => software.id !== softwareId));
    };

    // On Save: Compare original and local states, send changes to server
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!originalClientData || !clientData) {
            return; // Data not loaded
        }

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
            // Determine which contacts were added or removed
            const originalContactIds = originalClientData.contacts.map(c => c.id);
            const localContactIds = localContacts.map(c => c.id);

            const addedContacts = localContactIds.filter(id => !originalContactIds.includes(id));
            const removedContacts = originalContactIds.filter(id => !localContactIds.includes(id));

            // Determine which softwares were added or removed
            const originalSoftwareIds = (await axios.get(`${config.API_BASE_URL}/software/client/${clientId}`)).data.map(s => s.id);
            const localSoftwareIds = localSoftwares.map(s => s.id);

            const addedSoftwares = localSoftwareIds.filter(id => !originalSoftwareIds.includes(id));
            const removedSoftwares = originalSoftwareIds.filter(id => !localSoftwareIds.includes(id));

            // Determine which Third-Party ITs were added or removed
            const originalThirdPartyITIds = originalClientData.thirdPartyITs.map(it => it.id);
            const localThirdPartyITIds = localThirdPartyITs.map(it => it.id);

            const addedThirdPartyITs = localThirdPartyITIds.filter(id => !originalThirdPartyITIds.includes(id));
            const removedThirdPartyITs = originalThirdPartyITIds.filter(id => !localThirdPartyITIds.includes(id));

            // Determine which locations were added or removed
            const originalLocationIds = originalClientData.locations.map(l => l.id);
            const localLocationIds = localLocations.map(l => l.id);

            const addedLocations = localLocationIds.filter(id => !originalLocationIds.includes(id));
            const removedLocations = originalLocationIds.filter(id => !localLocationIds.includes(id));

            // Persist changes:
            // 1. Contacts
            for (const contactId of addedContacts) {
                await axios.put(`${config.API_BASE_URL}/worker/${contactId}/${clientId}`);
            }
            for (const contactId of removedContacts) {
                await axios.put(`${config.API_BASE_URL}/worker/remove/${contactId}`);
            }

            // 2. Technical Information (Software)
            for (const swId of addedSoftwares) {
                await axios.put(`${config.API_BASE_URL}/software/add/client/${swId}/${clientId}`);
            }
            for (const swId of removedSoftwares) {
                await axios.put(`${config.API_BASE_URL}/software/remove/${swId}`);
            }

            // 3. Third-Party IT
            for (const itId of addedThirdPartyITs) {
                // Assume some endpoint to link IT to client
                await axios.put(`${config.API_BASE_URL}/third-party/add/${itId}/${clientId}`);
            }
            for (const itId of removedThirdPartyITs) {
                // Assume some endpoint to remove IT from client
                await axios.put(`${config.API_BASE_URL}/third-party/remove/${itId}/${clientId}`);
            }

            // 4. Locations
            for (const locId of addedLocations) {
                // Assume some endpoint to link location to client
                await axios.put(`${config.API_BASE_URL}/location/addToClient/${locId}/${clientId}`);
            }
            for (const locId of removedLocations) {
                // Assume some endpoint to remove location from client
                await axios.put(`${config.API_BASE_URL}/location/removeFromClient/${locId}/${clientId}`);
            }

            const updatedClientData = {
                ...clientData,
                locations: undefined,
                thirdPartyITs: undefined,
                contacts: undefined,
                lastMaintenance: clientData.lastMaintenance ? format(clientData.lastMaintenance, 'yyyy-MM-dd') : null,
                nextMaintenance: clientData.nextMaintenance ? format(clientData.nextMaintenance, 'yyyy-MM-dd') : null,
            };

            // Update the client itself
            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, updatedClientData);

            const updatedClientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            const updatedClient = updatedClientResponse.data;

            if (onSave) {
                onSave(updatedClient);
            }

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

    const handleClose = () => {
        setShowModal(false);
        if (onClose) {
            onClose();
        }
    };

    if (!clientData) {
        return null; // or a spinner
    }

    // Available options
    const availableContacts = allContacts.filter(
        (contact) => !localContacts.some((clientContact) => clientContact.id === contact.id)
    );
    const availableSoftwares = allSoftwares.filter(
        (software) => !localSoftwares.some((assignedSoftware) => assignedSoftware.id === software.id)
    );
    const availableLocations = allLocations.filter(
        (loc) => !localLocations.some((clientLoc) => clientLoc.id === loc.id)
    );
    const availableThirdPartyITs = allThirdPartyITs.filter(
        (it) => !localThirdPartyITs.some((clientIt) => clientIt.id === it.id)
    );

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
                                {localLocations.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {localLocations.map((location) => (
                                            <ListGroup.Item key={location.id}>
                                                <Row className="align-items-center">
                                                    <Col>{location.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => initiateLocationRemove(location)}
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
                                {localSoftwares.length > 0 ? (
                                    <ListGroup className="mb-2">
                                        {localSoftwares.map((software) => (
                                            <ListGroup.Item key={software.id}>
                                                <Row className="align-items-center">
                                                    <Col>{software.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => initiateUnassignSoftware(software)}
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

                            {/* Third-Party ITs */}
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col className="col-md-auto align-content-center">
                                        <Form.Label className="mb-0">Third-Party ITs</Form.Label>
                                    </Col>
                                    <Col className="col-md-auto px-0 py-0">
                                        <Button variant="link" onClick={() => setShowThirdPartyITModal(true)}>
                                            Add New Third-Party IT
                                        </Button>
                                    </Col>
                                </Row>
                                {localThirdPartyITs.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {localThirdPartyITs.map((it) => (
                                            <ListGroup.Item key={it.id}>
                                                <Row className="align-items-center">
                                                    <Col>{it.name}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => initiateThirdPartyITRemove(it)}
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
                                <Form.Select onChange={handleThirdPartyITAdd} value="">
                                    <option value="" disabled>Select Third-Party IT</option>
                                    {availableThirdPartyITs.map((it) => (
                                        <option key={it.id} value={it.id}>
                                            {it.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

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
                                <Form.Label className="mb-0">Country</Form.Label>
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
                                {localContacts.length > 0 && (
                                    <ListGroup className="mb-2">
                                        {localContacts.map((contact) => (
                                            <ListGroup.Item key={contact.id}>
                                                <Row className="align-items-center">
                                                    <Col>{`${contact.firstName} ${contact.lastName}`}</Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => initiateContactRemove(contact)}
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

                    {/* Customer Types */}
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

            <AddLocationModal
                show={showLocationModal}
                onHide={() => setShowLocationModal(false)}
                onAddLocation={handleAddLocation}
            />

            <AddThirdPartyITModal
                show={showThirdPartyITModal}
                onHide={() => setShowThirdPartyITModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />

            <AddTechnicalInfoModal
                show={showAddSoftwareModal}
                onHide={() => setShowAddSoftwareModal(false)}
                onAddTechnicalInfo={() => {
                    setRefresh((prev) => !prev);
                    setShowAddSoftwareModal(false);
                    // After adding, re-fetch local data:
                    // Actually, just fetch client data and re-init local arrays
                    fetchClientData();
                }}
                clientId={clientId}
            />

            <AddClientWorker
                show={showAddContactModal}
                onClose={() => setShowAddContactModal(false)}
                clientId={clientId}
                onSuccess={handleNewContact}
            />

            <ConfirmationModal
                show={confirmation.show}
                onHide={() => setConfirmation({ show: false, title: '', message: '', onConfirm: null })}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
            />
        </Modal>
    );
}

export default EditClient;
