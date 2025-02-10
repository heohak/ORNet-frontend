import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import ReactDatePicker from "react-datepicker";

function DeviceSearchFilter({ searchQuery, setSearchQuery,
                                classificatorId, setClassificatorId,
                                clientId, setClientId,
                                locationId, setLocationId,
                                writtenOff, setWrittenOff,
                                searchDate, setSearchDate,
                                comparison, setComparison,
                                setDevices }) {
    const [classificators, setClassificators] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [searchDateObj, setSearchDateObj] = useState(null);

    useEffect(() => {
        if (searchDate) {
            setSearchDateObj(new Date(searchDate));
        }
    }, []);


    // States for date filtering

    useEffect(() => {
        const fetchClassificators = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
                const sortedClassificators = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setClassificators(sortedClassificators);
            } catch (error) {
                console.error('Error fetching classificators:', error);
                setError(error.message);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/client/all`);
                const sortedCustomers = response.data.sort((a, b) => a.shortName.localeCompare(b.shortName));
                setClients(sortedCustomers);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setError(error.message);
            }
        };

        const fetchAllLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                const sortedLocations = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setAllLocations(sortedLocations);
                setLocations(sortedLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
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
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                    const sortedLocations = response.data.sort((a, b) => a.name.localeCompare(b.name));
                    setLocations(sortedLocations);
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

    // Search/filter function
    const handleSearchAndFilter = async () => {
        try {
            const params = {
                q: searchQuery || undefined,
                classificatorId: classificatorId || undefined,
                clientId: clientId || undefined,
                locationId: locationId || undefined,
                writtenOff: writtenOff,
            };
            // Only include date if both date and comparison are set
            if (searchDate && comparison) {
                params.date = searchDate;
                params.comparison = comparison;
            }
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, { params });
            setDevices(response.data);
        } catch (error) {
            console.error('Error searching and filtering devices:', error);
            setError(error.message);
        }
    };

    // Debounce effect to reduce API calls
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison]);


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
                {/* Free-text search input */}
                <Col md={2}>
                    <Form.Control
                        type="text"
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>

                {/* Classificator dropdown */}
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={classificatorId}
                        onChange={(e) => setClassificatorId(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {classificators.map((cl) => (
                            <option key={cl.id} value={cl.id}>
                                {cl.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>

                {/* Client dropdown */}
                <Col md={2}>
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

                {/* Location dropdown */}
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>

                {/* Comparison + Date + Written-off all in one column */}
                <Col md={4}>
                    {/* d-flex container with consistent gap */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Comparison */}
                        <Form.Select
                            value={comparison}
                            onChange={(e) => {
                                const newComparison = e.target.value;
                                setComparison(newComparison);
                                if (newComparison === "") {
                                    setSearchDate("");
                                    setSearchDateObj(null);
                                }
                            }}
                            style={{ width: '70px' }}
                        >
                            <option value="">--</option>
                            <option value="after">After</option>
                            <option value="before">Before</option>
                        </Form.Select>


                        <div style={{width: '150px' }}>
                            <ReactDatePicker
                                selected={searchDateObj}
                                onChange={(date) => {
                                    setSearchDateObj(date);
                                    // Convert the selected date to YYYY-MM-DD for your query
                                    setSearchDate(date ? date.toISOString().split('T')[0] : '');
                                }}
                                dateFormat="dd/MM/yyyy"          // Display format: day/month/year
                                className="form-control"         // To match Bootstrap styling
                                placeholderText="dd/mm/yyyy"
                                isClearable
                            />
                        </div>

                        {/* Written-off switch with a label */}
                        <Form.Check
                            type="switch"
                            id="written-off-switch"
                            label="Written-off"
                            checked={writtenOff}
                            onChange={(e) => setWrittenOff(e.target.checked)}
                            style={{marginLeft: '20px'}}
                        />
                    </div>
                </Col>
            </Row>
        </>
    );
}

export default DeviceSearchFilter;
