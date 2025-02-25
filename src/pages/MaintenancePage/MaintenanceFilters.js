import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../config/axiosInstance';

const MaintenanceFilters = ({ setMaintenances, collapsed = false, advancedOnly = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [baitWorkerId, setBaitWorkerId] = useState('');
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchLocations();
        fetchBaitWorkers();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get('/client/all');
            setClients(response.data.sort((a, b) => a.fullName.localeCompare(b.fullName)));
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError(error.message);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get('/location/all');
            setLocations(response.data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Error fetching locations:', error);
            setError(error.message);
        }
    };

    const fetchBaitWorkers = async () => {
        try {
            const response = await axiosInstance.get('/bait/worker/all');
            setBaitWorkers(response.data.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        } catch (error) {
            console.error('Error fetching bait workers:', error);
            setError(error.message);
        }
    };

    const handleSearchAndFilter = async () => {
        try {
            const response = await axiosInstance.get('/maintenance/search', {
                params: {
                    q: searchQuery,
                    clientId: clientId || undefined,
                    locationId: locationId || undefined,
                    baitWorkerId: baitWorkerId || undefined
                }
            });
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error searching and filtering maintenances:', error);
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
    }, [searchQuery, clientId, locationId, baitWorkerId]);

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
            <Row className={`${advancedOnly ? 'g-2' : ''}`}>
                {/* Render the search bar only if not in advancedOnly mode */}
                {!advancedOnly && (
                    <Col md={collapsed ? 12 : 3} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search maintenances..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Col>
                )}
                {/* Render additional filters when not collapsed and not in advancedOnly mode */}
                {!collapsed && !advancedOnly && (
                    <>
                        <Col md={3} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                            >
                                <option value="">Select Client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.fullName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                        <Col md={3} className="d-flex align-items-center">
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
                        <Col md={3} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={baitWorkerId}
                                onChange={(e) => setBaitWorkerId(e.target.value)}
                            >
                                <option value="">Select Assignee</option>
                                {baitWorkers.map((worker) => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.firstName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                    </>
                )}
                {/* When in advancedOnly mode, render only the additional filters */}
                {advancedOnly && (
                    <>
                        <Col md={3} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                            >
                                <option value="">Select Client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.fullName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                        <Col md={3} className="d-flex align-items-center">
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
                        <Col md={3} className="d-flex align-items-center">
                            <Form.Control
                                as="select"
                                value={baitWorkerId}
                                onChange={(e) => setBaitWorkerId(e.target.value)}
                            >
                                <option value="">Select Assignee</option>
                                {baitWorkers.map((worker) => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.firstName}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                    </>
                )}
            </Row>
        </>
    );
};

export default MaintenanceFilters;
