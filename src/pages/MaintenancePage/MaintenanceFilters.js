import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../config/axiosInstance';

const MaintenanceFilters = ({ setMaintenances }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [trainingDate, setTrainingDate] = useState('');
    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [trainingType, setTrainingType] = useState('');

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainingTypes, setTrainingTypes] = useState([]); // Assuming predefined enums
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchLocations();
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


    const handleSearchAndFilter = async () => {
        try {
            const response = await axiosInstance.get('/maintenance/search', {
                params: {
                    q: searchQuery,
                    clientId: clientId || undefined,
                    locationId: locationId || undefined,

                }
            });
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error searching and filtering trainings:', error);
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
    }, [searchQuery, clientId, locationId]);

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
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Search maintenances..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col md={3}>
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
                <Col md={2}>
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
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={trainingType}
                        onChange={(e) => setTrainingType(e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {trainingTypes.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={trainingDate}
                        onChange={(e) => setTrainingDate(e.target.value)}
                    />
                </Col>
            </Row>
        </>
    );
};

export default MaintenanceFilters;
