import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {Form, Button, Alert, Modal, Row, Col, Badge} from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";
import AddContactModal from "./AddContactModal";
import AsyncSelect from 'react-select/async';
import { validatePhoneAndPostalCode } from '../../utils/Validation';


function NewAddCustomer({ show, onClose }) {
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [pathologyCustomer, setPathologyCustomer] = useState(false);
    const [surgeryCustomer, setSurgeryCustomer] = useState(false);
    const [editorCustomer, setEditorCustomer] = useState(false);
    const [otherMedicalDevices, setOtherMedicalDevices] = useState(false);
    const [prospect, setProspect] = useState(false);
    const [agreement, setAgreement] = useState(false);
    const [lastMaintenance, setLastMaintenance] = useState('');
    const [nextMaintenance, setNextMaintenance] = useState('');
    const [locationOptions, setLocationOptions] = useState([]);
    const [thirdPartyOptions, setThirdPartyOptions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedThirdParties, setSelectedThirdParties] = useState([]);
    const [dateError, setDateError] = useState(null);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        city: '',
        country: '',
        email: '',
        postalCode: '',
        streetAddress: '',
        phone: ''
    });
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');

    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });

    const [allContacts, setAllContacts] = useState([]); // State to store contacts
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showAddContactModal, setShowAddContactModal] = useState(false);

    const dateErrorRef = useRef(null);
    const [error, setError] = useState(null);

    const [countryOptions, setCountryOptions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);
    const [isSubmittingThirdParty, setIsSubmittingThirdParty] = useState(false);


    useEffect(() => {
        if (dateError && dateErrorRef.current) {
            dateErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [dateError]);

    useEffect(() => {
        fetchCountries();
    },[]);
    const fetchCountries = async () => {
        try {
            const response = await axios.get('https://restcountries.com/v3.1/all');
            const options = response.data.map(country => ({
                value: country.cca3, // This is the code you want to send to the backend
                label: country.name.common, // This is what will be displayed in the dropdown
            }));
            setCountryOptions(options);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };
    const handleChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
    };

    const loadCountryOptions = async (inputValue) => {
        try {
            if (inputValue.length > 0) {
                const response = await axios.get(`https://restcountries.com/v3.1/name/${inputValue}`);
                return response.data.map(country => ({
                    value: country.cca3,
                    label: country.name.common,
                }));
            } else {
                const response = await axios.get('https://restcountries.com/v3.1/all');
                return response.data.map(country => ({
                    value: country.cca3,
                    label: country.name.common,
                }));
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    };




    useEffect(() => {
        const fetchLocationsAndThirdParties = async () => {
            try {
                const [locationsResponse, thirdPartiesResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/third-party/all`)
                ]);
                setLocationOptions(locationsResponse.data.map(loc => ({ value: loc.id, label: loc.name })));
                setThirdPartyOptions(thirdPartiesResponse.data.map(tp => ({ value: tp.id, label: tp.name })));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchLocationsAndThirdParties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const today = new Date().toISOString().split("T")[0];

        // Ensure Last Maintenance is not in the future
        if (new Date(lastMaintenance) > new Date(today)) {
            setDateError('Last Maintenance date cannot be in the future.');
            setIsSubmitting(false);
            return;
        }

        // Ensure Next Maintenance is after Last Maintenance
        if (new Date(nextMaintenance) < new Date(lastMaintenance)) {
            setDateError('Next maintenance date cannot be before the last maintenance date.');
            setIsSubmitting(false);
            return;
        }

        try {
            const clientResponse = await axios.post(`${config.API_BASE_URL}/client/add`, {
                fullName,
                shortName,
                pathologyClient: pathologyCustomer,
                surgeryClient: surgeryCustomer,
                editorClient: editorCustomer,
                otherMedicalDevices,
                lastMaintenance,
                nextMaintenance,
                prospect,
                agreement,
                country: selectedCountry ? selectedCountry.value : '', // Use selectedCountry

            });
            const clientId = clientResponse.data.token;

            await Promise.all([
                ...selectedLocations.map(location => axios.put(`${config.API_BASE_URL}/client/${clientId}/${location.value}`)),
                ...selectedThirdParties.map(tp => axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${tp.value}`))
            ]);

            for (const contact of selectedContacts) {
                // Create worker
                const response = await axios.post(`${config.API_BASE_URL}/worker/add`, {
                    clientId,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email,
                    phoneNumber: contact.phoneNumber,
                    title: contact.title,
                    locationId: contact.locationId,
                });

                if (response.data && response.data.token) {
                    const workerId = response.data.token;

                    // Assign roles to worker
                    for (const role of contact.roles) {
                        await axios.put(`${config.API_BASE_URL}/worker/role/${workerId}/${role.id}`);
                    }
                }
            }



            onClose(); // Close the modal after adding the customer
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('Error adding customer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (isSubmittingLocation) return;
        setIsSubmittingLocation(true);

        const { name, city, country, email, postalCode, streetAddress, phone } = newLocation;

        // Validate phone number and postal code
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
                const newLocationOption = { value: addedLocation.id, label: addedLocation.name };
                setLocationOptions(prevLocations => [...prevLocations, newLocationOption]);
                setSelectedLocations(prevSelected => [...prevSelected, newLocationOption]); // Automatically select the new location
                setNewLocation({
                    name: '',
                    city: '',
                    country: '',
                    email: '',
                    postalCode: '',
                    streetAddress: '',
                    phone: ''
                });
                setPhoneNumberError('');
                setPostalCodeError('');
                setShowLocationModal(false);
            } catch (error) {
                console.error('Error adding location:', error);
                setError('Error adding location.');
            } finally {
                setIsSubmittingLocation(false);
            }
        }
    };


    const handleAddThirdParty = async () => {
        if (isSubmittingThirdParty) return;
        setIsSubmittingThirdParty(true);

        const { name, email, phone } = newThirdParty;



        try {
            const response = await axios.post(`${config.API_BASE_URL}/third-party/add`, {
                name,
                email,
                phone,
            });

            const addedThirdParty = response.data;
            const newThirdPartyOption = { value: addedThirdParty.id, label: addedThirdParty.name };
            setThirdPartyOptions(prevThirdParties => [...prevThirdParties, newThirdPartyOption]);
            setSelectedThirdParties(prevSelected => [...prevSelected, newThirdPartyOption]); // Automatically select the new third-party IT
            setNewThirdParty({ name: '', email: '', phone: '' });
            setShowThirdPartyModal(false);
        } catch (error) {
            console.error('Error adding third-party IT:', error);
        } finally {
            setIsSubmittingThirdParty(false);
        }
    };

    const handleAddContact = (contact) => {
        setAllContacts(prevContacts => [...prevContacts, contact])
        setSelectedContacts(prevContacts => [...prevContacts, contact]);
    };


    return (
        <Modal show={show} onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title className="w-100 text-center">Add New Customer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {dateError && (
                <Alert ref={dateErrorRef} variant="danger">
                    {dateError}
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
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Short Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
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
                            <Select
                                isMulti
                                options={locationOptions}
                                value={selectedLocations}
                                onChange={setSelectedLocations}
                            />
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
                                onChange={handleChange}
                                placeholder="Select a country..."
                                isClearable
                            />

                        </Form.Group>
                    </Col>
                </Row>

                {/* Contacts and Third Party ITs */}
                <Row className="mb-3">
                    <Col md={8}>
                        <Form.Group className="mb-3">
                            <Row>
                                <Col className="col-md-auto align-content-center">
                                    <Form.Label className="mb-0">
                                        Contacts
                                    </Form.Label>
                                </Col>
                                <Col className="col-md-auto px-0 py-0">
                                    <Button variant="link" onClick={() => setShowAddContactModal(true)}>
                                        Add New Contact
                                    </Button>
                                </Col>
                            </Row>
                            <Select
                                isMulti
                                options={allContacts}
                                value={selectedContacts}
                                onChange={setSelectedContacts}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group>
                            <Row>
                                <Col className="col-md-auto align-content-center">
                                    <Form.Label className="mb-0">
                                        Third Party ITs
                                    </Form.Label>
                                </Col>
                                <Col className="col-md-auto px-0 py-0">
                                    <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>
                                        Add New Third Party
                                    </Button>
                                </Col>
                            </Row>
                            <Select
                                isMulti
                                options={thirdPartyOptions}
                                value={selectedThirdParties}
                                onChange={setSelectedThirdParties}
                            />
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
                        checked={pathologyCustomer}
                        onChange={(e) => setPathologyCustomer(e.target.checked)}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Surgery"
                        checked={surgeryCustomer}
                        onChange={(e) => setSurgeryCustomer(e.target.checked)}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Editor"
                        checked={editorCustomer}
                        onChange={(e) => setEditorCustomer(e.target.checked)}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Other Medical Devices"
                        checked={otherMedicalDevices}
                        onChange={(e) => setOtherMedicalDevices(e.target.checked)}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Prospect"
                        checked={prospect}
                        onChange={(e) => setProspect(e.target.checked)}
                    />
                    <Form.Check
                        inline
                        type="checkbox"
                        label="Agreement"
                        checked={agreement}
                        onChange={(e) => setAgreement(e.target.checked)}
                    />
                </Form.Group>

                <Modal.Footer>
                    <Button variant="outline-info" className="me-2" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Customer'}
                    </Button>

                </Modal.Footer>

            </Form>
            </Modal.Body>

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
                        <Button variant="outline-info" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSubmittingLocation}>
                            {isSubmittingLocation ? 'Adding...' : 'Add Location'}
                        </Button>

                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal for adding a new third-party IT */}
            <Modal show={showThirdPartyModal} onHide={() => setShowThirdPartyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Third-Party IT</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => { e.preventDefault(); handleAddThirdParty(); }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Third-Party Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newThirdParty.name}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newThirdParty.email}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={newThirdParty.phone}
                                onChange={(e) => setNewThirdParty({ ...newThirdParty, phone: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="outline-info" onClick={() => setShowThirdPartyModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={isSubmittingThirdParty}>
                                {isSubmittingThirdParty ? 'Adding...' : 'Add Third-Party IT'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* AddContactModal */}
            <AddContactModal
                show={showAddContactModal}
                handleClose={() => setShowAddContactModal(false)}
                onSave={handleAddContact}
                locationOptions={selectedLocations}
            />

        </Modal>
    );
}

export default NewAddCustomer;
