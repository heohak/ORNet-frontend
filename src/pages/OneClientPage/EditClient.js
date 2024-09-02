import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import config from '../../config/config';

function EditClient() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState({
        fullName: '',
        shortName: '',
        pathologyClient: false,
        surgeryClient: false,
        editorClient: false,
        otherMedicalInformation: '',
        lastMaintenance: '',
        nextMaintenance: '',
        locationIds: [],
        locations: [], // This will store location objects
    });
    const [error, setError] = useState(null);
    const [allLocations, setAllLocations] = useState([]);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
                const client = response.data;

                // Fetch the location details for the locationIds
                const locationResponses = await Promise.all(
                    client.locationIds.map(id => axios.get(`${config.API_BASE_URL}/location/${id}`))
                );

                const locations = locationResponses.map(res => res.data);

                setClientData({ ...client, locations });
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/all`);
                setAllLocations(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchClientData();
        fetchLocations();
    }, [clientId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClientData({
            ...clientData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleLocationAdd = (e) => {
        const locationId = e.target.value;
        const locationToAdd = allLocations.find((loc) => loc.id === parseInt(locationId));

        setClientData({
            ...clientData,
            locations: [...clientData.locations, locationToAdd],
            locationIds: [...clientData.locationIds, locationToAdd.id],
        });
    };

    const handleLocationRemove = (locationId) => {
        setClientData({
            ...clientData,
            locations: clientData.locations.filter((loc) => loc.id !== locationId),
            locationIds: clientData.locationIds.filter((id) => id !== locationId),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Submit only the locationIds, not the full location objects
            const updatedClientData = {
                ...clientData,
                locations: undefined, // Remove locations array to avoid sending it
            };

            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, updatedClientData);
            navigate(`/client/${clientId}`); // Redirect to the client details page
        } catch (error) {
            setError(error.message);
        }
    };

    // Filter out already added locations from the dropdown list
    const availableLocations = allLocations.filter(
        (loc) => !clientData.locations.some((clientLoc) => clientLoc.id === loc.id)
    );

    return (
        <Container className="mt-5">
            <h1>Edit Client</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="fullName"
                        value={clientData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Short Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="shortName"
                        value={clientData.shortName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Pathology Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="pathologyClient"
                        checked={clientData.pathologyClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="surgeryClient"
                        checked={clientData.surgeryClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="editorClient"
                        checked={clientData.editorClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Other Medical Information</Form.Label>
                    <Form.Control
                        type="text"
                        name="otherMedicalInformation"
                        value={clientData.otherMedicalInformation}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="lastMaintenance"
                        value={clientData.lastMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Next Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="nextMaintenance"
                        value={clientData.nextMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <ListGroup>
                        {clientData.locations.map((location) => (
                            <ListGroup.Item key={location.id}>
                                <Row>
                                    <Col>{location.name}</Col>
                                    <Col xs="auto">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleLocationRemove(location.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Form.Select
                        className="mt-3"
                        onChange={handleLocationAdd}
                        value="" // Ensure the dropdown resets to the default option after selection
                    >
                        <option value="" disabled>Select Location</option>
                        {availableLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Button variant="success" type="submit">Save Changes</Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(`/client/${clientId}`)}>Cancel</Button>
            </Form>
        </Container>
    );
}

export default EditClient;
