// src/pages/DevicesPage/DeviceSearchFilter.js
import React, { useEffect, useState } from 'react';
import { Row, Col, Alert, Form } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';
import ReactDatePicker from "react-datepicker";

function DeviceSearchFilter({
                                searchQuery, setSearchQuery,
                                classificatorId, setClassificatorId,
                                clientId, setClientId,
                                locationId, setLocationId,
                                writtenOff, setWrittenOff,
                                searchDate, setSearchDate,
                                comparison, setComparison,
                                setDevices,
                                collapsed = false,
                                advancedOnly = false
                            }) {
    const [classificators, setClassificators] = useState([]);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [searchDateObj, setSearchDateObj] = useState(null);

    useEffect(() => {
        setSearchDateObj(searchDate ? new Date(searchDate) : null);
    }, [searchDate]);

    useEffect(() => {
        const fetchClassificators = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
                const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setClassificators(sorted);
            } catch (error) {
                console.error('Error fetching classificators:', error);
                setError(error.message);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/client/all`);
                const sorted = response.data.sort((a, b) => a.shortName.localeCompare(b.shortName));
                setClients(sorted);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setError(error.message);
            }
        };

        const fetchAllLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setAllLocations(sorted);
                setLocations(sorted);
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
                    const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
                    setLocations(sorted);
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
            const params = {
                q: searchQuery || undefined,
                classificatorId: classificatorId || undefined,
                clientId: clientId || undefined,
                locationId: locationId || undefined,
                writtenOff: writtenOff,
            };
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

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison]);

    if (advancedOnly) {
        // Advanced filters stacked vertically (without duplicating the search input)
        return (
            <>
                <Row className="mb-2">
                    <Col>
                        <Form.Control
                            as="select"
                            value={classificatorId}
                            onChange={(e) => setClassificatorId(e.target.value)}
                        >
                            <option value="">Select Type</option>
                            {classificators.map(cl => (
                                <option key={cl.id} value={cl.id}>{cl.name}</option>
                            ))}
                        </Form.Control>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Control
                            as="select"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        >
                            <option value="">Select Customer</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.shortName}</option>
                            ))}
                        </Form.Control>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Control
                            as="select"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </Form.Control>
                    </Col>
                </Row>
                <Row className="mb-2 align-items-center">
                    <Col xs={4}>
                        <Form.Select
                            value={comparison}
                            onChange={(e) => {
                                const newComparison = e.target.value;
                                setComparison(newComparison);
                                if (newComparison === "") {
                                    setSearchDate("");
                                }
                            }}
                        >
                            <option value="">--</option>
                            <option value="after">After</option>
                            <option value="before">Before</option>
                        </Form.Select>
                    </Col>
                    <Col xs={8}>
                        <ReactDatePicker
                            selected={searchDateObj}
                            onChange={(date) => {
                                setSearchDateObj(date);
                                setSearchDate(date ? date.toISOString().split('T')[0] : '');
                            }}
                            dateFormat="dd.MM.yyyy"
                            className="form-control"
                            placeholderText="dd.mm.yyyy"
                            isClearable
                        />
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Check
                            type="switch"
                            id="written-off-switch"
                            label="Written-off"
                            checked={writtenOff}
                            onChange={(e) => setWrittenOff(e.target.checked)}
                        />
                    </Col>
                </Row>
            </>
        );
    } else if (collapsed) {
        // Only free-text search input
        return (
            <Row>
                <Col md={12} className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
            </Row>
        );
    } else {
        // Desktop view: All filters in one row
        return (
            <Row className="mb-3">
                <Col md={2}>
                    <Form.Control
                        type="text"
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={classificatorId}
                        onChange={(e) => setClassificatorId(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {classificators.map(cl => (
                            <option key={cl.id} value={cl.id}>{cl.name}</option>
                        ))}
                    </Form.Control>
                </Col>
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    >
                        <option value="">Select Customer</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.shortName}</option>
                        ))}
                    </Form.Control>
                </Col>
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </Form.Control>
                </Col>
                <Col md={4}>
                    <div style={{ display: 'flex', alignItems: 'start' }}>
                        <Form.Select
                            value={comparison}
                            onChange={(e) => {
                                const newComparison = e.target.value;
                                setComparison(newComparison);
                                if (newComparison === "") {
                                    setSearchDate("");
                                }
                            }}
                            style={{ width: '70px' }}
                        >
                            <option value="">--</option>
                            <option value="after">After</option>
                            <option value="before">Before</option>
                        </Form.Select>
                        <div style={{ width: '150px' }}>
                            <ReactDatePicker
                                selected={searchDateObj}
                                onChange={(date) => {
                                    setSearchDateObj(date);
                                    setSearchDate(date ? date.toISOString().split('T')[0] : '');
                                }}
                                dateFormat="dd.MM.yyyy"
                                className="form-control"
                                placeholderText="dd.mm.yyyy"
                                isClearable
                            />
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                            <Form.Check
                                type="switch"
                                id="written-off-switch"
                                label="Written-off"
                                checked={writtenOff}
                                onChange={(e) => setWrittenOff(e.target.checked)}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default DeviceSearchFilter;
