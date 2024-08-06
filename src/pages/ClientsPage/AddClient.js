import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import config from "../../config/config";

function AddClient({ onClose }) {
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [pathologyClient, setPathologyClient] = useState(false);
    const [surgeryClient, setSurgeryClient] = useState(false);
    const [editorClient, setEditorClient] = useState(false);
    const [otherMedicalInformation, setOtherMedicalInformation] = useState('');
    const [lastMaintenance, setLastMaintenance] = useState('');
    const [nextMaintenance, setNextMaintenance] = useState('');
    const [locationIds, setLocationIds] = useState([]);
    const [thirdPartyIds, setThirdPartyIds] = useState([]);
    const [locations, setLocations] = useState([]);
    const [thirdParties, setThirdParties] = useState([]);
    const [error, setError] = useState(null);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', phone: '' });

    const [showThirdPartyModal, setShowThirdPartyModal] = useState(false);
    const [newThirdParty, setNewThirdParty] = useState({ name: '', contactInfo: '' });

    useEffect(() => {
        const fetchLocationsAndThirdParties = async () => {
            try {
                const [locationsResponse, thirdPartiesResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/third-party/all`)
                ]);
                setLocations(locationsResponse.data);
                setThirdParties(thirdPartiesResponse.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchLocationsAndThirdParties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (new Date(nextMaintenance) < new Date(lastMaintenance)) {
            setError('Next maintenance date cannot be before the last maintenance date.');
            return;
        }

        try {
            const clientResponse = await axios.post(`${config.API_BASE_URL}/client/add`, {
                fullName,
                shortName,
                pathologyClient,
                surgeryClient,
                editorClient,
                otherMedicalInformation,
                lastMaintenance,
                nextMaintenance
            });
            const clientId = clientResponse.data.token;

            await Promise.all([
                ...locationIds.map(locationId => axios.put(`${config.API_BASE_URL}/client/${clientId}/${locationId}`)),
                ...thirdPartyIds.map(thirdPartyId => axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${thirdPartyId}`))
            ]);

            onClose(); // Close the modal after adding the client
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddLocation = async () => {
        const { name, address, phone } = newLocation;

        if (!name.trim() || !address.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new location.');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address,
                phone,
            });

            const addedLocation = response.data;
            setLocations(prevLocations => [...prevLocations, addedLocation]);
            setLocationIds(prevIds => [...prevIds, addedLocation.id]); // Automatically select the new location
            setNewLocation({ name: '', address: '', phone: '' });
            setShowLocationModal(false);
        } catch (error) {
            setError('Error adding location.');
            console.error('Error adding location:', error);
        }
    };


    const handleAddThirdParty = async () => {
        const { name, contactInfo } = newThirdParty;

        if (!name.trim() || !contactInfo.trim()) {
            setError('Please fill in all fields for the new third-party IT.');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/third-party/add`, {
                name,
                contactInfo,
            });

            const addedThirdParty = response.data;
            setThirdParties(prevThirdParties => [...prevThirdParties, addedThirdParty]);
            setThirdPartyIds(prevIds => [...prevIds, addedThirdParty.id]); // Automatically select the new third-party IT
            setNewThirdParty({ name: '', contactInfo: '' });
            setShowThirdPartyModal(false);
        } catch (error) {
            setError('Error adding third-party IT.');
            console.error('Error adding third-party IT:', error);
        }
    };

    const renderDropdownOptions = (items, selectedIds) => {
        return items.map(item => (
            <option key={item.id} value={item.id} selected={selectedIds.includes(item.id)}>
                {item.name}
            </option>
        ));
    };

    const handleLocationChange = (e) => {
        const options = [...e.target.selectedOptions].map(option => option.value);
        setLocationIds(options);
    };

    const handleThirdPartyChange = (e) => {
        const options = [...e.target.selectedOptions].map(option => option.value);
        setThirdPartyIds(options);
    };

    return (
        <div>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
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
                    <Form.Label>Pathology Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={pathologyClient}
                        onChange={(e) => setPathologyClient(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={surgeryClient}
                        onChange={(e) => setSurgeryClient(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        checked={editorClient}
                        onChange={(e) => setEditorClient(e.target.checked)}
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
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Next Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        value={nextMaintenance}
                        onChange={(e) => setNextMaintenance(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={locationIds}
                        onChange={handleLocationChange}
                    >
                        {renderDropdownOptions(locations, locationIds)}
                    </Form.Control>
                    <Form.Text className="text-muted">
                        Can't find the location? <Button variant="link" onClick={() => setShowLocationModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Third Party ITs</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={thirdPartyIds}
                        onChange={handleThirdPartyChange}
                    >
                        {renderDropdownOptions(thirdParties, thirdPartyIds)}
                    </Form.Control>
                    <Form.Text className="text-muted">
                        Can't find the third-party IT? <Button variant="link" onClick={() => setShowThirdPartyModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit">Add Client</Button>
                <Button variant="secondary" className="ms-3" onClick={onClose}>Cancel</Button>
            </Form>

            {/* Modal for adding a new location */}
            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
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

            {/* Modal for adding a new third-party IT */}
            <Modal show={showThirdPartyModal} onHide={() => setShowThirdPartyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Third-Party IT</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                        <Form.Label>Contact Info</Form.Label>
                        <Form.Control
                            type="text"
                            value={newThirdParty.contactInfo}
                            onChange={(e) => setNewThirdParty({ ...newThirdParty, contactInfo: e.target.value })}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowThirdPartyModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddThirdParty}>Add Third-Party IT</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AddClient;
