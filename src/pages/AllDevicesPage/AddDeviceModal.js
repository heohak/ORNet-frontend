import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Modal, Form, Button, Alert, Col, Row} from 'react-bootstrap';
import config from "../../config/config";
import AddClassificatorModal from "./AddDeviceModals/AddClassificatorModal";
import AddLocationModal from "../TicketsPage/AddTicketModal/AddLocationModal"; // Using the modal from ticketPage
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/OneClientPage/AddActivityModal.css';
import '../../css/DarkenedModal.css';
import { format } from 'date-fns';
import CreatableSelect from 'react-select/creatable';


function AddDeviceModal({ show, onHide, setRefresh }) {
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
    const [locationId, setLocationId] = useState('');
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [classificators, setClassificators] = useState([]);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);
    const [showAddClassificatorModal, setShowAddClassificatorModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showIPFields, setShowIPFields] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predefinedDeviceNames, setPredefinedDeviceNames] = useState([]);



    const resetForm = () => {
        setDeviceName('');
        setDepartment('');
        setRoom('');
        setSerialNumber('');
        setLicenseNumber('');
        setVersion('');
        setVersionUpdateDate('');
        setFirstIPAddress('');
        setSecondIPAddress('');
        setSubnetMask('');
        setDeviceClassificatorId('');
        setSoftwareKey('');
        setIntroducedDate('');
        setLocationId('');
        setClientId('');
        setError(null);
    };

    const sortFunction = (listOfObjects, type) => {
        if (type === "Client") {
            return listOfObjects.sort((a, b) => a.shortName.localeCompare(b.shortName))
        } else {
        return listOfObjects.sort((a, b) => a.name.localeCompare(b.name)) // works if the objects have name
        }
    }

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/all`);
                const sortedClients = sortFunction(response.data, "Client")
                setClients(sortedClients);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchClassificators = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
                const sortedClassificators = sortFunction(response.data, "Classificator")
                setClassificators(sortedClassificators);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchPredefinedDeviceNames = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/predefined/names`);
                const sortedPreDeviceNames = sortFunction(response.data, "PreDeviceName")
                // Map the data to the format expected by react-select
                const options = sortedPreDeviceNames.map((name) => ({
                    value: name.name,
                    label: name.name,
                }));
                setPredefinedDeviceNames(options);
            } catch (error) {
                console.error('Error fetching predefined device names:', error);
                setError(error.message);
            }
        };

        fetchClients();
        fetchClassificators();
        fetchPredefinedDeviceNames();
    }, []);



    const fetchLocations = async () => {
        if (clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
                const sortedLocations = sortFunction(response.data, "Location")
                setLocations(sortedLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        }
    };
    useEffect(() => {

        fetchLocations();
    },[clientId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        setError(null);

        if (!deviceName || !serialNumber.match(/^\d+$/)) {
            setError("Please provide a valid device name and serial number (only numbers).");
            setIsSubmitting(false); // Reset isSubmitting
            return;
        }

        try {
            const formattedVersionUpdateDate = versionUpdateDate ? format(versionUpdateDate, 'yyyy-MM-dd') : null;
            const formattedIntroducedDate = introducedDate ? format(introducedDate, 'yyyy-MM-dd') : null;

            const deviceResponse = await axios.post(`${config.API_BASE_URL}/device/add`, {
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
            });

            const deviceId = deviceResponse.data.token; // Assuming the response contains the new device's ID

            if (deviceClassificatorId) {
                await axios.put(`${config.API_BASE_URL}/device/classificator/${deviceId}/${deviceClassificatorId}`);
            }

            setRefresh(prev => !prev); // Trigger refresh by toggling state
            resetForm();
            onHide(); // Close the modal after adding the device
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClassificatorAdded = (newClassificator) => {
        setClassificators((prev) => {
            // Combine the existing classificators with the new one
            const updatedClassificators = [...prev, newClassificator];
            // Sort the classificators using the sortFunction
            return sortFunction(updatedClassificators, "Classificator");
        });
        setDeviceClassificatorId(newClassificator.id);
    };

    const handleLocationAdded = (addedLocation) => {
        setLocations((prev) => {
            // Combine the existing classificators with the new one
            const updatedLocations = [...prev, addedLocation];
            // Sort the classificators using the sortFunction
            return sortFunction(updatedLocations);
        });
        setLocationId(addedLocation.id); // Optionally select the new location
    };


    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="lg"
                dialogClassName={showAddClassificatorModal || showLocationModal ? 'dimmed' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Device</Modal.Title>
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
                                            onClick={() => setShowAddClassificatorModal(true)}
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

                        {/* Customer and Location */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Customer</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Customer</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.shortName}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Label className="mb-0">Location</Form.Label>
                                        {clientId && (
                                            <Button
                                                variant="link"
                                                onClick={() => setShowLocationModal(true)}
                                                className="text-primary px-0 py-0 mb-0 ms-2"
                                            >
                                                Add New
                                            </Button>
                                        )}
                                    </div>
                                    <Form.Control
                                        as="select"
                                        value={locationId}
                                        onChange={(e) => setLocationId(e.target.value)}
                                        required
                                        disabled={!clientId}
                                    >
                                        {!clientId ? (
                                            <option value="">Pick a customer before selecting a location</option>
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
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Room</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
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
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        required
                                        pattern="\d+"
                                        title="Serial number should only contain numbers"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Version, Version Update Date, Software Key */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={version}
                                        onChange={(e) => setVersion(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Version Update Date</Form.Label>
                                    <ReactDatePicker
                                        selected={versionUpdateDate}
                                        onChange={(date) => setVersionUpdateDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select Update Date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Software Key</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={softwareKey}
                                        onChange={(e) => setSoftwareKey(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Introduced Date */}
                        <Form.Group className="mb-3">
                            <Form.Label>Introduced Date</Form.Label>
                            <ReactDatePicker
                                selected={introducedDate}
                                onChange={(date) => setIntroducedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Introduced Date"
                                maxDate={new Date()}
                                isClearable
                                required
                            />
                        </Form.Group>

                        {/* IP Address Fields */}
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Assign IP Addresses"
                                checked={showIPFields}
                                onChange={() => setShowIPFields(!showIPFields)}
                            />
                        </Form.Group>
                        {showIPFields && (
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>First IP Address</Form.Label>
                                        <Form.Control
                                            type="text"
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
                                            value={subnetMask}
                                            onChange={(e) => setSubnetMask(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Modal.Footer>
                            <Button variant="outline-info" onClick={onHide}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Device'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modals for adding classificator and location */}
            <AddClassificatorModal
                show={showAddClassificatorModal}
                onHide={() => setShowAddClassificatorModal(false)}
                onClassificatorAdded={handleClassificatorAdded}
            />
            <AddLocationModal
                show={showLocationModal}
                onHide={() => setShowLocationModal(false)}
                onAdd={handleLocationAdded}
            />
        </>
    );
}

export default AddDeviceModal;
