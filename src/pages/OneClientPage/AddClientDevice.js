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
    const [newClassificator, setNewClassificator] = useState('');
    const [showIPFields, setShowIPFields] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingClassificator, setIsSubmittingClassificator] = useState(false);
    const today = new Date().toISOString().split('T')[0];


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [locationsRes, classificatorsRes] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`),
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
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            setIsSubmitting(false);
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClassificator = async () => {

        if (isSubmittingClassificator || !newClassificator.trim()) return;
        setIsSubmittingClassificator(true);

        if (newClassificator.trim() === '') {
            setError('Please enter a valid classificator name.');
            setIsSubmittingClassificator(false);
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

        } finally {
            setIsSubmittingClassificator(false);
        }
    };


    return (
        <Container>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
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
                    <Form.Label>Location</Form.Label>
                    <Select
                        options={locations.map(location => ({ value: location.id, label: location.name }))}
                        value={locations.find(loc => loc.value === locationId)}
                        onChange={(selectedOption) => setLocationId(selectedOption.value)}
                        required
                    />
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
                    <Button variant="outline-info" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Device'}
                    </Button>
                </Modal.Footer>
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
                    <Button variant="outline-info" onClick={() => setShowClassificatorModal(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleAddClassificator}
                        disabled={isSubmittingClassificator}
                    >
                        {isSubmittingClassificator ? 'Adding...' : 'Add Classificator'}
                    </Button>
                </Modal.Footer>
            </Modal>


        </Container>
    );
}

export default AddClientDevice;
