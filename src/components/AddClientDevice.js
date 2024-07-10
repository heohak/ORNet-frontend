import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../config/config";

function AddClientDevice() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};

    const [deviceName, setDeviceName] = useState('');
    const [department, setDepartment] = useState('');
    const [room, setRoom] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [version, setVersion] = useState('');
    const [versionUpdateDate, setVersionUpdateDate] = useState('');
    const [firstIPAddress, setFirstIPAddress] = useState('');
    const [secondIPAddress, setSecondIPAddress] = useState('');
    const [softwareKey, setSoftwareKey] = useState('');
    const [introducedDate, setIntroducedDate] = useState('');
    const [writtenOffDate, setWrittenOffDate] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState('');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/all`);
                setLocations(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            return;
        }

        try {
            await axios.post(`${config.API_BASE_URL}/device`, {
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
                softwareKey,
                introducedDate,
                writtenOffDate,
                comment,
            });
            navigate(-1);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Device</h1>
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
                    <Form.Label>Written Off Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={writtenOffDate}
                        onChange={(e) => setWrittenOffDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        required
                    >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Device
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Form>
        </Container>
    );
}

export default AddClientDevice;
