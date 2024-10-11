import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../../config/config";

function EditDevice() {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [deviceData, setDeviceData] = useState({
        deviceName: '',
        clientId: '',
        locationId: '',
        classificatorId: '',
        department: '',
        room: '',
        serialNumber: '',
        licenseNumber: '',
        versionUpdateDate: '',
        firstIPAddress: '',
        secondIPAddress: '',
        subnetMask: '',
        softwareKey: '',
        introducedDate: '',
        attributes: {} // Initialize attributes here
    });
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [classificators, setClassificators] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/${deviceId}`);
                setDeviceData(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchDropdownData = async () => {
            try {
                const [clientsResponse, classificatorsResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/all`),
                    axios.get(`${config.API_BASE_URL}/device/classificator/all`),
                ]);
                setClients(clientsResponse.data);
                setClassificators(classificatorsResponse.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDeviceData();
        fetchDropdownData();
    }, [deviceId]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (deviceData.clientId) {
                try {
                    const locationRes = await axios.get(`${config.API_BASE_URL}/client/locations/${deviceData.clientId}`);
                    setLocations(locationRes.data);
                } catch (error) {
                    console.error('Error fetching locations:', error);
                }
            }
        };

        fetchLocations();
    }, [deviceData.clientId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeviceData({
            ...deviceData,
            [name]: value,
        });
    };

    // Handle change for attributes
    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        setDeviceData(prevState => ({
            ...prevState,
            attributes: {
                ...prevState.attributes,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/device/update/${deviceId}`, deviceData);
            navigate(`/device/${deviceId}`); // Redirect to the device details page
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Edit Device</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Device Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="deviceName"
                        value={deviceData.deviceName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Customer</Form.Label>
                    <Form.Control
                        as="select"
                        name="clientId"
                        value={deviceData.clientId}
                        onChange={handleInputChange}
                        disabled
                    >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.fullName}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        as="select"
                        name="locationId"
                        value={deviceData.locationId}
                        onChange={handleInputChange}
                        required
                        disabled={!deviceData.clientId}
                    >
                        {!deviceData.clientId ? (
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
                    <Form.Label>Classificator</Form.Label>
                    <Form.Control
                        as="select"
                        name="classificatorId"
                        value={deviceData.classificatorId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Classificator</option>
                        {classificators.map(classificator => (
                            <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                        type="text"
                        name="department"
                        value={deviceData.department}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Room</Form.Label>
                    <Form.Control
                        type="text"
                        name="room"
                        value={deviceData.room}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Serial Number</Form.Label>
                    <Form.Control
                        type="text"
                        name="serialNumber"
                        value={deviceData.serialNumber}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>License Number</Form.Label>
                    <Form.Control
                        type="text"
                        name="licenseNumber"
                        value={deviceData.licenseNumber}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Version Update Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="versionUpdateDate"
                        value={deviceData.versionUpdateDate}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>First IP Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstIPAddress"
                        value={deviceData.firstIPAddress}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Second IP Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="secondIPAddress"
                        value={deviceData.secondIPAddress}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Subnet Mask</Form.Label>
                    <Form.Control
                        type="text"
                        name="subnetMask"
                        value={deviceData.subnetMask}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Software Key</Form.Label>
                    <Form.Control
                        type="text"
                        name="softwareKey"
                        value={deviceData.softwareKey}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Introduced Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="introducedDate"
                        value={deviceData.introducedDate}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                {/* Dynamic Fields for Attributes */}
                {Object.keys(deviceData.attributes).map((attrKey) => (
                    <Form.Group className="mb-3" key={attrKey}>
                        <Form.Label>{attrKey}</Form.Label>
                        <Form.Control
                            type="text"
                            name={attrKey}
                            value={deviceData.attributes[attrKey]}
                            onChange={handleAttributeChange}
                        />
                    </Form.Group>
                ))}

                <Button variant="success" type="submit">Save Changes</Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(`/device/${deviceId}`)}>Cancel</Button>
            </Form>
        </Container>
    );
}

export default EditDevice;
