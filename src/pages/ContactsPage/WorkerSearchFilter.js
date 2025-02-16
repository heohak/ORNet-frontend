import React, { useEffect, useState } from 'react';
import { Alert, Col, Form, FormCheck, Row } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";
import Select from 'react-select';

function WorkerSearchFilter({ setWorkers, setLoading }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleId, setRoleId] = useState("");
    // Still use an array for multiple client IDs
    const [clientIds, setClientIds] = useState([]);
    const [locationId, setLocationId] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [roles, setRoles] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    // New states for country filter
    const [countryOptions, setCountryOptions] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);

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

        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('https://restcountries.com/v3.1/all');
                const options = response.data.map(country => ({
                    value: country.cca3,
                    label: country.name.common,
                }));
                options.sort((a, b) => a.label.localeCompare(b.label));
                setCountryOptions(options);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchClientsAndRoles();
        fetchAllLocations();
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchClientLocations = async () => {
            // If exactly one client is selected, fetch its locations. Otherwise, show all.
            if (clientIds.length === 1) {
                try {
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientIds[0]}`);
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
    }, [clientIds, allLocations]);

    const handleSearchAndFilter = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    q: searchQuery,
                    roleId: roleId || undefined,
                    // When only one client is selected, send it via clientId
                    clientId: clientIds.length === 1 ? clientIds[0] : undefined,
                    // When multiple are selected, send them via clientIds as a comma-separated string
                    clientIds: clientIds.length > 1 ? clientIds.toString() : undefined,
                    locationId: locationId || undefined,
                    favorite: favorite || undefined,
                    // Send countries if any are selected
                    countries: selectedCountries.length > 0
                        ? selectedCountries.map(option => option.value).toString()
                        : undefined,
                }
            });
            const sortedWorkers = response.data.sort((a, b) => {
                if (a.favorite === b.favorite) {
                    return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                }
                return a.favorite ? -1 : 1;
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
    }, [searchQuery, roleId, clientIds, locationId, favorite, selectedCountries]);

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
                    {/* Multi-select for clients */}
                    <Select
                        isMulti
                        options={clients.map(client => ({
                            value: client.id,
                            label: client.shortName
                        }))}
                        value={clientIds.map(id => {
                            const client = clients.find(c => c.id === id);
                            return client ? { value: client.id, label: client.shortName } : null;
                        })}
                        onChange={(selectedOptions) =>
                            setClientIds(selectedOptions ? selectedOptions.map(option => option.value) : [])
                        }
                        placeholder="Select Customer(s)"
                    />
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
                <Col>
                    {/* New multi-select for countries */}
                    <Select
                        isMulti
                        options={countryOptions}
                        value={selectedCountries}
                        onChange={(selectedOptions) => setSelectedCountries(selectedOptions)}
                        placeholder="Select Country(s)"
                    />
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
