import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../config/axiosInstance';
import ReactDatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const TrainingFilters = ({ onFilter, collapsed = false, advancedOnly = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [trainingDate, setTrainingDate] = useState(null);
    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [trainingType, setTrainingType] = useState('');
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainingTypes, setTrainingTypes] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchLocations();
        fetchTrainingTypes();
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

    const fetchTrainingTypes = async () => {
        // Predefined training types; adjust as needed.
        setTrainingTypes(['ON_SITE', 'TEAMS']);
    };

    const handleSearchAndFilter = async () => {
        try {
            const response = await axiosInstance.get('/training/search', {
                params: {
                    q: searchQuery,
                    clientId: clientId || undefined,
                    locationId: locationId || undefined,
                    date: trainingDate ? format(trainingDate, 'yyyy-MM-dd') : undefined,
                    type: trainingType || undefined
                }
            });
            onFilter(response.data);
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
    }, [searchQuery, clientId, locationId, trainingDate, trainingType]);

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
            {/* Use Bootstrap's gap utility (g-2) when advancedOnly is true */}
            <Row className={`${advancedOnly ? 'g-2' : ''}`}>
                {/* Render search bar only if not advancedOnly */}
                {!advancedOnly && (
                    <Col md={collapsed ? 12 : 3} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search trainings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Col>
                )}
                {/* If not collapsed and not in advancedOnly mode, render remaining filters */}
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
                        <Col md={2} className="d-flex align-items-center">
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
                        <Col md={2} className="d-flex align-items-center">
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
                        <Col md={2} className="d-flex align-items-center">
                            <ReactDatePicker
                                selected={trainingDate}
                                onChange={(date) => setTrainingDate(date)}
                                dateFormat="dd.MM.yyyy"
                                className="form-control"
                                placeholderText="Select Date"
                                isClearable
                            />
                        </Col>
                    </>
                )}
                {/* When advancedOnly is true, render only the additional filters */}
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
                        <Col md={2} className="d-flex align-items-center">
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
                        <Col md={2} className="d-flex align-items-center">
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
                        <Col md={2} className="d-flex align-items-center">
                            <ReactDatePicker
                                selected={trainingDate}
                                onChange={(date) => setTrainingDate(date)}
                                dateFormat="dd.MM.yyyy"
                                className="form-control"
                                placeholderText="Select Date"
                                isClearable
                            />
                        </Col>
                    </>
                )}
            </Row>
        </>
    );
};

export default TrainingFilters;
