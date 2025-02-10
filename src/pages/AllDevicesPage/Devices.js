import React, { useEffect, useState, } from 'react';
import { Row, Col, Spinner, Alert, Button, Container, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import AddDeviceModal from './AddDeviceModal';
import DeviceSearchFilter from './DeviceSearchFilter';
import SummaryModal from './SummaryModal';
import '../../css/AllDevicesPage/Devices.css';
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";

function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [classificators, setClassificators] = useState({});
    const [clients, setClients] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'deviceName', direction: 'ascending' });
    const navigate = useNavigate();
    const [locationNames, setLocationNames] = useState({});

    // New states for inline editing the version
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editingVersion, setEditingVersion] = useState("");
    const [longPressTimer, setLongPressTimer] = useState(null);


    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/all`);
                const filteredDevices = response.data.filter(device => !device.writtenOffDate);
                setDevices(filteredDevices);
            } catch (error) {
                setError('Failed to load devices.');
            } finally {
                setLoading(false);
            }
        };

        const fetchClassificators = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
                const classificatorsData = {};
                response.data.forEach(classificator => {
                    classificatorsData[classificator.id] = classificator.name;
                });
                setClassificators(classificatorsData);
            } catch (error) {
                console.error("Couldn't fetch device classificators", error);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/client/all`);
                setClients(response.data);
            } catch (error) {
                console.error("Couldn't fetch clients", error);
            }
        };

        fetchDevices();
        fetchClassificators();
        fetchClients();
    }, [refresh]);

    // When devices change, fetch missing location names.
    useEffect(() => {
        // Helper function to fetch location by id
        const fetchLocationName = async (locationId) => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/${locationId}`);
                return response.data.name;
            } catch (error) {
                console.error(`Error fetching location ${locationId}:`, error);
                return 'Unknown Location';
            }
        };

        devices.forEach((device) => {
            const locationId = device.locationId;
            if (locationId && !locationNames[locationId]) {
                fetchLocationName(locationId).then((name) => {
                    setLocationNames(prev => ({ ...prev, [locationId]: name }));
                });
            }
        });
    }, [devices, locationNames]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortDevices = (devices, key, direction) => {
        const sortedDevices = [...devices];
        sortedDevices.sort((a, b) => {
            let valueA, valueB;

            if (key === 'type') {
                // Sorting by type using classificators
                valueA = classificators[a.classificatorId] || 'Unknown Type';
                valueB = classificators[b.classificatorId] || 'Unknown Type';
            } else if (key === 'location') {
                // Sorting by client name using getClientName helper
                valueA = locationNames[a.locationId] || '';
                valueB = locationNames[b.locationId] || '';
            } else {
                // Sorting by the specified key (e.g., deviceName or serialNumber)
                valueA = a[key] || ''; // Ensure value is a string
                valueB = b[key] || '';
            }

            // Sort in ascending or descending order
            if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
            if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedDevices;
    };

    // Replace getClientName with getLocationName helper
    const getLocationName = (locationId) => {
        return locationNames[locationId] || 'Loading...';
    };



    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </div>
        );
    }

    const sortedDevices = sortDevices(devices, sortConfig.key, sortConfig.direction);

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    // When the user mouses down on the version cell, start a long press timer.
    const handleVersionMouseDown = (device) => {
        const timer = setTimeout(() => {
            setEditingDeviceId(device.id);
            setEditingVersion(device.version || "");
        }, 1000); // 1 second long press
        setLongPressTimer(timer);
    };

// Cancel the timer if the mouse is released or leaves the cell.
    const handleVersionMouseUpOrLeave = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

// When the inline version input loses focus, update the device.
// This function also auto‑updates versionUpdateDate to now.
    const handleVersionUpdate = async (device) => {
        try {
            // Create an updated device object
            const updatedDevice = {
                ...device,
                version: editingVersion,
                versionUpdateDate: new Date().toISOString(), // update to current date/time
            };
            // Send update request (adjust endpoint as needed)
            await axiosInstance.put(`${config.API_BASE_URL}/device/update/${device.id}`, updatedDevice);
            // Update the local devices list (or trigger a refresh)
            setDevices((prevDevices) =>
                prevDevices.map((d) => (d.id === device.id ? updatedDevice : d))
            );
        } catch (error) {
            console.error("Error updating device version:", error);
        }
        setEditingDeviceId(null);
        setEditingVersion("");
    };



    return (
        <>
            <Container className="mt-5">
                <Row>
                    <Col>
                        <h1 className="mb-0">Devices</h1>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" className="me-2" onClick={() => setShowSummaryModal(true)}>
                            Show Summary
                        </Button>
                        <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>
                            Add Device
                        </Button>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <DeviceSearchFilter setDevices={setDevices} />
                </Row>


            {/* Table header and rows */}

                <Row className="fw-bold">
                    <Col md={3} onClick={() => handleSort('type')}>
                        Type {renderSortArrow('type')}
                    </Col>
                    <Col md={2} onClick={() => handleSort('deviceName')}>
                        Name {renderSortArrow('deviceName')}
                    </Col>
                    <Col md={3} onClick={() => handleSort('location')}>
                        Location {renderSortArrow('location')}
                    </Col>
                    <Col md={2} onClick={() => handleSort('serialNumber')}>
                        Serial Number {renderSortArrow('serialNumber')}
                    </Col>
                    <Col md={2} onClick={() => handleSort('version')}>
                        Version {renderSortArrow('version')}
                    </Col>
                </Row>
                <hr />

                {/* Device Rows */}
                {sortedDevices.length === 0 ? (
                    <Alert variant="info"> No devices found.</Alert>
                    ) : (
                sortedDevices.map((device, index) => {
                    // Get the base background color based on even/odd index
                    const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    // Retrieve the last visited device ID from localStorage
                    const lastVisitedDeviceId = localStorage.getItem("lastVisitedDeviceId");
                    // If this device is the last visited, override the background color (e.g., light yellow)
                    const rowBgColor = (device.id.toString() === lastVisitedDeviceId) ? "#ffffcc" : baseBgColor;
                    return (
                        <Row
                            key={device.id}
                            className="mb-2 py-2"
                            style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}

                        >
                            <Col md={3} onClick={() => {
                                // Store the current device's id as the last visited
                                localStorage.setItem("lastVisitedDeviceId", device.id);
                                navigate(`/device/${device.id}`, { state: { fromPath: `/devices` } });
                            }}>
                                {classificators[device.classificatorId] || 'Unknown Type'}
                            </Col>
                            <Col md={2}
                                 onClick={() => {
                                     // Store the current device's id as the last visited
                                     localStorage.setItem("lastVisitedDeviceId", device.id);
                                     navigate(`/device/${device.id}`, { state: { fromPath: `/devices` } });
                                 }}>
                                {device.deviceName}
                            </Col>
                            <Col md={3}
                                 onClick={() => {
                                     // Store the current device's id as the last visited
                                     localStorage.setItem("lastVisitedDeviceId", device.id);
                                     navigate(`/device/${device.id}`, { state: { fromPath: `/devices` } });
                                 }}>
                                {getLocationName(device.locationId)}
                            </Col>
                            <Col md={2}
                                 onClick={() => {
                                     // Store the current device's id as the last visited
                                     localStorage.setItem("lastVisitedDeviceId", device.id);
                                     navigate(`/device/${device.id}`, { state: { fromPath: `/devices` } });
                                 }}>
                                {device.serialNumber}
                            </Col>
                            <Col
                                md={2}
                                onMouseDown={() => handleVersionMouseDown(device)}
                                onMouseUp={handleVersionMouseUpOrLeave}
                                onMouseLeave={handleVersionMouseUpOrLeave}
                            >
                                {editingDeviceId === device.id ? (
                                    <Form.Control
                                        type="text"
                                        value={editingVersion}
                                        onChange={(e) => setEditingVersion(e.target.value)}
                                        onBlur={() => handleVersionUpdate(device)}
                                        autoFocus
                                    />
                                ) : (
                                    device.version || 'N/A'
                                )}
                            </Col>

                        </Row>
                    );
                })
                    )}
            </Container>

            {/* Modals */}
            <AddDeviceModal
                show={showAddDeviceModal}
                onHide={() => setShowAddDeviceModal(false)}
                setRefresh={setRefresh}
            />
            <SummaryModal
                show={showSummaryModal}
                handleClose={() => setShowSummaryModal(false)}
                devices={devices}
            />
        </>
    );
}

export default Devices;
