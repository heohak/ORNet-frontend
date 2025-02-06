import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Button, Container } from 'react-bootstrap';
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
            } else if (key === 'clientName') {
                // Sorting by client name using getClientName helper
                valueA = getClientName(a.clientId);
                valueB = getClientName(b.clientId);
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


    const getClientName = (clientId) => {
        const client = clients.find(client => client.id === clientId);
        return client ? client.shortName : 'Unknown Customer';
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
                    <Col md={3} onClick={() => handleSort('clientName')}>
                        Customer {renderSortArrow('clientName')}
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
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    return (
                        <Row
                            key={device.id}
                            className="mb-2 py-2"
                            style={{ backgroundColor: rowBgColor, cursor: 'pointer'}}
                            onClick={() => navigate(`/device/${device.id}`, {state: {fromPath: `/devices`}})}
                        >
                            <Col md={3}>{classificators[device.classificatorId] || 'Unknown Type'}</Col>
                            <Col md={2}>{device.deviceName}</Col>
                            <Col md={3}>{getClientName(device.clientId)}</Col>
                            <Col md={2}>{device.serialNumber}</Col>
                            <Col md={2}>{device.version || 'N/A'}</Col>
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
