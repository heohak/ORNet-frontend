import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

function DeviceSearchFilter({ setDevices }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [classificatorId, setClassificatorId] = useState("");
    const [clientId, setClientId] = useState("");
    const [classificators, setClassificators] = useState([]);
    const [clients, setClients] = useState([]);
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

        fetchClassificators();
        fetchClients();
    }, []);

    const handleSearchAndFilter = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    q: searchQuery,
                    classificatorId: classificatorId || undefined,
                    clientId: clientId || undefined
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
    }, [searchQuery, classificatorId, clientId]);

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
                        <option value="">Select Classificator</option>
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
                        <option value="">Select Client</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.shortName}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
            </Row>
        </>
    );
}

export default DeviceSearchFilter;
