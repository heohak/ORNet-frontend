// src/pages/SettingsPage/LinkedDeviceSearchFilter.js
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';

// Custom option component for displaying device details in the dropdown
const deviceOption = ({ innerProps, innerRef, data, isFocused }) => {
    if (!data || !data.deviceName) return null;
    return (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                padding: '8px',
                backgroundColor: isFocused ? '#DEEBFF' : 'white',
                cursor: 'pointer',
            }}
        >
            <div style={{ fontWeight: 'bold' }}>{data.deviceName}</div>
            <div style={{ fontSize: '0.85em', color: '#666' }}>SN: {data.serialNumber}</div>
            <div style={{ fontSize: '0.85em', color: '#666' }}>
                CRN: {[data.workstationNo, data.cameraNo, data.otherNo].filter(Boolean).join('/')}
            </div>
        </div>
    );
};

function LinkedDeviceSearchFilter({ setLinkedDevices }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationId, setLocationId] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [isTemplate, setIsTemplate] = useState(false);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    // Fetch locations for the location dropdown
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                const sortedLocations = response.data.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setLocations(sortedLocations);
            } catch (err) {
                console.error('Error fetching locations:', err);
                setError('Error fetching locations');
            }
        };
        fetchLocations();
    }, []);

    // Fetch devices for the device dropdown
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/all`);
                // Optionally filter out devices that are written off
                const filteredDevices = response.data.filter(device => !device.writtenOffDate);
                setDevices(filteredDevices);
            } catch (err) {
                console.error('Error fetching devices:', err);
                setError('Error fetching devices');
            }
        };
        fetchDevices();
    }, []);

    // Function to call the search endpoint with the current filter parameters
    const handleSearchAndFilter = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/search`, {
                params: {
                    q: searchQuery || undefined,
                    locationId: locationId || undefined,
                    deviceId: deviceId || undefined,
                    template: isTemplate ? true : undefined,
                },
            });
            setLinkedDevices(response.data);
        } catch (err) {
            console.error('Error searching linked devices:', err);
            setError('Error searching linked devices');
        }
    };

    // Debounce the search/filter request to avoid excessive API calls
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [searchQuery, locationId, deviceId, isTemplate]);

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
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Search linked devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>

                {/* Location dropdown */}
                <Col md={3}>
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

                {/* Devices dropdown using react-select */}
                <Col md={3}>
                    <Select
                        options={devices}
                        value={devices.find(device => String(device.id) === String(deviceId)) || null}
                        onChange={(selected) => setDeviceId(selected ? selected.id : '')}
                        placeholder="Select Device..."
                        isClearable
                        getOptionLabel={(option) => option.deviceName}
                        getOptionValue={(option) => option.id.toString()}
                        components={{ Option: deviceOption }}
                    />
                </Col>

                <Col className="align-content-center" md={3}>
                    <Form.Check
                        type="checkbox"
                        label="Template Only"
                        checked={isTemplate}
                        onChange={(e) => setIsTemplate(e.target.checked)}
                    />
                </Col>
            </Row>

        </>
    );
}

export default LinkedDeviceSearchFilter;
