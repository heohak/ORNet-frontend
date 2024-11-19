import React, { useState, useEffect } from 'react';
import {Form, Row, Col, Alert, FormCheck} from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import SummaryModal from "./SummaryModal";

function DeviceSearchFilter({ setDevices }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [classificatorId, setClassificatorId] = useState("");
    const [clientId, setClientId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [writtenOff, setWrittenOff] = useState(false);
    const [classificators, setClassificators] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([])
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        const fetchClassificators = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
                setClassificators(response.data);
            } catch (error) {
                console.error('Error fetching classificators:', error);
                setError(error.message);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/all`);
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setError(error.message);
            }
        };

        const fetchAllLocations = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/all`);
                setAllLocations(response.data); // Store all locations initially
                setLocations(response.data); // Display all locations initially
            } catch (error) {
                console.error('Error fetching locations: ', error);
                setError(error.message);
            }
        };

        fetchClassificators();
        fetchClients();
        fetchAllLocations();
    }, []);

    useEffect(() => {
        const fetchClientLocations = async () => {
            if (clientId) {
                try {
                    const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                    setLocations(response.data);
                } catch (error) {
                    console.error('Error fetching client locations:', error);
                    setError(error.message);
                }
            } else {
                setLocations(allLocations);
            }
        };

        fetchClientLocations();
    }, [clientId, allLocations]);

    const handleSearchAndFilter = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    q: searchQuery,
                    classificatorId: classificatorId || undefined,
                    clientId: clientId || undefined,
                    locationId: locationId || undefined,
                    writtenOff: writtenOff
                }
            });
            setDevices(response.data);
        } catch (error) {
            console.error('Error searching and filtering devices:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, classificatorId, clientId, locationId, writtenOff]);

    return (
        <>
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}
            <Row className="mb-3">
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        value={classificatorId}
                        onChange={(e) => setClassificatorId(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {classificators.map((classificator) => (
                            <option key={classificator.id} value={classificator.id}>
                                {classificator.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    >
                        <option value="">Select Customer</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.shortName}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                <Col className="col-md-auto d-flex">
                    <Form.Check
                        type="switch"
                        id="written-off-switch"
                        label="Written-off"
                        checked={writtenOff}
                        onChange={(e) => setWrittenOff(e.target.checked)}
                        className="align-content-center"
                    />
                </Col>
            </Row>
        </>
    );
}

export default DeviceSearchFilter;
