import React, { useEffect, useState, useRef } from 'react';
import {
    Row,
    Col,
    Spinner,
    Alert,
    Button,
    Container,
    Form,
    Card,
    Collapse
} from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';
import AddDeviceModal from './AddDeviceModal';
import DeviceSearchFilter from './DeviceSearchFilter';
import SummaryModal from './SummaryModal';
import '../../css/AllDevicesPage/Devices.css';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
    const navigate = useNavigate();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    // Data states
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classificators, setClassificators] = useState({});
    const [clients, setClients] = useState([]);
    const [locationNames, setLocationNames] = useState({});

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [classificatorId, setClassificatorId] = useState("");
    const [clientId, setClientId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [writtenOff, setWrittenOff] = useState(false);
    const [searchDate, setSearchDate] = useState("");
    const [comparison, setComparison] = useState("");

    // Skip first render when saving filters
    const firstRender = useRef(true);

    // Local triggers
    const [refresh, setRefresh] = useState(false);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: 'deviceName', direction: 'ascending' });

    // Inline editing for version
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editingVersion, setEditingVersion] = useState("");
    const [longPressTimer, setLongPressTimer] = useState(null);

    // -------------------- Load Filters from localStorage on mount --------------------
    useEffect(() => {
        const savedFilters = localStorage.getItem("deviceFilters");
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                setSearchQuery(parsed.searchQuery || "");
                setClassificatorId(parsed.classificatorId || "");
                setClientId(parsed.clientId || "");
                setLocationId(parsed.locationId || "");
                setWrittenOff(parsed.writtenOff || false);
                setSearchDate(parsed.searchDate || "");
                setComparison(parsed.comparison || "");
            } catch (err) {
                console.error("Error parsing deviceFilters from localStorage:", err);
            }
        }
    }, []);

    // -------------------- Save Filters to localStorage whenever they change --------------------
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const filters = {
            searchQuery,
            classificatorId,
            clientId,
            locationId,
            writtenOff,
            searchDate,
            comparison
        };
        localStorage.setItem("deviceFilters", JSON.stringify(filters));
    }, [searchQuery, classificatorId, clientId, locationId, writtenOff, searchDate, comparison]);

    // -------------------- Clear Filters Button --------------------
    const handleClearFilters = () => {
        setSearchQuery("");
        setClassificatorId("");
        setClientId("");
        setLocationId("");
        setWrittenOff(false);
        setSearchDate("");
        setComparison("");
        localStorage.removeItem("deviceFilters");
    };

    // -------------------- Fetch Data on Mount/Refresh --------------------
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/all`);
                // Filter out written-off devices
                const filteredDevices = response.data.filter(device => !device.writtenOffDate);
                setDevices(filteredDevices);
            } catch (err) {
                setError("Failed to load devices.");
            } finally {
                setLoading(false);
            }
        };

        const fetchClassificators = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
                const map = {};
                response.data.forEach(c => {
                    map[c.id] = c.name;
                });
                setClassificators(map);
            } catch (err) {
                console.error("Couldn't fetch device classificators", err);
            }
        };

        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/client/all`);
                setClients(response.data);
            } catch (err) {
                console.error("Couldn't fetch clients", err);
            }
        };

        fetchDevices();
        fetchClassificators();
        fetchClients();
    }, [refresh]);

    // -------------------- Fetch missing location names --------------------
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

        devices.forEach(device => {
            const locId = device.locationId;
            if (locId && !locationNames[locId]) {
                fetchLocationName(locId).then(name => {
                    setLocationNames(prev => ({ ...prev, [locId]: name }));
                });
            }
        });
    }, [devices, locationNames]);

    // -------------------- Sorting Logic --------------------
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortDevices = (devs, key, direction) => {
        const sorted = [...devs];
        sorted.sort((a, b) => {
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
        return sorted;
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const getLocationName = (locId) => {
        return locationNames[locId] || 'Loading...';
    };

    // -------------------- Inline Editing for Version --------------------
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
            setDevices(prev => prev.map(d => (d.id === device.id ? updatedDevice : d)));
        } catch (error) {
            console.error("Error updating device version:", error);
        }
        setEditingDeviceId(null);
        setEditingVersion("");
    };

    const sortedDevices = sortDevices(devices, sortConfig.key, sortConfig.direction);
    const lastVisitedDeviceId = localStorage.getItem("lastVisitedDeviceId");

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

    return (
        <>
            <Container className="mt-5">
                {/* Header Row */}
                {isMobile ? (
                    <Row className="d-flex justify-content-between align-items-center mb-4">
                        <Col xs="auto">
                            <h1 className="mb-0">Devices</h1>
                        </Col>
                        <Col xs="auto" className="text-end">
                            <Button variant="primary" className="me-2" onClick={() => setShowSummaryModal(true)}>
                                Summary
                            </Button>
                            <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>
                                Add Device
                            </Button>
                        </Col>
                    </Row>
                ) : (
                    <Row className="d-flex justify-content-between align-items-center mb-4">
                        <Col xs="auto">
                            <h1 className="mb-0">Devices</h1>
                        </Col>
                        <Col xs="auto" className="text-end">
                            <Button variant="outline-secondary" onClick={handleClearFilters} className="me-2">
                                Clear Filters
                            </Button>
                            <Button variant="primary" className="me-2" onClick={() => setShowSummaryModal(true)}>
                                Show Summary
                            </Button>
                            <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>
                                Add Device
                            </Button>
                        </Col>
                    </Row>
                )}

                {/* Filters */}
                {isMobile ? (
                    <>
                        <Row className="mb-3 align-items-center">
                            <Col className="align-items-center">
                                {/* Render collapsed search input */}
                                <DeviceSearchFilter
                                    collapsed
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
                            </Col>
                            <Col xs="auto" className="d-flex align-items-center">
                                <Button variant="outline-secondary" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                                    <FaFilter style={{ marginRight: '0.5rem' }} />
                                    {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
                                </Button>
                            </Col>
                        </Row>
                        <Collapse in={showMobileFilters}>
                            <div className="mb-3" style={{ padding: '0 1rem' }}>
                                {/* Render advanced filters without duplicating the search input */}
                                <DeviceSearchFilter
                                    advancedOnly
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
                                {/* Clear Filters button inside the dropdown */}
                                <Row className="mt-2">
                                    <Col>
                                        <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
                                            Clear Filters
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Collapse>
                    </>
                ) : (
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
                )}

                {/* Devices Listing */}
                {isMobile ? (
                    loading ? (
                        <Row className="justify-content-center">
                            <Col md={2} className="text-center">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </Col>
                        </Row>
                    ) : sortedDevices.length === 0 ? (
                        <Alert variant="info">No devices found.</Alert>
                    ) : (
                        sortedDevices.map((device) => (
                            <Card
                                key={device.id}
                                className="mb-3"
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor:
                                        device.id.toString() === lastVisitedDeviceId ? "#ffffcc" : "inherit"
                                }}
                                onClick={() => {
                                    localStorage.setItem("lastVisitedDeviceId", device.id);
                                    navigate(`/device/${device.id}`, {
                                        state: { fromPath: "/devices" }
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
                                            <strong>Version:</strong>{" "}
                                            <div
                                                onMouseDown={(e) => { e.preventDefault(); handleVersionMouseDown(device); }}
                                                onMouseUp={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                onMouseLeave={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                onTouchStart={(e) => { e.preventDefault(); handleVersionMouseDown(device); }}
                                                onTouchEnd={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                onTouchCancel={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {editingDeviceId === device.id ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={editingVersion}
                                                        onChange={(e) => setEditingVersion(e.target.value)}
                                                        onBlur={() => handleVersionUpdate(device)}
                                                        autoFocus
                                                        style={{ display: 'inline-block', width: 'auto' }}
                                                    />
                                                ) : (
                                                    device.version || 'N/A'
                                                )}
                                            </div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    )
                ) : (
                    <>
                        {loading ? (
                            <Row className="justify-content-center">
                                <Col md={2} className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </Col>
                            </Row>
                        ) : (
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
                                {!loading && sortedDevices.length === 0 ? (
                                    <Alert variant="info">No devices found.</Alert>
                                ) : (
                                    sortedDevices.map((device, index) => {
                                        const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                        const rowBgColor = device.id.toString() === lastVisitedDeviceId ? "#ffffcc" : baseBgColor;
                                        return (
                                            <Row
                                                key={device.id}
                                                className="mb-2 py-2"
                                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                                onClick={() => {
                                                    localStorage.setItem("lastVisitedDeviceId", device.id);
                                                    navigate(`/device/${device.id}`, { state: { fromPath: "/devices" } });
                                                }}
                                            >
                                                <Col md={3}>
                                                    {classificators[device.classificatorId] || 'Unknown Type'}
                                                </Col>
                                                <Col md={2}>
                                                    {device.deviceName}
                                                </Col>
                                                <Col md={3}>
                                                    {getLocationName(device.locationId)}
                                                </Col>
                                                <Col md={2}>
                                                    {device.serialNumber}
                                                </Col>
                                                <Col
                                                    md={2}
                                                    onMouseDown={(e) => { e.preventDefault(); handleVersionMouseDown(device); }}
                                                    onMouseUp={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                    onMouseLeave={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                    onTouchStart={(e) => { e.preventDefault(); handleVersionMouseDown(device); }}
                                                    onTouchEnd={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                    onTouchCancel={(e) => { e.preventDefault(); handleVersionMouseUpOrLeave(); }}
                                                    onClick={(e) => e.stopPropagation()}
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
