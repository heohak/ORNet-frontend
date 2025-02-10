import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";

const AddMaintenanceModal = ({ show, onHide, clients, selectedClientId }) => {
    const [error, setError] = useState("");
    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState(null);
    const [lastDate, setLastDate] = useState(null);
    const [clientId, setClientId] = useState(selectedClientId || "");
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState("");
    const [softwares, setSoftwares] = useState([]);
    const [devices, setDevices] = useState([]);
    const [linkedDevices, setLinkedDevices] = useState([]);

    // State for AsyncSelect dropdowns
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [selectedLinkedDevices, setSelectedLinkedDevices] = useState([]);
    const [selectedSoftwares, setSelectedSoftwares] = useState([]);

    useEffect(() => {
        if (clientId) {
            fetchLocations();
            fetchSoftwares();
        }
    }, [clientId]);

    useEffect(() => {
        if (locationId) {
            fetchDevices();
            fetchLinkedDevices();
        }
    }, [locationId]);

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`/client/locations/${clientId}`);
            setLocations(response.data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`/device/search`, { params: { locationId } });
            const sortedDevices = response.data.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
            setDevices(sortedDevices.map(device => ({value: device.id, label: device.deviceName})))
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    };

    const fetchLinkedDevices = async () => {
        try {
            const response = await axiosInstance.get(`/linked/device/search`, { params: { locationId } });
            const sortedLinkedDevices = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setLinkedDevices(sortedLinkedDevices.map(linkedDevice => ({value: linkedDevice.id, label: linkedDevice.name})))
        } catch (error) {
            console.error("Error fetching linked devices:", error);
        }
    };

    // Async loaders for react-select
    const loadDevices = async (inputValue) => {
        try {
            const response = await axiosInstance.get(`/device/search`, {
                params: {clientId, locationId, q: inputValue }
            });
            return response.data.map((device) => ({ value: device.id, label: device.deviceName }));
        } catch (error) {
            console.error("Error loading devices:", error);
            return [];
        }
    };

    const loadLinkedDevices = async (inputValue) => {
        try {
            const response = await axiosInstance.get(`/linked/device/search`, {
                params: { clientId, locationId, q: inputValue }
            });
            return response.data.map((device) => ({ value: device.id, label: device.name }));
        } catch (error) {
            console.error("Error loading linked devices:", error);
            return [];
        }
    };

    const fetchSoftwares = async() => {
        if (clientId) {
            try {
                const response = await axiosInstance.get(`/software/client/${clientId}`);
                const softwareRes = response.data.map(soft => ({value: soft.id, label: soft.name}))
                setSoftwares(softwareRes.sort((a, b) => a.label.localeCompare(b.label)));
            } catch (error) {
                console.error('Error fetching locations or contacts:', error);
            }
        }
    };

    return (
        <Modal size="xl" backdrop="static" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Maintenance</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Maintenance Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Maintenance Name"
                                    value={maintenanceName}
                                    onChange={(e) => setMaintenanceName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer</Form.Label>
                                <Select
                                    options={[...clients].sort((a, b) => a.fullName.localeCompare(b.fullName))}

                                    getOptionLabel={client => client.fullName}
                                    getOptionValue={client => client.id.toString()}
                                    value={clients.find(client => client.id === Number(clientId)) || null}
                                    onChange={selectedClient => {
                                        if (selectedClient) {
                                            setClientId(selectedClient.id);
                                        } else {
                                            setClientId("");

                                        }
                                    }}
                                    isDisabled={!!selectedClientId}
                                    isSearchable={true}
                                    placeholder={selectedClientId ? "Customer locked to selected" : "Select Customer"}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Location</Form.Label>
                                </div>
                                <Form.Control
                                    as="select"
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    id="locationId"
                                    disabled={!clientId}
                                    required
                                >
                                    {!clientId ? (
                                        <option value="">Pick a customer before picking a location</option>
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
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Planned Date</Form.Label>
                                <ReactDatePicker
                                    selected={maintenanceDate}
                                    onChange={(date) => setMaintenanceDate(date)}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select a date"
                                    isClearable
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Date</Form.Label>
                                <ReactDatePicker
                                    selected={lastDate}
                                    onChange={(date) => setLastDate(date)}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select a date"
                                    isClearable
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Label>Devices</Form.Label>
                            <AsyncSelect
                                isMulti
                                cacheOptions
                                defaultOptions
                                loadOptions={loadDevices}
                                value={selectedDevices}
                                onChange={setSelectedDevices}
                                placeholder="Search and select devices"
                            />
                        </Col>
                        <Col>
                            <Form.Label>Linked Devices</Form.Label>
                            <AsyncSelect
                                isMulti
                                cacheOptions
                                defaultOptions
                                loadOptions={loadLinkedDevices}
                                value={selectedLinkedDevices}
                                onChange={setSelectedLinkedDevices}
                                placeholder="Search and select linked devices"
                            />
                        </Col>
                        <Col>
                            <Form.Label>Softwares</Form.Label>
                            <Select
                                isMulti
                                options={softwares}
                                value={selectedSoftwares}
                                onChange={setSelectedSoftwares}
                                placeholder="Select work types"
                                required
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Enter Description"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Maintenance"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddMaintenanceModal;
