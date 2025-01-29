import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/OneClientPage/AddActivityModal.css';
import '../../css/DarkenedModal.css';
import CreatableSelect from 'react-select/creatable';


import { format } from 'date-fns';
import axiosInstance from "../../config/axiosInstance";

function AddClientDevice({ clientId, onClose, setRefresh }) {

    const [deviceName, setDeviceName] = useState('');
    const [department, setDepartment] = useState('');
    const [room, setRoom] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [version, setVersion] = useState('');
    const [versionUpdateDate, setVersionUpdateDate] = useState(null);
    const [firstIPAddress, setFirstIPAddress] = useState('');
    const [secondIPAddress, setSecondIPAddress] = useState('');
    const [subnetMask, setSubnetMask] = useState('');
    const [deviceClassificatorId, setDeviceClassificatorId] = useState('');
    const [softwareKey, setSoftwareKey] = useState('');
    const [introducedDate, setIntroducedDate] = useState(null);
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState('');
    const [classificators, setClassificators] = useState([]);
    const [showClassificatorModal, setShowClassificatorModal] = useState(false);
    const [newClassificator, setNewClassificator] = useState('');
    const [showIPFields, setShowIPFields] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingClassificator, setIsSubmittingClassificator] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [predefinedDeviceNames, setPredefinedDeviceNames] = useState([]);

    // New states
    const [workstationNo, setWorkstationNo] = useState('');
    const [cameraNo, setCameraNo] = useState('');
    const [otherNo, setOtherNo] = useState('');
    const [showCameraOtherFields, setShowCameraOtherFields] = useState(false);


    useEffect(() => {
        fetchData();
        fetchPredefinedDeviceNames();
    }, []);


    const fetchData = async () => {
        try {
            const [locationsRes, classificatorsRes] = await Promise.all([
                axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`),
                axiosInstance.get(`${config.API_BASE_URL}/device/classificator/all`)
            ]);
            const sortedLocations = locationsRes.data.sort((a, b) => a.name.localeCompare(b.name))
            setLocations(sortedLocations);

            const sortedClassificators = classificatorsRes.data.sort((a, b) => a.name.localeCompare(b.name))
            setClassificators(sortedClassificators)
        } catch (error) {
            setError(error.message);
        }
    };
    const fetchPredefinedDeviceNames = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/predefined/names`);
            // Map the data to the format expected by react-select
            const options = response.data.map((name) => ({
                value: name.name,
                label: name.name,
            }));
            setPredefinedDeviceNames(options);
        } catch (error) {
            console.error('Error fetching predefined device names:', error);
            setError(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            setIsSubmitting(false);
            return;
        }

        try {
            const formattedVersionUpdateDate = versionUpdateDate ? format(versionUpdateDate, 'yyyy-MM-dd') : null;
            const formattedIntroducedDate = introducedDate ? format(introducedDate, 'yyyy-MM-dd') : null;

            const deviceResponse = await axiosInstance.post(`${config.API_BASE_URL}/device/add`, {
                clientId,
                locationId,
                deviceName,
                department,
                room,
                serialNumber,
                licenseNumber,
                version,
                versionUpdateDate: formattedVersionUpdateDate,
                firstIPAddress,
                secondIPAddress,
                subnetMask,
                softwareKey,
                introducedDate: formattedIntroducedDate,
                workstationNo,
                cameraNo,
                otherNo
            });

            const deviceId = deviceResponse.data.token;

            if (deviceClassificatorId) {
                await axiosInstance.put(`${config.API_BASE_URL}/device/classificator/${deviceId}/${deviceClassificatorId}`);
            }

            setRefresh(prev => !prev);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClassificator = async () => {

        if (isSubmittingClassificator || !newClassificator.trim()) return;
        setIsSubmittingClassificator(true);

        if (newClassificator.trim() === '') {
            setError('Please enter a valid Type name.');
            setIsSubmittingClassificator(false);
            return;
        }

        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/device/classificator/add`, {
                name: newClassificator,
            });

            const addedClassificator = response.data;

            // Update the classificators state instantly and select the new classificator
            setClassificators(prevClassificators => [...prevClassificators, addedClassificator]);
            setDeviceClassificatorId(addedClassificator.id);
            setNewClassificator('');

            // Perform a silent refresh to ensure all data is up-to-date
            await fetchData();
            setShowClassificatorModal(false);
        } catch (error) {
            setError('Error adding Type (classificator).');
        } finally {
            setRefresh(prev => !prev);
            setIsSubmittingClassificator(false);
        }
    };

    return (
        <>
            <Modal
                show={true}
                onHide={onClose}
                backdrop="static"
                size="lg"
                dialogClassName={showClassificatorModal ? 'dimmed' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        {/* Device Type and Device Name */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Label className="mb-0">Device Type</Form.Label>
                                        <Button
                                            variant="link"
                                            onClick={() => setShowClassificatorModal(true)}
                                            className="text-primary px-0 py-0 mb-0 ms-2"
                                        >
                                            Add New
                                        </Button>
                                    </div>
                                    <Form.Control
                                        as="select"
                                        value={deviceClassificatorId}
                                        onChange={(e) => setDeviceClassificatorId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {classificators.map(classificator => (
                                            <option key={classificator.id} value={classificator.id}>
                                                {classificator.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Device Name</Form.Label>
                                    <CreatableSelect
                                        isClearable
                                        onChange={(selectedOption) => setDeviceName(selectedOption ? selectedOption.value : '')}
                                        options={predefinedDeviceNames}
                                        placeholder="Select or type device name"
                                        value={deviceName ? { value: deviceName, label: deviceName } : null}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Location and Department */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Select
                                        isClearable
                                        options={locations.map(location => ({ value: location.id, label: location.name }))}
                                        value={locations.find(loc => loc.value === locationId)}
                                        onChange={(selectedOption) => setLocationId(selectedOption ? selectedOption.value : '')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Room and Serial Number */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Room</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Room"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Serial Number"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        required
                                        pattern="\d+"
                                        title="Serial number should only contain numbers"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* License Number and Version */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter License Number"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Version"
                                        value={version}
                                        onChange={(e) => setVersion(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Software Key & Workstation No */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Software Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Software Key"
                                        value={softwareKey}
                                        onChange={(e) => setSoftwareKey(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Workstation No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Workstation Number"
                                        value={workstationNo}
                                        onChange={(e) => setWorkstationNo(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Version Update Date & Introduced Date */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Version Update Date</Form.Label>
                                    <ReactDatePicker
                                        selected={versionUpdateDate}
                                        onChange={(date) => setVersionUpdateDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select a date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Introduced Date</Form.Label>
                                    <ReactDatePicker
                                        selected={introducedDate}
                                        onChange={(date) => setIntroducedDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select a date"
                                        maxDate={new Date()}
                                        isClearable
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Assign IP Addresses Checkbox */}
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Assign IP Addresses"
                                checked={showIPFields}
                                onChange={() => setShowIPFields(!showIPFields)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Add Camera No & Other No"
                                checked={showCameraOtherFields}
                                onChange={() => setShowCameraOtherFields(!showCameraOtherFields)}
                            />
                        </Form.Group>


                        {/* IP Address Fields */}
                        {showIPFields && (
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>First IP Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter First IP Address"
                                            value={firstIPAddress}
                                            onChange={(e) => setFirstIPAddress(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Second IP Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Second IP Address"
                                            value={secondIPAddress}
                                            onChange={(e) => setSecondIPAddress(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Subnet Mask</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Subnet Mask"
                                            value={subnetMask}
                                            onChange={(e) => setSubnetMask(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        {showCameraOtherFields && (
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Camera No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Camera Number"
                                            value={cameraNo}
                                            onChange={(e) => setCameraNo(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Other No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Other Number"
                                            value={otherNo}
                                            onChange={(e) => setOtherNo(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}


                        <Modal.Footer>
                            <Button variant="outline-info" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Device'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Add Type Modal */}
            <Modal show={showClassificatorModal} backdrop="static" onHide={() => setShowClassificatorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Device Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Device Type</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Device Type"
                            value={newClassificator}
                            onChange={(e) => setNewClassificator(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowClassificatorModal(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleAddClassificator}
                        disabled={isSubmittingClassificator}
                    >
                        {isSubmittingClassificator ? 'Adding...' : 'Add Type'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddClientDevice;
