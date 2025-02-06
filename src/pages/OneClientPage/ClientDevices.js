import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import AddClientDevice from './AddClientDevice';
import { useNavigate } from 'react-router-dom';
import config from "../../config/config";
import '../../css/OneClientPage/OneClient.css';
import axiosInstance from "../../config/axiosInstance";
import {DateUtils} from "../../utils/DateUtils";

function ClientDevices({ clientId, locations }) {
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [classificatorList, setClassificatorList] = useState([]);
    const [classificators, setClassificators] = useState({});
    const [selectedClassificatorId, setSelectedClassificatorId] = useState('');
    const [writtenOff, setWrittenOff] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deviceSummary, setDeviceSummary] = useState({});
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [errorSummary, setErrorSummary] = useState(null);
    const [devices, setDevices] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'type', direction: 'descending' });
    const [lastDate, setLastDate] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassificators();
        fetchDeviceSummary();
    }, []);

    useEffect(() => {
        if (devices.length > 0) {
            getDevicesLastDate();
        }
    }, [devices.length]);

    useEffect(() => {
        fetchDevices();
        fetchClassificators();
    }, [clientId, refresh, selectedClassificatorId, searchQuery, writtenOff]);

    const getDevicesLastDate = async () => {
        if (!devices || devices.length === 0) return;

        const updatedDevices = await Promise.all(
            devices.map(async (device) => {
                try {
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/device/tickets/${device.id}`);
                    const tickets = response.data;

                    // Get the most recent ticket date
                    const ticketDates = tickets
                        .map(ticket => new Date(ticket.createdDateTime))
                        .filter(date => !isNaN(date)); // Remove invalid dates

                    const latestTicketDate = ticketDates.length > 0 ? new Date(Math.max(...ticketDates)) : null;

                    // Convert device.versionUpdateDate to Date object
                    const versionUpdateDate = device.versionUpdateDate ? new Date(device.versionUpdateDate) : null;

                    // Find the latest date between tickets and version update
                    const latestDate = [latestTicketDate, versionUpdateDate]
                        .filter(date => date instanceof Date && !isNaN(date)) // Ensure only valid dates
                        .sort((a, b) => b - a)[0] || 'No Data'; // Default to 'No Data' if no valid date

                    return { ...device, lastDate: latestDate};
                } catch (error) {
                    console.error(`Error fetching tickets for device ${device.id}:`, error);
                    return { ...device, lastDate: 'No Data' };
                }
            })
        );

        setDevices(updatedDevices);
    };




    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕'; // Default for unsorted
    };

    const fetchClassificators = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`);
            const sortedClassificators = response.data.sort((a, b) => a.name.localeCompare(b.name))
            setClassificatorList(sortedClassificators);
            const classificatorMap = response.data.reduce((acc, classificator) => {
                acc[classificator.id] = classificator.name;
                return acc;
            }, {});

            setClassificators(classificatorMap);
        } catch (error) {
            console.error('Error fetching classificators:', error);
        }
    };

    const fetchDeviceSummary = async () => {
        setLoadingSummary(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/client/summary/${clientId}`);
            setDeviceSummary(response.data);
        } catch (error) {
            setErrorSummary(error.message);
        } finally {
            setLoadingSummary(false);
        }
    };

    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    q: searchQuery,
                    classificatorId: selectedClassificatorId || null,
                    clientId: clientId,
                    writtenOff: writtenOff
                }
            });
            setDevices(response.data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const sortData = (items, key, direction) => {
        const sortedItems = [...items];

        sortedItems.sort((a, b) => {
            if (key === 'date') {
                const parseDate = (dateStr) => {
                    if (!dateStr || dateStr === 'No Data') return null;
                    // Here, assume the formatted date is parseable by Date.
                    const parsed = new Date(dateStr);
                    return isNaN(parsed) ? null : parsed;
                };

                const dateA = parseDate(a.lastDate);
                const dateB = parseDate(b.lastDate);

                // If both dates are null, consider them equal.
                if (!dateA && !dateB) return 0;
                if (!dateA) return direction === 'ascending' ? -1 : 1;
                if (!dateB) return direction === 'ascending' ? 1 : -1;

                return direction === 'ascending'
                    ? dateA - dateB
                    : dateB - dateA;
            }

            const valueA = a[key] ?? ''; // Default to empty string if undefined/null
            const valueB = b[key] ?? '';

            // Check if both values are numbers
            const isNumeric = !isNaN(valueA) && !isNaN(valueB);
            if (isNumeric) {
                return direction === 'ascending'
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            // Default to string comparison
            return direction === 'ascending'
                ? valueA.toString().localeCompare(valueB.toString())
                : valueB.toString().localeCompare(valueA.toString());
        });

        return sortedItems;
    };



    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = sortConfig.key ? sortData(devices, sortConfig.key, sortConfig.direction) : devices;

    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>
                        {'Devices'}
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>Add Device</Button>
                </Col>
            </Row>
            <Form className="mb-e" onSubmit={(e) => e.preventDefault()}>
                <Row className="row-margin-0 align-items-end">
                    <Col md={3}>
                        <Form.Group controlId="search">
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search devices..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="classificatorFilter">
                            <Form.Label>Filter by Type</Form.Label>
                            <Form.Control as="select" value={selectedClassificatorId}
                                          onChange={(e) => setSelectedClassificatorId(e.target.value)}>
                                <option value="">All Types</option>
                                {classificatorList.map((classificator) => (
                                    <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="written-off-filter">
                            <Form.Check
                                type="switch"
                                id="written-off-switch"
                                label="Written-off"
                                checked={writtenOff}
                                onChange={(e) => setWrittenOff(e.target.checked)}
                                className="mb-2"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={2} onClick={() => handleSort('classificatorId')}>
                    Type {renderSortArrow('classificatorId')}
                </Col>
                <Col md={3} onClick={() => handleSort('deviceName')}>
                    Name {renderSortArrow('deviceName')}
                </Col>
                <Col md={2} onClick={() => handleSort('locationId')}>
                    Location {renderSortArrow('locationId')}
                </Col>
                <Col md={2} onClick={() => handleSort('serialNumber')}>
                    Serial Number {renderSortArrow('serialNumber')}
                </Col>
                <Col md={1} onClick={() => handleSort('version')}>
                    Version {renderSortArrow('version')}
                </Col>
                <Col md={2} onClick={() => handleSort('date')}>
                    Last Date? {renderSortArrow('date')}
                </Col>
            </Row>
            <hr />
            {sortedData.length > 0 ? (
                sortedData.map((device, index) => {
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    return (
                        <Row
                            key={device.id}
                            className="align-items-center"
                            style={{ cursor: 'pointer', margin: "0 0" }}
                            onClick={() => navigate(`/device/${device.id}`)}
                        >
                            <Col className="py-2" style={{ backgroundColor: rowBgColor }}>
                                <Row className="align-items-center">
                                    <Col md={2}>{classificators[device.classificatorId] || 'Unknown Type'}</Col>
                                    <Col md={3}>{device.deviceName}</Col>
                                    <Col md={2}>{locations[device.locationId] || 'Unknown'}</Col>
                                    <Col md={2}>{device.serialNumber}</Col>
                                    <Col md={1}>{device.version}</Col>
                                    <Col md={2}>{DateUtils.formatDate(device.lastDate)}</Col>
                                </Row>
                            </Col>
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">No devices available.</Alert>
            )}

            <h3 className="mt-2">Device Summary</h3>
            {loadingSummary ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : errorSummary ? (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{errorSummary}</p>
                </Alert>
            ) : (
                <ListGroup className="mt-3">
                    {Object.keys(deviceSummary).map(key => (
                        <ListGroup.Item key={key}>
                            {key}: {deviceSummary[key]}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Render AddClientDevice component when needed */}
            {showAddDeviceModal && (
                <AddClientDevice
                    clientId={clientId}
                    onClose={() => setShowAddDeviceModal(false)}
                    setRefresh={setRefresh}
                />
            )}
        </>
    );
}

export default ClientDevices;