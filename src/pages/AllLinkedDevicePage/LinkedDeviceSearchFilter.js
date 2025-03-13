// src/pages/SettingsPage/LinkedDeviceSearchFilter.js
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import axiosInstance from '../../config/axiosInstance';
import config from '../../config/config';
import ReactDatePicker from "react-datepicker";
import "../../css/LinkedDeviceSearchFilter.css";
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

function LinkedDeviceSearchFilter({ setLinkedDevices, collapsed = false, advancedOnly = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationId, setLocationId] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [isTemplate, setIsTemplate] = useState(false);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    // States for date filtering
    const [searchDate, setSearchDate] = useState('');
    const [comparison, setComparison] = useState('');
    const [searchDateObj, setSearchDateObj] = useState(null);

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
                template: isTemplate,
            };
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
        if (newComparison === "") {
            setSearchDate("");
            setSearchDateObj(null);
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

            {advancedOnly ? (
                // Advanced filters: each filter in its own row with a small gap between them
                <>
                    <Row className="mb-2">
                        <Col>
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
                    </Row>
                    <Row className="mb-2">
                        <Col>
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
                    </Row>
                    <Row className="mb-2 align-items-center">
                        <Col xs={4}>
                            <Form.Select
                                value={comparison}
                                onChange={handleComparisonChange}
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
                                type="checkbox"
                                label="Template Only"
                                checked={isTemplate}
                                onChange={(e) => setIsTemplate(e.target.checked)}
                            />
                        </Col>
                    </Row>
                </>
            ) : collapsed ? (
                // Only the free-text search input
                <Row>
                    <Col md={12} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search linked devices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Col>
                </Row>
            ) : (
                // All filters in one row (desktop view)
                <Row className="mb-3">
                    <Col md={3} className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search linked devices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Col>
                    <Col md={2} className="d-flex align-items-center">
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
                    <Col md={5} className="d-flex align-items-center">
                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Form.Select
                                value={comparison}
                                onChange={handleComparisonChange}
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
            )}
        </>
    );
}

export default LinkedDeviceSearchFilter;
