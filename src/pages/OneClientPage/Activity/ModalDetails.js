import { Accordion, Col, Row, Button, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck } from 'react-icons/fa';  // Import edit and check icons
import config from "../../../config/config";
import Select from "react-select";
import {useNavigate} from "react-router-dom";

const ModalDetails = ({ activity, activeKey, eventKey, handleAccordionToggle, reFetch }) => {
    const [responsibleName, setResponsibleName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [availableWorkTypes, setAvailableWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);  // Holds all workers fetched from the backend
    const [editMode, setEditMode] = useState(false);  // Track edit mode
    const [editedActivity, setEditedActivity] = useState(activity);  // Copy of ticket for editing
    const [locations, setLocations] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);  // Selected contacts
    const [availableContacts, setAvailableContacts] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [availableDevices, setAvailableDevices] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        fetchResponsibleName();
        fetchWorkTypes();
        fetchContacts();
        fetchBaitWorkers();  // Fetch all workers for the dropdown
        fetchLocations();
        fetchDevices();
    }, []);


    const fetchDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/client/${activity.clientId}`);
            const fetchedDevices = response.data.map(device => ({value: device.id, label: device.deviceName}))
            setAvailableDevices(fetchedDevices);
            setSelectedDevices(activity.deviceIds.map(deviceId => fetchedDevices.find(device => device.value === deviceId)));
        } catch (error) {
            console.error("Error fetching customer devices", error);
        }
    };
    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/locations/${activity.clientId}`);
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations', error);
        }
    }

    const fetchResponsibleName = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/${activity.baitWorkerId}`);
            const fullName = response.data.firstName + " " + response.data.lastName;
            setResponsibleName(fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${activity.clientId}`);
            const fetchedContacts = response.data.map(contact => ({value: contact.id, label: `${contact.firstName} ${contact.lastName}`}))
            setAvailableContacts(fetchedContacts);
            setSelectedContacts(editedActivity.contactIds.map(contactId => fetchedContacts.find(contact => contact.value === contactId)));
        } catch (error) {
            console.error('Error fetching ticket contacts', error);
        }
    }

    const fetchWorkTypes = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`)
            const fetchedWorkTypes = response.data.map(workType => ({value: workType.id, label: workType.workType}))
            setAvailableWorkTypes(fetchedWorkTypes)
            setSelectedWorkTypes(editedActivity.workTypeIds.map(workTypeId => fetchedWorkTypes.find(workType => workType.value === workTypeId)))
        } catch (error) {
            console.error('Error fetching ticket work types', error);
        }
    }

    const fetchBaitWorkers = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/all`);
            setBaitWorkers(response.data);
        } catch (error) {
            console.error('Error fetching bait workers:', error);
        }
    }

    // Toggle edit mode
    const handleEditToggle = (e) => {
        e.stopPropagation();  // Prevent the accordion from collapsing
        if (editMode) {
            // If in edit mode, save the changes to the server
            handleSaveChanges();
        }
        setEditMode(!editMode);
    };

    // Handle input changes for the edited ticket
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Ensure crisis is stored as a number (not strings)
        let newValue = value;
        if (name === "crisis") {
            newValue = parseInt(value);  // Convert the value to an integer
        }

        setEditedActivity({ ...editedActivity, [name]: newValue });
    };

    // Save updated information to the backend
    const handleSaveChanges = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                ...editedActivity,
                contactIds: selectedContacts.map(contact => contact.value),
                workTypeIds: selectedWorkTypes.map(workType => workType.value),
                deviceIds: selectedDevices.map(device => device.value)
            });

            const selectedWorker = baitWorkers.find(worker => worker.id === parseInt(editedActivity.baitWorkerId));
            if (selectedWorker) {
                setResponsibleName(`${selectedWorker.firstName} ${selectedWorker.lastName}`);
            }
            const selectedLocation = locations.find(location => location.id === parseInt(editedActivity.locationId))
            if (selectedLocation) {
                setLocationName(selectedLocation.name);
            }

            setEditedActivity({ ...editedActivity, crisis: editedActivity.crisis});

            setEditMode(false);
            reFetch();
        } catch (error) {
            console.error('Error saving ticket details:', error);
        }
    };

    const formatDateString = (dateString) => {
        const date = new Date(dateString);

        // Get parts of the date
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        };

        // Format date into a readable string
        return date.toLocaleString('en-US', options);
    }

    return (
        <>
            <Accordion activeKey={activeKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Accordion.Header onClick={() => handleAccordionToggle(eventKey)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            Details
                            <Button
                                variant="link"
                                onClick={handleEditToggle}  // Stop event propagation here
                                style={{ textDecoration: 'none', padding: 0 }} // Style button
                                className="me-2 d-flex"
                            >
                                {editMode ? <FaCheck /> : <FaEdit />}
                            </Button>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Customer No.</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            name="clientNumeration"
                                            value={editedActivity.clientNumeration}
                                            onChange={handleInputChange}
                                        />
                                    ) : editedActivity.clientNumeration}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Assignee</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="baitWorkerId"
                                            value={editedActivity.baitWorkerId}
                                            onChange={handleInputChange}
                                        >
                                            {baitWorkers.map(worker => (
                                                <option key={worker.id} value={worker.id}>
                                                    {worker.firstName} {worker.lastName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : responsibleName}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Priority</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="crisis"
                                            value={editedActivity.crisis ? 1 : 0}
                                            onChange={handleInputChange}
                                        >
                                            <option value="1">High</option>
                                            <option value="0">Normal</option>
                                        </Form.Select>
                                    ) : (editedActivity.crisis ? "High" : "Normal")}
                                </Col>
                            </Row>

                            {/*<Row className="mb-2">*/}
                            {/*    <Col xs="auto" style={{ minWidth: '165px' }}>*/}
                            {/*        <strong>Contacts</strong>*/}
                            {/*    </Col>*/}
                            {/*    <Col style={{minWidth: '250px'}}>*/}
                            {/*        {editMode ? (*/}
                            {/*            <Form.Group className="mb-3">*/}
                            {/*                <Select*/}
                            {/*                    isMulti*/}
                            {/*                    options={availableContacts}*/}
                            {/*                    value={selectedContacts}*/}
                            {/*                    onChange={setSelectedContacts}*/}
                            {/*                    placeholder="Select Contacts"*/}
                            {/*                />*/}
                            {/*            </Form.Group>*/}
                            {/*        ): selectedContacts.map(contact => contact.label).join(', ')}*/}
                            {/*    </Col>*/}
                            {/*</Row>*/}

                            {/*<Row className="mb-2">*/}
                            {/*    <Col xs="auto" style={{ minWidth: '165px' }}>*/}
                            {/*        <strong>Work Types</strong>*/}
                            {/*    </Col>*/}
                            {/*    <Col style={{minWidth: '250px'}}>*/}
                            {/*        {editMode ? (*/}
                            {/*            <Form.Group className="mb-3">*/}
                            {/*                <Select*/}
                            {/*                    isMulti*/}
                            {/*                    options={availableWorkTypes}*/}
                            {/*                    value={selectedWorkTypes}*/}
                            {/*                    onChange={setSelectedWorkTypes}*/}
                            {/*                    placeholder="Select Work Types"*/}
                            {/*                />*/}
                            {/*            </Form.Group>*/}
                            {/*        ): selectedWorkTypes.map(workType => workType.label).join(', ')}*/}
                            {/*    </Col>*/}
                            {/*</Row>*/}

                            {/*<Row className="mb-2">*/}
                            {/*    <Col xs="auto" style={{ minWidth: '165px' }}>*/}
                            {/*        <strong>Devices</strong>*/}
                            {/*    </Col>*/}
                            {/*    <Col style={{minWidth: '250px'}}>*/}
                            {/*        {editMode ? (*/}
                            {/*            <Form.Group className="mb-3">*/}
                            {/*                <Select*/}
                            {/*                    isMulti*/}
                            {/*                    options={availableDevices}*/}
                            {/*                    value={selectedDevices}*/}
                            {/*                    onChange={setSelectedDevices}*/}
                            {/*                    placeholder="Select Devices"*/}
                            {/*                />*/}
                            {/*            </Form.Group>*/}
                            {/*        ) : (*/}
                            {/*            selectedDevices.length > 0 ? (*/}
                            {/*                selectedDevices.map((device, index) => (*/}
                            {/*                    <React.Fragment key={device.value}>*/}
                            {/*                          <span*/}
                            {/*                              onClick={() => navigate(`/device/${device.value}`, { state: { fromTicketId: ticket.id } })}*/}
                            {/*                              style={{ color: 'blue', cursor: 'pointer' }} // Styling for clickable text*/}
                            {/*                          >*/}
                            {/*                            {device.label}*/}
                            {/*                          </span>*/}
                            {/*                        {index < selectedDevices.length - 1 && ', '}*/}
                            {/*                    </React.Fragment>*/}
                            {/*                ))) : (*/}
                            {/*                <span style={{ fontStyle: 'italic', color: 'gray' }}>No Devices</span>*/}
                            {/*            ))*/}
                            {/*        }*/}
                            {/*    </Col>*/}
                            {/*</Row>*/}

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Created</strong>
                                </Col>
                                <Col>
                                    {formatDateString(activity.startDateTime)}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Updated</strong>
                                </Col>
                                <Col>
                                    {formatDateString(activity.updateDateTime)}
                                </Col>
                            </Row>

                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default ModalDetails;
