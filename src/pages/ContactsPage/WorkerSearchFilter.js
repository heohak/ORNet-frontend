import React, {useEffect, useState} from 'react';
import {Alert, Col, Form, FormCheck, Row} from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import axiosInstance from "../../config/axiosInstance";

function WorkerSearchFilter({ setWorkers, setLoading}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleId, setRoleId] = useState("");
    const [clientId, setClientId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [roles, setRoles] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        const fetchClientsAndRoles = async () => {
            try {
                const [clientsRes, rolesRes] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/client/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/worker/classificator/all`)
                ]);
                // Sort clients by shortName
                const sortedClients = clientsRes.data.sort((a, b) =>
                    a.shortName.localeCompare(b.shortName)
                );

                // Sort roles by role name
                const sortedRoles = rolesRes.data.sort((a, b) =>
                    a.role.localeCompare(b.role)
                );

                setClients(sortedClients);
                setRoles(
                    sortedRoles.map((role) => ({
                        value: role.id,
                        label: role.role,
                    }))
                );
            } catch (error) {
                setError(error.message);
            }
        };
        const fetchAllLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                // Sort locations by name
                const sortedLocations = response.data.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setAllLocations(sortedLocations);
                setLocations(sortedLocations);
            } catch (error) {
                console.error('Error fetching locations: ', error);
                setError(error.message);
            }
        };


        fetchClientsAndRoles();
        fetchAllLocations()
    }, []);

    useEffect(() => {
        const fetchClientLocations = async () => {
            if (clientId) {
                try {
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
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
        setLoading(true); // Start loading
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    q: searchQuery,
                    roleId: roleId || undefined,
                    clientId: clientId || undefined,
                    locationId: locationId || undefined,
                    favorite: favorite || undefined
                }
            });
            // Sort workers: favorites first, then alphabetically by first and last name
            const sortedWorkers = response.data.sort((a, b) => {
                if (a.favorite === b.favorite) {
                    return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                }
                return a.favorite ? -1 : 1; // Favorites come first
            });

            setWorkers(sortedWorkers);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, roleId, clientId, locationId, favorite]);

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
                    <FormCheck
                        type="switch"
                        id="favorite-switch"
                        label="Favorite"
                        checked={favorite}
                        onChange={(e) => setFavorite(e.target.checked)}
                        className="align-content-center"
                    />
                </Col>
            </Row>
        </>
    );
}

export default WorkerSearchFilter;
