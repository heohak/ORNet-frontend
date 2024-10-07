import { Accordion, Col, Row, Button, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck } from 'react-icons/fa';  // Import edit and check icons
import config from "../../../../config/config";
import Select from "react-select";

const NewTicketDetails = ({ ticket, activeKey, eventKey, handleAccordionToggle }) => {
    const [responsibleName, setResponsibleName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [availableWorkTypes, setAvailableWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);  // Holds all workers fetched from the backend
    const [editMode, setEditMode] = useState(false);  // Track edit mode
    const [editedTicket, setEditedTicket] = useState(ticket);  // Copy of ticket for editing
    const [locations, setLocations] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);  // Selected contacts
    const [availableContacts, setAvailableContacts] = useState([]);

    useEffect(() => {
        fetchResponsibleName();
        fetchLocationName();
        fetchWorkTypes();
        fetchContacts();
        fetchBaitWorkers();  // Fetch all workers for the dropdown
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/locations/${ticket.clientId}`);
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations', error);
        }
    }

    const fetchResponsibleName = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/${ticket.baitWorkerId}`);
            const fullName = response.data.firstName + " " + response.data.lastName;
            setResponsibleName(fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchLocationName = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/location/${ticket.locationId}`);
            setLocationName(response.data.name);
        } catch (error) {
            console.error('Error fetching location', error);
        }

    }

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${ticket.clientId}`);
            const fetchedContacts = response.data.map(contact => ({value: contact.id, label: `${contact.firstName} ${contact.lastName}`}))
            setAvailableContacts(fetchedContacts);
            setSelectedContacts(editedTicket.contactIds.map(contactId => fetchedContacts.find(contact => contact.value === contactId)));
        } catch (error) {
            console.error('Error fetching ticket contacts', error);
        }
    }

    const fetchWorkTypes = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`)
            const fetchedWorkTypes = response.data.map(workType => ({value: workType.id, label: workType.workType}))
            setAvailableWorkTypes(fetchedWorkTypes)
            setSelectedWorkTypes(editedTicket.workTypeIds.map(workTypeId => fetchedWorkTypes.find(workType => workType.value === workTypeId)))
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

        // Ensure crisis and remote are stored as numbers (not strings)
        let newValue = value;
        if (name === "crisis" || name === "remote") {
            newValue = parseInt(value);  // Convert the value to an integer
        }

        setEditedTicket({ ...editedTicket, [name]: newValue });
    };

    // Save updated information to the backend
    const handleSaveChanges = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                ...editedTicket,
                contactIds: selectedContacts.map(contact => contact.value),
                workTypeIds: selectedWorkTypes.map(workType => workType.value)
            });

            const selectedWorker = baitWorkers.find(worker => worker.id === parseInt(editedTicket.baitWorkerId));
            if (selectedWorker) {
                setResponsibleName(`${selectedWorker.firstName} ${selectedWorker.lastName}`);
            }
            const selectedLocation = locations.find(location => location.id === parseInt(editedTicket.locationId))
            if (selectedLocation) {
                setLocationName(selectedLocation.name);
            }

            setEditedTicket({ ...editedTicket, crisis: editedTicket.crisis, remote: editedTicket.remote });

            setEditMode(false);
        } catch (error) {
            console.error('Error saving ticket details:', error);
        }
    };

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
                            {/* Assignee (Bait Worker Dropdown) */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Assignee</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="baitWorkerId"
                                            value={editedTicket.baitWorkerId}
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

                            {/* Numeration */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Numeration</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            name="baitNumeration"
                                            value={editedTicket.baitNumeration}
                                            onChange={handleInputChange}
                                        />
                                    ) : editedTicket.baitNumeration}
                                </Col>
                            </Row>

                            {/* Priority Dropdown */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Priority</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="crisis"
                                            value={editedTicket.crisis ? 1 : 0}
                                            onChange={handleInputChange}
                                        >
                                            <option value="1">High</option>
                                            <option value="0">Normal</option>
                                        </Form.Select>
                                    ) : (editedTicket.crisis ? "High" : "Normal")}
                                </Col>
                            </Row>

                            {/* Remote Dropdown */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Remote</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="remote"
                                            value={editedTicket.remote ? 1 : 0}
                                            onChange={handleInputChange}
                                        >
                                            <option value="1">True</option>
                                            <option value="0">False</option>
                                        </Form.Select>
                                    ) : (editedTicket.remote ? "True" : "False")}
                                </Col>
                            </Row>

                            {/* Client Numeration */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Client Numeration</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            name="clientNumeration"
                                            value={editedTicket.clientNumeration}
                                            onChange={handleInputChange}
                                        />
                                    ) : editedTicket.clientNumeration}
                                </Col>
                            </Row>

                            {/* Location */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Location</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Select
                                            name="locationId"
                                            value={editedTicket.locationId}
                                            onChange={handleInputChange}
                                        >
                                            {locations.map(location => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : locationName}
                                </Col>
                            </Row>

                            {/* Contacts */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Contacts</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableContacts}
                                                value={selectedContacts}
                                                onChange={setSelectedContacts}
                                                placeholder="Select Contacts"
                                            />
                                        </Form.Group>
                                    ): selectedContacts.map(contact => contact.label).join(', ')}
                                </Col>
                            </Row>

                            {/* Work Types */}
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Work Types</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableWorkTypes}
                                                value={selectedWorkTypes}
                                                onChange={setSelectedWorkTypes}
                                                placeholder="Select Work Types"
                                            />
                                        </Form.Group>
                                    ): selectedWorkTypes.map(workType => workType.label).join(', ')}
                                </Col>
                            </Row>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default NewTicketDetails;
