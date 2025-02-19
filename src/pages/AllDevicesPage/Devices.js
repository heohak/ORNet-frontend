import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Button, Container, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import AddDeviceModal from './AddDeviceModal';
import DeviceSearchFilter from './DeviceSearchFilter';
import SummaryModal from './SummaryModal';
import '../../css/AllDevicesPage/Devices.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from "../../config/axiosInstance";

// Custom hook to get current window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

function Devices() {
    // Call hooks at the top level (before any early returns)
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // Adjust breakpoint as needed

    const location = useLocation();
    const navigate = useNavigate();

    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [classificators, setClassificators] = useState({});
    const [clients, setClients] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'deviceName', direction: 'ascending' });
    const [locationNames, setLocationNames] = useState({});

    // States for inline editing of version
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editingVersion, setEditingVersion] = useState("");
    const [longPressTimer, setLongPressTimer] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [classificatorId, setClassificatorId] = useState("");
    const [clientId, setClientId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [writtenOff, setWrittenOff] = useState(false);
    const [searchDate, setSearchDate] = useState("");
    const [comparison, setComparison] = useState("");

    // If filters are passed via location.state, apply them
    useEffect(() => {
        if (location.state?.filters) {
            const f = location.state.filters;
            setSearchQuery(f.searchQuery || "");
            setClassificatorId(f.classificatorId || "");
            setClientId(f.clientId || "");
            setLocationId(f.locationId || "");
            setWrittenOff(f.writtenOff || false);
            setSearchDate(f.searchDate || "");
            setComparison(f.comparison || "");
        }
    }, [location.state]);

    // Fetch devices, classificators, and clients
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/all`);
                // Only show devices that are not written off
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

    // Fetch missing location names for each device
    useEffect(() => {
        const fetchLocationName = async (locId) => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/${locId}`);
                return response.data.name;
            } catch (error) {
                console.error(`Error fetching location ${locId}:`, error);
                return 'Unknown Location';
            }
        };

        devices.forEach((device) => {
            const locId = device.locationId;
            if (locId && !locationNames[locId]) {
                fetchLocationName(locId).then((name) => {
                    setLocationNames(prev => ({ ...prev, [locId]: name }));
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
                valueA = classificators[a.classificatorId] || 'Unknown Type';
                valueB = classificators[b.classificatorId] || 'Unknown Type';
            } else if (key === 'location') {
                valueA = locationNames[a.locationId] || '';
                valueB = locationNames[b.locationId] || '';
            } else {
                valueA = a[key] || '';
                valueB = b[key] || '';
            }
            if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
            if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedDevices;
    };

    const getLocationName = (locId) => {
        return locationNames[locId] || 'Loading...';
    };

    // Early returns based on loading/error should now work properly since all hooks are called above.
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

    // Inline version editing: start a long press timer to trigger editing
    const handleVersionMouseDown = (device) => {
        const timer = setTimeout(() => {
            setEditingDeviceId(device.id);
            setEditingVersion(device.version || "");
        }, 1000);
        setLongPressTimer(timer);
    };

    const handleVersionMouseUpOrLeave = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleVersionUpdate = async (device) => {
        try {
            const updatedDevice = {
                ...device,
                version: editingVersion,
                versionUpdateDate: new Date().toISOString(),
            };
            await axiosInstance.put(`${config.API_BASE_URL}/device/update/${device.id}`, updatedDevice);
            setDevices(prevDevices =>
                prevDevices.map(d => d.id === device.id ? updatedDevice : d)
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
                    <DeviceSearchFilter
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        classificatorId={classificatorId}
                        setClassificatorId={setClassificatorId}
                        clientId={clientId}
                        setClientId={setClientId}
                        locationId={locationId}
                        setLocationId={setLocationId}
                        writtenOff={writtenOff}
                        setWrittenOff={setWrittenOff}
                        searchDate={searchDate}
                        setSearchDate={setSearchDate}
                        comparison={comparison}
                        setComparison={setComparison}
                        setDevices={setDevices}
                    />
                </Row>

                {isMobile ? (
                    // Mobile view: render each device as a Card
                    sortedDevices.length === 0 ? (
                        <Alert variant="info">No devices found.</Alert>
                    ) : (
                        sortedDevices.map((device) => (
                            <Card
                                key={device.id}
                                className="mb-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    localStorage.setItem("lastVisitedDeviceId", device.id);
                                    navigate(`/device/${device.id}`, {
                                        state: {
                                            fromPath: "/devices",
                                            filters: { searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison }
                                        }
                                    });
                                }}
                            >
                                <Card.Body>
                                    <Card.Title>{device.deviceName}</Card.Title>
                                    <Card.Text>
                                        <div>
                                            <strong>Type:</strong> {classificators[device.classificatorId] || 'Unknown Type'}
                                        </div>
                                        <div>
                                            <strong>Location:</strong> {getLocationName(device.locationId)}
                                        </div>
                                        <div>
                                            <strong>Serial Number:</strong> {device.serialNumber}
                                        </div>
                                        <div>
                                            <strong>Version:</strong> {device.version || 'N/A'}
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    )
                ) : (
                    // Desktop view: render table header and rows
                    <>
                        <Row className="fw-bold">
                            <Col md={3} onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                                Type {renderSortArrow('type')}
                            </Col>
                            <Col md={2} onClick={() => handleSort('deviceName')} style={{ cursor: 'pointer' }}>
                                Name {renderSortArrow('deviceName')}
                            </Col>
                            <Col md={3} onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                                Location {renderSortArrow('location')}
                            </Col>
                            <Col md={2} onClick={() => handleSort('serialNumber')} style={{ cursor: 'pointer' }}>
                                Serial Number {renderSortArrow('serialNumber')}
                            </Col>
                            <Col md={2} onClick={() => handleSort('version')} style={{ cursor: 'pointer' }}>
                                Version {renderSortArrow('version')}
                            </Col>
                        </Row>
                        <hr />
                        {sortedDevices.length === 0 ? (
                            <Alert variant="info">No devices found.</Alert>
                        ) : (
                            sortedDevices.map((device, index) => {
                                const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                const lastVisitedDeviceId = localStorage.getItem("lastVisitedDeviceId");
                                const rowBgColor = (device.id.toString() === lastVisitedDeviceId) ? "#ffffcc" : baseBgColor;
                                return (
                                    <Row
                                        key={device.id}
                                        className="mb-2 py-2"
                                        style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                    >
                                        <Col md={3} onClick={() => {
                                            localStorage.setItem("lastVisitedDeviceId", device.id);
                                            navigate(`/device/${device.id}`, {
                                                state: {
                                                    fromPath: "/devices",
                                                    filters: { searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison }
                                                }
                                            });
                                        }}>
                                            {classificators[device.classificatorId] || 'Unknown Type'}
                                        </Col>
                                        <Col md={2} onClick={() => {
                                            localStorage.setItem("lastVisitedDeviceId", device.id);
                                            navigate(`/device/${device.id}`, {
                                                state: {
                                                    fromPath: "/devices",
                                                    filters: { searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison }
                                                }
                                            });
                                        }}>
                                            {device.deviceName}
                                        </Col>
                                        <Col md={3} onClick={() => {
                                            localStorage.setItem("lastVisitedDeviceId", device.id);
                                            navigate(`/device/${device.id}`, {
                                                state: {
                                                    fromPath: "/devices",
                                                    filters: { searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison }
                                                }
                                            });
                                        }}>
                                            {getLocationName(device.locationId)}
                                        </Col>
                                        <Col md={2} onClick={() => {
                                            localStorage.setItem("lastVisitedDeviceId", device.id);
                                            navigate(`/device/${device.id}`, {
                                                state: {
                                                    fromPath: "/devices",
                                                    filters: { searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison }
                                                }
                                            });
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
                    </>
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
