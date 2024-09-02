import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';


function AddClientDevice({ clientId, onClose, setRefresh }) {

    const [deviceName, setDeviceName] = useState('');
    const [department, setDepartment] = useState('');
    const [room, setRoom] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [version, setVersion] = useState('');
    const [versionUpdateDate, setVersionUpdateDate] = useState('');
    const [firstIPAddress, setFirstIPAddress] = useState('');
    const [secondIPAddress, setSecondIPAddress] = useState('');
    const [subnetMask, setSubnetMask] = useState('');
    const [deviceClassificatorId, setDeviceClassificatorId] = useState('');
    const [softwareKey, setSoftwareKey] = useState('');
    const [introducedDate, setIntroducedDate] = useState('');
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState('');
    const [classificators, setClassificators] = useState([]);
    const [showClassificatorModal, setShowClassificatorModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [newClassificator, setNewClassificator] = useState('');
    const [newLocation, setNewLocation] = useState({
        name: '',
        city: '',
        country: '',
        district: '',
        postalCode: '',
        streetAddress: '',
        phone: ''
    });


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [locationsRes, classificatorsRes] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/location/all`),
                axios.get(`${config.API_BASE_URL}/device/classificator/all`)
            ]);

            setLocations(locationsRes.data);
            setClassificators(classificatorsRes.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            return;
        }

        try {
            const deviceResponse = await axios.post(`${config.API_BASE_URL}/device/add`, {
                clientId,
                locationId,
                deviceName,
                department,
                room,
                serialNumber,
                licenseNumber,
                version,
                versionUpdateDate,
                firstIPAddress,
                secondIPAddress,
                subnetMask,
                softwareKey,
                introducedDate,
            });

            const deviceId = deviceResponse.data.token;

            if (deviceClassificatorId) {
                await axios.put(`${config.API_BASE_URL}/device/classificator/${deviceId}/${deviceClassificatorId}`);
            }

            setRefresh(prev => !prev);
            onClose();

            window.location.reload();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddClassificator = async () => {
        if (newClassificator.trim() === '') {
            setError('Please enter a valid classificator name.');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/device/classificator/add`, {
                name: newClassificator,
            });

            const addedClassificator = response.data;

            // Update the classificators state instantly and select the new classificator
            setClassificators(prevClassificators => [...prevClassificators, addedClassificator]);
            setDeviceClassificatorId(addedClassificator.id);
            setNewClassificator('');

            // Perform a silent refresh to ensure all data is up-to-date
            await fetchData();
            setShowClassificatorModal(false);
        } catch (error) {
            setError('Error adding classificator.');
            console.error('Error adding classificator:', error);
        }
    };

    const handleAddLocation = async () => {
        const { name, city, country, district, postalCode, streetAddress, phone } = newLocation;

        if (!name.trim() || !city.trim() || !country.trim() || !district.trim() || !postalCode.trim() || !streetAddress.trim() || !phone.trim()) {
            setError('Please fill in all fields for the new location.');
            return;
        }

        const combinedAddress = `${streetAddress}, ${district}, ${city}, ${postalCode}, ${country}`;

        try {
            const response = await axios.post(`${config.API_BASE_URL}/location/add`, {
                name,
                address: combinedAddress,
                phone,
            });

            const addedLocation = response.data;
            const newLocationOption = { value: addedLocation.id, label: addedLocation.name };
            setLocations(prevLocations => [...prevLocations, newLocationOption]);
            setLocationId(addedLocation.id);
            setNewLocation({ name: '', city: '', country: '', district: '', postalCode: '', streetAddress: '', phone: '' });
            await fetchData(); // Silent refresh
            setShowLocationModal(false);
        } catch (error) {
            setError('Error adding location.');
            console.error('Error adding location:', error);
        }
    };


    return (
        <Container className="mt-5">
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Device Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Room</Form.Label>
                    <Form.Control
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        required
                        pattern="\d+"
                        title="Serial number should only contain numbers"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>License Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Version</Form.Label>
                    <Form.Control
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Version Update Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={versionUpdateDate}
                        onChange={(e) => setVersionUpdateDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>First IP Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstIPAddress}
                        onChange={(e) => setFirstIPAddress(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Second IP Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={secondIPAddress}
                        onChange={(e) => setSecondIPAddress(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Subnet Mask</Form.Label>
                    <Form.Control
                        type="text"
                        value={subnetMask}
                        onChange={(e) => setSubnetMask(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Device Classificator</Form.Label>
                    <Form.Control
                        as="select"
                        value={deviceClassificatorId}
                        onChange={(e) => setDeviceClassificatorId(e.target.value)}
                        required
                    >
                        <option value="">Select Classificator</option>
                        {classificators.map(classificator => (
                            <option key={classificator.id} value={classificator.id}>
                                {classificator.name}
                            </option>
                        ))}
                    </Form.Control>
                    <Form.Text className="text-muted">
                        Can't find the classificator? <Button variant="link" onClick={() => setShowClassificatorModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Software Key</Form.Label>
                    <Form.Control
                        type="text"
                        value={softwareKey}
                        onChange={(e) => setSoftwareKey(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Introduced Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={introducedDate}
                        onChange={(e) => setIntroducedDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Select
                        options={locations.map(location => ({ value: location.id, label: location.name }))}
                        value={locations.find(loc => loc.value === locationId)}
                        onChange={(selectedOption) => setLocationId(selectedOption.value)}
                    />
                    <Form.Text className="text-muted">
                        Can't find the location? <Button variant="link" onClick={() => setShowLocationModal(true)}>Add New</Button>
                    </Form.Text>
                </Form.Group>


                <Button variant="success" type="submit">
                    Add Device
                </Button>
            </Form>

            <Modal show={showClassificatorModal} onHide={() => setShowClassificatorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Classificator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Classificator Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newClassificator}
                            onChange={(e) => setNewClassificator(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClassificatorModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddClassificator}>Add Classificator</Button>
                </Modal.Footer>
            </Modal>

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
                        />
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
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLocationModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddLocation}>Add Location</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default AddClientDevice;
