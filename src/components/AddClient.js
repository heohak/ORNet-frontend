import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../config/config";

function AddClient() {
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocationsAndThirdParties = async () => {
            try {
                const locationsResponse = await axios.get(`${config.API_BASE_URL}/location/all`);
                setLocations(locationsResponse.data);

                const thirdPartiesResponse = await axios.get(`${config.API_BASE_URL}/third-party/all`);
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
            console.log(clientResponse)
            const clientId = clientResponse.data.token;

            await Promise.all([
                ...locationIds.map(locationId => axios.put(`${config.API_BASE_URL}/client/${clientId}/${locationId}`)),
                ...thirdPartyIds.map(thirdPartyId => axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${thirdPartyId}`))
            ]);

            navigate('/clients');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Client</h1>
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
                        onChange={(e) => setLocationIds([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Third Party ITs</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={thirdPartyIds}
                        onChange={(e) => setThirdPartyIds([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {thirdParties.map(tp => (
                            <option key={tp.id} value={tp.id}>
                                {tp.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Client
                </Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Form>
        </Container>
    );
}

export default AddClient;
