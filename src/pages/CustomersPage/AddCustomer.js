import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";

function AddCustomer({ onClose }) {
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [pathologyCustomer, setPathologyCustomer] = useState(false);
    const [surgeryCustomer, setSurgeryCustomer] = useState(false);
    const [editorCustomer, setEditorCustomer] = useState(false);
    const [otherMedicalInformation, setOtherMedicalInformation] = useState('');
    const [lastMaintenance, setLastMaintenance] = useState('');
    const [nextMaintenance, setNextMaintenance] = useState('');
    const [locationOptions, setLocationOptions] = useState([]);
    const [thirdPartyOptions, setThirdPartyOptions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedThirdParties, setSelectedThirdParties] = useState([]);
    const [dateError, setDateError] = useState(null);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', country: '', district: '', postalCode: '', streetAddress: '', city: '', phone: '' });


    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [newThirdParty, setNewThirdParty] = useState({ name: '', email: '', phone: '' });

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

        try {  // The backend table has client instead of customer
            const clientResponse = await axios.post(`${config.API_BASE_URL}/client/add`, {
                fullName,
                shortName,
                pathologyClient: pathologyCustomer,
                surgeryClient: surgeryCustomer,
                editorClient: editorCustomer,
                otherMedicalInformation,
                lastMaintenance,
                nextMaintenance
            });
            const clientId = clientResponse.data.token;

            await Promise.all([
                ...selectedLocations.map(location => axios.put(`${config.API_BASE_URL}/client/${clientId}/${location.value}`)),
                ...selectedThirdParties.map(tp => axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${tp.value}`))
            ]);

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

    return (
        <div>
            {dateError && (
                <Alert ref={dateErrorRef} variant="danger">
                    {dateError}
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Short Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Pathology Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={pathologyCustomer}
                        onChange={(e) => setPathologyCustomer(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={surgeryCustomer}
                        onChange={(e) => setSurgeryCustomer(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Customer</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={editorCustomer}
                        onChange={(e) => setEditorCustomer(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Other Medical Information</Form.Label>
                    <Form.Control
                        type="text"
                        value={otherMedicalInformation}
                        onChange={(e) => setOtherMedicalInformation(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        value={lastMaintenance}
                        onChange={(e) => setLastMaintenance(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Next Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        value={nextMaintenance}
                        onChange={(e) => setNextMaintenance(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <Select
                        isMulti
                        options={locationOptions}
                        value={selectedLocations}
                        onChange={setSelectedLocations}
                    />
                    <Form.Text className="text-muted">
                        Can't find the location? <Button variant="link" onClick={() => setShowLocationModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Third Party ITs</Form.Label>
                    <Select
                        isMulti
                        options={thirdPartyOptions}
                        value={selectedThirdParties}
                        onChange={setSelectedThirdParties}
                    />
                    <Form.Text className="text-muted">
                        Can't find the third-party IT? <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit">Add Customer</Button>
                <Button variant="secondary" className="ms-3" onClick={onClose}>Cancel</Button>
            </Form>

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
        </div>
    );
}

export default AddCustomer;
