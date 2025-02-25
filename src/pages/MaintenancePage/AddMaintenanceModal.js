import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axiosInstance from "../../config/axiosInstance";
import {formatLocalDate, parseLocalDate} from "../../utils/DateUtils";

const AddMaintenanceModal = ({ show, onHide, clients, selectedClientId, workers, setRefresh, onAdd }) => {
    const [error, setError] = useState("");
    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState(null);
    const [lastDate, setLastDate] = useState(null);
    const [clientId, setClientId] = useState(selectedClientId || "");
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState("");
    const [softwares, setSoftwares] = useState([]); // array of { value, label } for all software
    const [devices, setDevices] = useState([]);    // array of { value, label } for all devices
    const [linkedDevices, setLinkedDevices] = useState([]); // array of { value, label }
    const [selectedWorkerId, setSelectedWorkerId] = useState("");

    // Multi-select states
    const [selectedDevices, setSelectedDevices] = useState([]);         // selected devices
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
            fetchLastDate();
        }
    }, [locationId]);

    // Fetch all locations for the chosen client
    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`/client/locations/${clientId}`);
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setLocations(sorted);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    // Fetch all devices for the chosen location
    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`/device/search`, { params: { locationId } });
            const sorted = response.data.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
            // Convert to { value, label } format
            const mapped = sorted.map(device => ({
                value: device.id,
                label: device.deviceName
            }));
            setDevices(mapped);
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    };

    // Fetch all linked devices for the chosen location
    const fetchLinkedDevices = async () => {
        try {
            const response = await axiosInstance.get(`/linked/device/search`, { params: { locationId } });
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
            const mapped = sorted.map(linkedDevice => ({
                value: linkedDevice.id,
                label: linkedDevice.name
            }));
            setLinkedDevices(mapped);
        } catch (error) {
            console.error("Error fetching linked devices:", error);
        }
    };

    //Fetch last date for selected location
    const fetchLastDate = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/last/${locationId}`)
            setLastDate(response.data);
        } catch {
            console.error("Error fetching last date for that location", error)
        }
    }

    // We load device options dynamically in the AsyncSelect.
    // But we also keep the entire `devices` array in state for "Select All."
    const loadDevices = async (inputValue) => {
        try {
            const response = await axiosInstance.get(`/device/search`, {
                params: { clientId, locationId, q: inputValue }
            });
            return response.data.map((d) => ({ value: d.id, label: d.deviceName }));
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
            return response.data.map((dev) => ({ value: dev.id, label: dev.name }));
        } catch (error) {
            console.error("Error loading linked devices:", error);
            return [];
        }
    };

    // Fetch software for the chosen client
    const fetchSoftwares = async () => {
        if (clientId) {
            try {
                const response = await axiosInstance.get(`/software/client/${clientId}`);
                const mapped = response.data.map((soft) => ({
                    value: soft.id,
                    label: soft.name
                }));
                setSoftwares(mapped.sort((a, b) => a.label.localeCompare(b.label)));
            } catch (error) {
                console.error("Error fetching client software:", error);
            }
        }
    };

    // "Select all" handlers
    const handleSelectAllDevices = () => {
        setSelectedDevices(devices); // select entire devices array
    };

    const handleSelectAllLinked = () => {
        setSelectedLinkedDevices(linkedDevices);
    };

    const handleSelectAllSoftware = () => {
        setSelectedSoftwares(softwares);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post(`/maintenance/add`, {
                maintenanceName,
                maintenanceDate: maintenanceDate,
                lastDate: lastDate,
                description,
                deviceIds: selectedDevices.map(d => d.value),
                linkedDeviceIds: selectedLinkedDevices.map(ld => ld.value),
                softwareIds: selectedSoftwares.map(sw => sw.value),
                maintenanceStatus: "OPEN",
                baitWorkerId: selectedWorkerId,
                locationId,
            });
            // attach the new maintenance to the client
            await axiosInstance.put(`/client/maintenance/${clientId}/${response.data.token}`);

            setRefresh();  // re-fetch maintenances
            handleClose();
            setTimeout(() => {
                onAdd(response.data.token);
            }, 300);
        } catch (error) {
            console.error("Error submitting the maintenance", error);
            setError("Failed to add maintenance.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        clearFields();
        onHide();
    };

    const clearFields = () => {
        setMaintenanceName("");
        setMaintenanceDate(null);
        setLastDate(null);
        setSelectedWorkerId("");
        setClientId(selectedClientId || "");
        setLocationId("");
        setSelectedDevices([]);
        setSelectedLinkedDevices([]);
        setSelectedSoftwares([]);
        setDescription("");
    };

    return (
        <Modal size="xl" backdrop="static" show={show} onHide={handleClose}>
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
                <Form onSubmit={handleSubmit}>
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
                                    getOptionLabel={(client) => client.fullName}
                                    getOptionValue={(client) => client.id.toString()}
                                    value={clients.find((c) => c.id === Number(clientId)) || null}
                                    onChange={(selectedClient) => {
                                        if (selectedClient) {
                                            setClientId(selectedClient.id);
                                            setDescription(selectedClient.maintenanceDescription || "")
                                        } else {
                                            setClientId("");
                                        }
                                    }}
                                    isDisabled={!!selectedClientId}
                                    isSearchable
                                    placeholder={selectedClientId ? "Customer locked" : "Select Customer"}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    disabled={!clientId}
                                    required
                                >
                                    {!clientId ? (
                                        <option value="">Pick a customer before location</option>
                                    ) : (
                                        <>
                                            <option value="">Select Location</option>
                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>
                                                    {loc.name}
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
                                <Form.Label>Last Date</Form.Label>
                                <ReactDatePicker
                                    selected={parseLocalDate(lastDate)}
                                    onChange={(date) => setLastDate(formatLocalDate(date))}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control"
                                    isClearable
                                    required
                                    disabled={!clientId || !locationId}
                                    placeholderText={
                                        !clientId
                                            ? "Pick a customer"
                                            : !locationId
                                                ? "Pick a location"
                                                : "Select Date"
                                    }

                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Planned Date</Form.Label>
                                <ReactDatePicker
                                    selected={parseLocalDate(maintenanceDate)}
                                    onChange={(date) => setMaintenanceDate(formatLocalDate(date))}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control"
                                    placeholderText="Select date"
                                    isClearable
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Label>Responsible Technical Specialist</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                required
                            >
                                <option value="">Select Responsible</option>
                                {workers.map((w) => (
                                    <option key={w.value} value={w.value}>
                                        {w.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                    </Row>

                    {/* Devices, Linked Devices, Softwares with "Select All" */}
                    <Row>
                        <Col>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <Form.Label className="mb-0">Devices</Form.Label>
                                <Button variant="link" onClick={handleSelectAllDevices} style={{ padding: 0, textDecoration: 'none' }}>
                                    Select All
                                </Button>
                            </div>
                            <AsyncSelect
                                isDisabled={!clientId || !locationId}
                                isMulti
                                defaultOptions={devices}
                                loadOptions={loadDevices}
                                value={selectedDevices}
                                onChange={setSelectedDevices}
                                placeholder="Search and select devices"
                            />
                        </Col>
                        <Col>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <Form.Label className="mb-0">Linked Devices</Form.Label>
                                <Button variant="link" onClick={handleSelectAllLinked} style={{ padding: 0, textDecoration: 'none' }}>
                                    Select All
                                </Button>
                            </div>
                            <AsyncSelect
                                isDisabled={!clientId || !locationId}
                                isMulti
                                defaultOptions={linkedDevices}
                                loadOptions={loadLinkedDevices}
                                value={selectedLinkedDevices}
                                onChange={setSelectedLinkedDevices}
                                placeholder="Search and select linked devices"
                            />
                        </Col>
                        <Col>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <Form.Label className="mb-0">Softwares</Form.Label>
                                <Button variant="link" onClick={handleSelectAllSoftware} style={{ padding: 0, textDecoration: 'none' }}>
                                    Select All
                                </Button>
                            </div>
                            <Select
                                isDisabled={!clientId}
                                isMulti
                                options={softwares}
                                value={selectedSoftwares}
                                onChange={setSelectedSoftwares}
                                placeholder="Select software"
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Enter description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose}>
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