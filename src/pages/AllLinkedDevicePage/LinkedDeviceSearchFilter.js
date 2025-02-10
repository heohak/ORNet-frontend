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
            <div style={{ fontSize: '0.85em', color: '#666' }}>
                SN: {data.serialNumber}
            </div>
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

    // States for date filtering
    const [searchDate, setSearchDate] = useState(''); // Expecting format YYYY-MM-DD
    const [comparison, setComparison] = useState(''); // e.g., 'after' or 'before'

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                const sortedLocations = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setLocations(sortedLocations);
            } catch (err) {
                console.error('Error fetching locations:', err);
                setError('Error fetching locations');
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/all`);
                const filtered = response.data.filter(d => !d.writtenOffDate);
                setDevices(filtered);
            } catch (err) {
                console.error('Error fetching devices:', err);
                setError('Error fetching devices');
            }
        };
        fetchDevices();
    }, []);

    const handleSearchAndFilter = async () => {
        try {
            const params = {
                q: searchQuery || undefined,
                locationId: locationId ? parseInt(locationId, 10) : undefined,
                deviceId: deviceId ? parseInt(deviceId, 10) : undefined,
                template: isTemplate ? true : undefined,
            };
            // Only include date and comparison if both are provided
            if (searchDate && comparison) {
                params.date = searchDate;
                params.comparison = comparison;
            }
            const response = await axiosInstance.get(`${config.API_BASE_URL}/linked/device/search`, { params });
            setLinkedDevices(response.data);
        } catch (err) {
            console.error('Error searching linked devices:', err);
            setError('Error searching linked devices');
        }
    };

    // Debounce the search/filter request to avoid excessive API calls.
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            handleSearchAndFilter();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, locationId, deviceId, isTemplate, searchDate, comparison]);

    const handleComparisonChange = (e) => {
        const newComparison = e.target.value;
        setComparison(newComparison);
        // If user selects "--", reset the date to blank so the date filter is disabled.
        if (newComparison === "") {
            setSearchDate("");
        }
    };

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
                <Col md={2}>
                    <Form.Control
                        as="select"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </Form.Control>
                </Col>

                {/* Devices dropdown using react-select */}
                <Col md={2}>
                    <Select
                        options={devices}
                        value={devices.find(d => String(d.id) === String(deviceId)) || null}
                        onChange={(selected) => setDeviceId(selected ? selected.id : '')}
                        placeholder="Select Device..."
                        isClearable
                        getOptionLabel={o => o.deviceName}
                        getOptionValue={o => o.id.toString()}
                        components={{ Option: deviceOption }}
                    />
                </Col>

                {/* Grouped Date Filter, Comparison, and Template Checkbox */}
                <Col md={5}>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Form.Select
                            value={comparison}
                            onChange={handleComparisonChange}
                            style={{ width: '70px' }} // Comparison select is smaller
                        >
                            <option value="">--</option>
                            <option value="after">After</option>
                            <option value="before">Before</option>
                        </Form.Select>
                        <Form.Control
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            style={{ width: '150px' }} // Fixed width for the date input
                        />

                        <div style={{ marginLeft: '20px' }}>
                            <Form.Check
                                type="checkbox"
                                label="Template Only"
                                checked={isTemplate}
                                onChange={(e) => setIsTemplate(e.target.checked)}
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    );
}

export default LinkedDeviceSearchFilter;
