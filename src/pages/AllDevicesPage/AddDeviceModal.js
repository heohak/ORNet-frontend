import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import config from "../../config/config";
import AddClassificatorModal from "./AddDeviceModals/AddClassificatorModal";
import AddLocationModal from "../TicketsPage/AddTicketModal/AddLocationModal"; // Using the modal from ticketPage
function AddDeviceModal({ show, onHide, setRefresh }) {
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
    const [locationId, setLocationId] = useState('');
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [classificators, setClassificators] = useState([]);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);
    const [showAddClassificatorModal, setShowAddClassificatorModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showIPFields, setShowIPFields] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const today = new Date().toISOString().split('T')[0];


    const resetForm = () => {
        setDeviceName('');
        setDepartment('');
        setRoom('');
        setSerialNumber('');
        setLicenseNumber('');
        setVersion('');
        setVersionUpdateDate('');
        setFirstIPAddress('');
        setSecondIPAddress('');
        setSubnetMask('');
        setDeviceClassificatorId('');
        setSoftwareKey('');
        setIntroducedDate('');
        setLocationId('');
        setClientId('');
        setError(null);
    };

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/all`);
                setClients(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchClassificators = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
                setClassificators(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchClients();
        fetchClassificators();
    }, []);



    const fetchLocations = async () => {
        if (clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        }
    };
    useEffect(() => {

        fetchLocations();
    },[clientId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            setIsSubmitting(false); // Reset isSubmitting
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

            const deviceId = deviceResponse.data.token; // Assuming the response contains the new device's ID

            if (deviceClassificatorId) {
                await axios.put(`${config.API_BASE_URL}/device/classificator/${deviceId}/${deviceClassificatorId}`);
            }

            setRefresh(prev => !prev); // Trigger refresh by toggling state
            resetForm();
            onHide(); // Close the modal after adding the device
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClassificatorAdded = (newClassificator) => {
        setClassificators((prev) => [...prev, newClassificator]);
        setDeviceClassificatorId(newClassificator.id);
    };

    const handleLocationAdded = (addedLocation) => {
        setLocations((prevLocations) => [...prevLocations, addedLocation]);
        setLocationId(addedLocation.id); // Optionally select the new location
    };


    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label column sm={4}>Device Classificator</Form.Label>
                            <Button
                                variant="link"
                                onClick={() => setShowAddClassificatorModal(true)}
                                className="text-primary"
                            >
                                Add New
                            </Button>
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
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Customer</Form.Label>
                            <Form.Control
                                as="select"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                            >
                                <option value="">Select Customer</option>
                                {clients.map(client => (

                                    <option key={client.id} value={client.id}>
                                        {client.shortName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            {clientId ? (
                                <Button
                                    variant="link"
                                    onClick={() => setShowLocationModal(true)}
                                    className="text-primary"
                                >
                                    Add New Location
                                </Button>
                            ) : null}
                            <Form.Control
                                as="select"
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                required
                                disabled={!clientId}
                            >
                                {!clientId ? (
                                    <option value="">Pick a client before picking a location</option>
                                ) : (
                                    <>
                                        <option value="">Select Location</option>
                                        {locations.map(location => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </Form.Control>
                        </Form.Group>
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
                            {/* Optional IP Fields */}
                            <Form.Check
                                type="checkbox"
                                label="Assign IP Addresses"
                                checked={showIPFields}
                                onChange={() => setShowIPFields(!showIPFields)}
                                className="mb-3 mt-3"
                            />
                            {showIPFields && (
                                <>
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
                                </>
                            )}
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
                            <Form.Label>Software Key</Form.Label>
                            <Form.Control
                                type="text"
                                value={softwareKey}
                                onChange={(e) => setSoftwareKey(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Version Update Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={versionUpdateDate}
                                max={today}
                                onChange={(e) => setVersionUpdateDate(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Introduced Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={introducedDate}
                                max={today}
                                onChange={(e) => setIntroducedDate(e.target.value)}
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="outline-info" onClick={onHide}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Device'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        <AddClassificatorModal
            show={showAddClassificatorModal}
            onHide={() => setShowAddClassificatorModal(false)}
            onClassificatorAdded={handleClassificatorAdded}
        />
            <AddLocationModal
                show={showLocationModal}
                onHide={() => setShowLocationModal(false)}
                onAdd={handleLocationAdded}
            />

        </>
    );
}

export default AddDeviceModal;
