import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {Form, Button, Alert, Modal, Row, Col, Badge} from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";
import AddContactModal from "./AddContactModal";

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
    const [country, setCountry] = useState(''); // Added country state
    const [locationOptions, setLocationOptions] = useState([]);
    const [thirdPartyOptions, setThirdPartyOptions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedThirdParties, setSelectedThirdParties] = useState([]);
    const [dateError, setDateError] = useState(null);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', country: '', district: '', postalCode: '', streetAddress: '', city: '', phone: '' });

    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });

    const [contacts, setContacts] = useState([]); // State to store contacts
    const [showAddContactModal, setShowAddContactModal] = useState(false);

    const dateErrorRef = useRef(null);

    useEffect(() => {
        if (dateError && dateErrorRef.current) {
            dateErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [dateError]);

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

        const today = new Date().toISOString().split("T")[0];

        // Ensure Last Maintenance is not in the future
        if (new Date(lastMaintenance) > new Date(today)) {
            setDateError('Last Maintenance date cannot be in the future.');
            return;
        }

        // Ensure Next Maintenance is after Last Maintenance
        if (new Date(nextMaintenance) < new Date(lastMaintenance)) {
            setDateError('Next maintenance date cannot be before the last maintenance date.');
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
                country,
            });
            const clientId = clientResponse.data.token;

            await Promise.all([
                ...selectedLocations.map(location => axios.put(`${config.API_BASE_URL}/client/${clientId}/${location.value}`)),
                ...selectedThirdParties.map(tp => axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${tp.value}`))
            ]);

            for (const contact of contacts) {
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
        }
    };

    const handleAddLocation = async () => {
        const { name, country, district, postalCode, streetAddress, city, phone } = newLocation;


        const combinedAddress = `${streetAddress}, ${city}, ${district}, ${postalCode}, ${country}`;

        try {
            const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address: combinedAddress,
                phone,
            });

            const addedLocation = response.data;
            const newLocationOption = { value: addedLocation.id, label: addedLocation.name };
            setLocationOptions(prevLocations => [...prevLocations, newLocationOption]);
            setSelectedLocations(prevSelected => [...prevSelected, newLocationOption]); // Automatically select the new location
            setNewLocation({ name: '', country: '', district: '', postalCode: '', streetAddress: '', city: '', phone: '' });
            setShowLocationModal(false);
        } catch (error) {
            console.error('Error adding location:', error);
        }
    };


    const handleAddThirdParty = async () => {
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
        }
    };

    const handleAddContact = (contact) => {
        setContacts(prevContacts => [...prevContacts, contact]);
    };

    // Function to remove a contact
    const handleRemoveContact = (indexToRemove) => {
        setContacts(prevContacts => prevContacts.filter((_, index) => index !== indexToRemove));
    };


    return (
        <Modal show={show} onHide={onClose} size="lg">
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
                            <Form.Label>
                                Locations

                            </Form.Label>
                            <Button variant="link" onClick={() => setShowLocationModal(true)} style={{ paddingLeft: '5px', paddingBottom: '0.5px' }}>
                                Add New Location
                            </Button>
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
                            <Form.Control
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* Contacts */}
                <Form.Group className="mb-3">
                    <Form.Label>
                        Contacts
                    </Form.Label>
                    <Button variant="link" onClick={() => setShowAddContactModal(true)} style={{ paddingLeft: '5px', paddingBottom: '0.5px' }}>
                        Add New Contact
                    </Button>
                    <Row>
                        <Col md={8}>
                            <div style={{
                                border: '1px solid #ced4da',
                                borderRadius: '.25rem',
                                padding: '0.2rem 0.5rem',
                                minHeight: '38px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}>
                                {contacts.length > 0 ? (
                                    contacts.map((contact, index) => (
                                        <Badge
                                            key={index}
                                            pill={false}
                                            bg="none"
                                            text="dark"
                                            className="me-1 mb-1"
                                            style={{
                                                backgroundColor: '#dcd8dc', // Dark gray custom background color
                                                color: '#6c757d',           // Gray text color
                                                borderRadius: '0',          // No corner radius
                                                fontSize: '90%',
                                                fontWeight: 'normal',
                                                padding: '1px 4px'
                                            }}
                                        >
                                            {contact.firstName} {contact.lastName}
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => handleRemoveContact(index)}
                                                style={{
                                                    color: 'black',
                                                    textDecoration: 'none',
                                                    marginLeft: '5px',
                                                    marginBottom: '4px',
                                                    padding: '0',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                &times;
                                            </Button>
                                        </Badge>
                                    ))
                                ) : (
                                    <span style={{ color: '#6c757d' }}>No contacts added yet.</span>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Form.Group>

                {/* Row 4: Grouped Checkboxes */}
                <Form.Group className="mb-3">
                    <Form.Label>Customer Types</Form.Label>
                    <div className="border p-3">
                        <Row>
                            <Col xs={6} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    label="Pathology Customer"
                                    checked={pathologyCustomer}
                                    onChange={(e) => setPathologyCustomer(e.target.checked)}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    label="Surgery Customer"
                                    checked={surgeryCustomer}
                                    onChange={(e) => setSurgeryCustomer(e.target.checked)}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    label="Editor Customer"
                                    checked={editorCustomer}
                                    onChange={(e) => setEditorCustomer(e.target.checked)}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    label="Other Medical Devices"
                                    checked={otherMedicalDevices}
                                    onChange={(e) => setOtherMedicalDevices(e.target.checked)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col xs={6} md={3}>
                                <Form.Check
                                    type="checkbox"
                                    label="Prospect"
                                    checked={prospect}
                                    onChange={(e) => setProspect(e.target.checked)}
                                />
                            </Col>
                            <Col xs={6}>
                                <Form.Check
                                    type="checkbox"
                                    label="Agreement"
                                    checked={agreement}
                                    onChange={(e) => setAgreement(e.target.checked)}
                                />
                            </Col>
                        </Row>
                    </div>
                </Form.Group>


                {/* Row 5: Third Party ITs and Add Third Party Button */}
                <Row className="mb-3">
                    <Col md={8}>
                        <Form.Group>
                            <Form.Label>Third Party ITs</Form.Label>
                            <Select
                                isMulti
                                options={thirdPartyOptions}
                                value={selectedThirdParties}
                                onChange={setSelectedThirdParties}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>Add New Third Party</Button>
                    </Col>
                </Row>

                {/* Bottom: Cancel and Add Buttons */}
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onClose}>Cancel</Button>
                    <Button variant="success" type="submit">Add Customer</Button>
                </div>
            </Form>
            </Modal.Body>

            {/* Modal for adding a new location */}
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => { e.preventDefault(); handleAddLocation(); }}>
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

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                            <Button variant="primary" type='submit'>Add Location</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
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
                            <Button variant="secondary" onClick={() => setShowThirdPartyModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">Add Third-Party IT</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* AddContactModal */}
            <AddContactModal
                show={showAddContactModal}
                handleClose={() => setShowAddContactModal(false)}
                onSave={handleAddContact}
                locationOptions={locationOptions}
            />

            {/* Modals for Adding Location, Contact, and Third Party IT remain unchanged */}
            {/* ... */}
        </Modal>
    );
}

export default NewAddCustomer;
