import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function AddClient() {
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [availableThirdPartyITs, setAvailableThirdPartyITs] = useState([]);
    const [locations, setLocations] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [pathologyClient, setPathologyClient] = useState(false);
    const [surgeryClient, setSurgeryClient] = useState(false);
    const [editorClient, setEditorClient] = useState(false);
    const [otherMedicalInformation, setOtherMedicalInformation] = useState('');
    const [lastMaintenance, setLastMaintenance] = useState('');
    const [nextMaintenance, setNextMaintenance] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/third-party/all');
                setAvailableThirdPartyITs(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:8080/location/all');
                setAvailableLocations(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchThirdPartyITs();
        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.post('http://localhost:8080/client', {
                fullName,
                shortName,
                thirdPartyITs,
                locations,
                pathologyClient,
                surgeryClient,
                editorClient,
                otherMedicalInformation,
                lastMaintenance,
                nextMaintenance
            });
            navigate('/clients');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCheckboxChange = (event, setState) => {
        setState(event.target.checked);
    };

    const handleMultiSelectChange = (event, setState) => {
        const options = Array.from(event.target.selectedOptions, option => option.value);
        setState(options);
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
                    <Form.Label>Third Party IT</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={thirdPartyITs}
                        onChange={(e) => handleMultiSelectChange(e, setThirdPartyITs)}
                    >
                        {availableThirdPartyITs.map((thirdPartyIT) => (
                            <option key={thirdPartyIT.id} value={thirdPartyIT.id}>
                                {thirdPartyIT.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={locations}
                        onChange={(e) => handleMultiSelectChange(e, setLocations)}
                    >
                        {availableLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Pathology Client"
                        checked={pathologyClient}
                        onChange={(e) => handleCheckboxChange(e, setPathologyClient)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Surgery Client"
                        checked={surgeryClient}
                        onChange={(e) => handleCheckboxChange(e, setSurgeryClient)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Editor Client"
                        checked={editorClient}
                        onChange={(e) => handleCheckboxChange(e, setEditorClient)}
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
                <Button variant="success" type="submit">
                    Add Client
                </Button>
                <Button className="ms-3" onClick={() => navigate(-1)}>Back</Button>
            </Form>
        </Container>
    );
}

export default AddClient;
