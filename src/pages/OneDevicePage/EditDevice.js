// EditDevice.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import config from "../../config/config";
import { format } from 'date-fns';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreatableSelect from "react-select/creatable";
import axiosInstance from "../../config/axiosInstance";
import DeviceStatusManager from "./DeviceStatusManager";


function EditDevice({ deviceId, onClose, setRefresh, introducedDate, writtenOffDate }) {
    const [show, setShow] = useState(true);
    const [deviceData, setDeviceData] = useState({
        deviceName: '',
        clientId: '',
        locationId: '',
        classificatorId: '',
        department: '',
        room: '',
        serialNumber: '',
        licenseNumber: '',
        version: '',
        versionUpdateDate: null,
        firstIPAddress: '',
        secondIPAddress: '',
        subnetMask: '',
        softwareKey: '',
        introducedDate: null,
        workstationNo: '',
        cameraNo: '',
        otherNo: '',
        attributes: {} // Initialize attributes here
    });
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [classificators, setClassificators] = useState([]);
    const [error, setError] = useState(null);
    const [predefinedDeviceNames, setPredefinedDeviceNames] = useState([]);


    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/device/${deviceId}`);
                const data = response.data;
                // Convert date strings to Date objects
                const versionUpdateDate = data.versionUpdateDate ? new Date(data.versionUpdateDate) : null;
                const introducedDate = data.introducedDate ? new Date(data.introducedDate) : null;
                setDeviceData({
                    ...data,
                    versionUpdateDate,
                    introducedDate,
                    workstationNo: data.workstationNo || '',
                    cameraNo: data.cameraNo || '',
                    otherNo: data.otherNo || '',
                });
            } catch (error) {
                setError(error.message);
            }
        };


        const fetchDropdownData = async () => {
            try {
                const [clientsResponse, classificatorsResponse] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/client/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`),
                ]);
                setClients(clientsResponse.data);
                setClassificators(classificatorsResponse.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDeviceData();
        fetchDropdownData();
        fetchPredefinedDeviceNames();
    }, [deviceId]);


    useEffect(() => {
        const fetchLocations = async () => {
            if (deviceData.clientId) {
                try {
                    const locationRes = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${deviceData.clientId}`);
                    setLocations(locationRes.data);
                } catch (error) {
                    console.error('Error fetching locations:', error);
                }
            }
        };

        fetchLocations();
    }, [deviceData.clientId]);

    const fetchPredefinedDeviceNames = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/predefined/names`);
            // Assuming response.data is an array of objects { name: '...' }
            const options = response.data
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => ({ value: item.name, label: item.name }));
            setPredefinedDeviceNames(options);
        } catch (error) {
            console.error('Error fetching predefined device names:', error);
            setError(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeviceData((prevState) => {
            const newState = { ...prevState, [name]: value };
            // If the version field is changed, automatically update versionUpdateDate to now
            if (name === "version") {
                newState.versionUpdateDate = new Date();
            }
            return newState;
        });
    };


    // Handle change for attributes
    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        setDeviceData(prevState => ({
            ...prevState,
            attributes: {
                ...prevState.attributes,
                [name]: value
            }
        }));
    };

    const handleDeviceNameChange = (selectedOption) => {
        setDeviceData((prevState) => ({
            ...prevState,
            deviceName: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedDeviceData = {
                ...deviceData,
                versionUpdateDate: deviceData.versionUpdateDate ? format(deviceData.versionUpdateDate, 'yyyy-MM-dd') : null,
                introducedDate: deviceData.introducedDate ? format(deviceData.introducedDate, 'yyyy-MM-dd') : null,
                    workstationNo: deviceData.workstationNo,
                    cameraNo: deviceData.cameraNo,
                   otherNo: deviceData.otherNo,
            };

            await axiosInstance.put(`${config.API_BASE_URL}/device/update/${deviceId}`, updatedDeviceData);
            if (setRefresh) {
                setRefresh(prev => !prev);
            }
            handleClose();
        } catch (error) {
            setError(error.message);
        }
    };


    const handleClose = () => {
        setShow(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            <Modal backdrop="static" show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        {/* Device Type and Device Name */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Device Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="classificatorId"
                                        value={deviceData.classificatorId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {classificators.map(classificator => (
                                            <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Device Name</Form.Label>
                                    <CreatableSelect
                                        isClearable
                                        onChange={handleDeviceNameChange}
                                        options={predefinedDeviceNames}
                                        placeholder="Select or type device name"
                                        value={deviceData.deviceName ? { value: deviceData.deviceName, label: deviceData.deviceName } : null}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Customer and Location */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Customer</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="clientId"
                                        value={deviceData.clientId}
                                        onChange={handleInputChange}
                                        disabled
                                    >
                                        <option value="">Select Customer</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.fullName}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="locationId"
                                        value={deviceData.locationId}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!deviceData.clientId}
                                    >
                                        {!deviceData.clientId ? (
                                            <option value="">Pick a Customer before picking a location</option>
                                        ) : (
                                            <>
                                                <option value="">Select Location</option>
                                                {locations.map(location => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Department and Room */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="department"
                                        value={deviceData.department}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Room</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="room"
                                        value={deviceData.room}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Serial Number and License Number */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="serialNumber"
                                        value={deviceData.serialNumber}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="licenseNumber"
                                        value={deviceData.licenseNumber}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Version and Software Key */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="version"
                                        value={deviceData.version}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Software Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="softwareKey"
                                        value={deviceData.softwareKey}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>



                        {/* Version Update Date and Introduced Date */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Version Update Date</Form.Label>
                                    <ReactDatePicker
                                        selected={deviceData.versionUpdateDate}
                                        onChange={(date) => setDeviceData({ ...deviceData, versionUpdateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select Version Update Date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Form.Group>

                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Introduced Date</Form.Label>
                                    <ReactDatePicker
                                        selected={deviceData.introducedDate}
                                        onChange={(date) => setDeviceData({ ...deviceData, introducedDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select Introduced Date"
                                        maxDate={new Date()}
                                        isClearable
                                        required
                                    />
                                </Form.Group>

                            </Col>
                        </Row>

                        {/* First IP Address, Second IP Address, Subnet Mask */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>First IP Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstIPAddress"
                                        value={deviceData.firstIPAddress}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Second IP Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="secondIPAddress"
                                        value={deviceData.secondIPAddress}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Subnet Mask</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="subnetMask"
                                        value={deviceData.subnetMask}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>


                         {/* Workstation No, Camera No, Other No */}
                         <Row className="mb-3">
                           <Col md={4}>
                             <Form.Group>
                               <Form.Label>Workstation No</Form.Label>
                               <Form.Control
                                 type="text"
                                 name="workstationNo"
                                 value={deviceData.workstationNo}
                                 onChange={handleInputChange}
                               />
                             </Form.Group>
                           </Col>
                           <Col md={4}>
                           <Form.Group>
                               <Form.Label>Camera No</Form.Label>
                               <Form.Control
                                 type="text"
                                 name="cameraNo"
                                 value={deviceData.cameraNo}
                                 onChange={handleInputChange}
                               />
                             </Form.Group>
                           </Col>
                          <Col md={4}>
                             <Form.Group>
                               <Form.Label>Other No</Form.Label>
                               <Form.Control
                                 type="text"
                                 name="otherNo"
                                 value={deviceData.otherNo}
                                 onChange={handleInputChange}
                               />
                             </Form.Group>
                           </Col>
                         </Row>


                        {/* Dynamic Fields for Attributes */}
                        {Object.keys(deviceData.attributes || {}).map((attrKey) => (
                            <Form.Group className="mb-3" key={attrKey}>
                                <Form.Label>{attrKey}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name={attrKey}
                                    value={deviceData.attributes[attrKey]}
                                    onChange={handleAttributeChange}
                                />
                            </Form.Group>
                        ))}

                        <Modal.Footer>
                            <Button variant="outline-info" onClick={handleClose}>Cancel</Button>
                            {/* Render DeviceStatusManager next to Cancel */}
                            <DeviceStatusManager
                                deviceId={deviceId}
                                introducedDate={introducedDate}
                                writtenOffDate={writtenOffDate}
                                setRefresh={setRefresh}
                            />
                            <Button variant="primary" type="submit">Save Changes</Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default EditDevice;
