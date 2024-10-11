import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert, FormCheck } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

function WorkerSearchFilter({ setWorkers }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleId, setRoleId] = useState("");
    const [clientId, setClientId] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [roles, setRoles] = useState([]);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        const fetchClientsAndRoles = async () => {
            try {
                const [clientsRes, rolesRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/all`),
                    axios.get(`${config.API_BASE_URL}/worker/classificator/all`)
                ]);
                setClients(clientsRes.data);
                setRoles(rolesRes.data.map(role => ({ value: role.id, label: role.role }))); // Correct mapping
            } catch (error) {
                setError(error.message);
            }
        };
        fetchRoles()
        fetchClientsAndRoles();
    }, []);

    const handleSearchAndFilter = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    q: searchQuery,
                    roleId: roleId || undefined,
                    clientId: clientId || undefined,
                    favorite: favorite || undefined
                }
            });
            setWorkers(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
            setRoles(response.data.map(role => ({ value: role.id, label: role.role })));
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };


    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, roleId, clientId, favorite]);

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
            <Row className="mb-3" style={{ maxWidth: '70%', margin: '0 auto' }} >
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
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
                <Col className="col-md-auto">
                    <FormCheck
                        type="switch"
                        id="favorite-switch"
                        label="Favorite"
                        checked={favorite}
                        onChange={(e) => setFavorite(e.target.checked)}
                        className="mb-4"
                    />
                </Col>
            </Row>
        </>
    );
}

export default WorkerSearchFilter;
