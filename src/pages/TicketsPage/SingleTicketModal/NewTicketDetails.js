import { Accordion, Col, Row, Button, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck } from 'react-icons/fa';  // Import edit and check icons
import config from "../../../config/config";
import Select from "react-select";
import {useNavigate} from "react-router-dom";

const NewTicketDetails = ({ ticket, activeKey, eventKey, handleAccordionToggle, reFetch, clientId }) => {
    const [responsibleName, setResponsibleName] = useState('');
    const [availableWorkTypes, setAvailableWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);  // Holds all workers fetched from the backend
    const [editMode, setEditMode] = useState(false);  // Track edit mode
    const [editedTicket, setEditedTicket] = useState(ticket);  // Copy of ticket for editing
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
        fetchDevices();
    }, []);


    const fetchDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/client/${ticket.clientId}`);
            setAvailableDevices(response.data.filter(device => device.locationId === ticket.locationId));
            setSelectedDevices(ticket.deviceIds.map(deviceId => response.data.find(device => device.id === deviceId)));
        } catch (error) {
            console.error("Error fetching customer devices", error);
        }
    };

    const fetchResponsibleName = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/${ticket.baitWorkerId}`);
            const fullName = response.data.firstName + " " + response.data.lastName;
            setResponsibleName(fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${ticket.clientId}`);

            const contactsWithRoles = await Promise.all(
                response.data.map(async contact => {
                    const rolesRes = await axios.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                    return {...contact, roles: rolesRes.data.map(role => role.role)};
                })
            );

            setAvailableContacts(contactsWithRoles);

            setSelectedContacts(
                editedTicket.contactIds.map(contactId =>
                    contactsWithRoles.find(contact => contact.id === contactId)
                )
            );

        } catch (error) {
            console.error('Error fetching ticket contacts', error);
        }
    };


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
        e.preventDefault()
        if (editMode) {
            // If in edit mode, save the changes to the server
            handleSaveChanges();
        }
        setEditMode(!editMode);
    };

    const handleAccordionHeaderClick = (e) => {
        e.stopPropagation();  // Prevent the accordion from collapsing when the button is clicked
        handleAccordionToggle(eventKey);  // Trigger accordion toggle if needed
    };


    // Handle input changes for the edited ticket
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Ensure crisis is stored as a number (not strings)
        let newValue = value;
        if (name === "crisis") {
            newValue = parseInt(value);  // Convert the value to an integer
        }

        setEditedTicket({ ...editedTicket, [name]: newValue });
    };

    // Save updated information to the backend
    const handleSaveChanges = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                ...editedTicket,
                contactIds: selectedContacts.map(contact => contact.id),
                workTypeIds: selectedWorkTypes.map(workType => workType.value),
                deviceIds: selectedDevices.map(device => device.id)
            });

            const selectedWorker = baitWorkers.find(worker => worker.id === parseInt(editedTicket.baitWorkerId));
            if (selectedWorker) {
                setResponsibleName(`${selectedWorker.firstName} ${selectedWorker.lastName}`);
            }

            setEditedTicket({ ...editedTicket, crisis: editedTicket.crisis});

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

    const deviceOption = ({ innerProps, innerRef, data, isFocused }) => {
        if (!data || !data.deviceName) {
            return null;
        }
        return(
            <div
                ref={innerRef}
                {...innerProps}
                style={{
                    padding: '8px',
                    backgroundColor: isFocused ? '#DEEBFF' : 'white', // Add hover color change here
                    cursor: 'pointer',
                }}
            >
                <div style={{ fontWeight: 'bold' }}>{data.deviceName}</div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>SN: {data.serialNumber}</div>
            </div>
        );
    }

    const ContactOption = ({ innerRef, innerProps, data, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                padding: '8px',
                backgroundColor: isFocused ? '#DEEBFF' : 'white', // Add hover color change here
                cursor: 'pointer',
            }}
        >
            <div style={{ fontWeight: 'bold' }}>
                {data.favorite ? '★ ' : ''}{data.firstName} {data.lastName}
            </div>
            {data.roles && data.roles.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                    Roles: {data.roles.join(', ')}
                </div>
            )}
        </div>
    );


    return (
        <>
            <Accordion activeKey={activeKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Form onSubmit={handleEditToggle}>
                        <Accordion.Header onClick={handleAccordionHeaderClick}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            Details
                            <Button
                                variant="link"
                                type="submit"
                                onClick={(e) => {e.stopPropagation()}}  // Prevent the accordion from collapsing
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
                                    <strong>Numeration</strong>
                                </Col>
                                <Col>
                                    {editedTicket.baitNumeration}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Customer No.</strong>
                                </Col>
                                <Col>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            name="clientNumeration"
                                            value={editedTicket.clientNumeration}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    ) : editedTicket.clientNumeration}
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

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Contacts</strong>
                                </Col>
                                <Col style={{ minWidth: '250px' }}>
                                    {editMode ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableContacts}
                                                value={selectedContacts}
                                                onChange={setSelectedContacts}
                                                placeholder="Select Contacts"
                                                getOptionLabel={option => `${option.favorite ? '★ ' : ''}${option.firstName} ${option.lastName}`}
                                                getOptionValue={option => option.id}
                                                components={{ Option: ContactOption }}
                                            />
                                        </Form.Group>
                                    ) : ( selectedContacts.length > 0
                                        ? selectedContacts.map(contact => contact.firstName + " " + contact.lastName).join(', ')
                                        : (
                                            <span style={{ fontStyle: 'italic', color: 'gray' }}>No Contacts</span>
                                        ))
                                    }
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Work Types</strong>
                                </Col>
                                <Col style={{minWidth: '250px'}}>
                                    {editMode ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableWorkTypes}
                                                value={selectedWorkTypes}
                                                onChange={setSelectedWorkTypes}
                                                placeholder="Select Work Types"
                                                required
                                            />
                                        </Form.Group>
                                    ): selectedWorkTypes.map(workType => workType.label).join(', ')}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Devices</strong>
                                </Col>
                                <Col style={{minWidth: '250px'}}>
                                    {editMode ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableDevices}
                                                value={selectedDevices}
                                                onChange={setSelectedDevices}
                                                placeholder="Select Devices"
                                                getOptionLabel={(option) => option.deviceName} // This is optional, just to provide clarity
                                                getOptionValue={(option) => option.id} // Ensures unique value
                                                components={{ Option: deviceOption}}
                                            />
                                        </Form.Group>
                                    ) : (
                                        selectedDevices.length > 0 ? (
                                            selectedDevices.map((device, index) => (
                                                <React.Fragment key={device.id}>
                                                      <span
                                                          onClick={() => navigate(`/device/${device.id}`, {
                                                              state: {
                                                                  fromPath: clientId
                                                                      ? `/customer/${clientId}/ticket/${ticket.id}`
                                                                      : `/tickets/${ticket.id}`,
                                                              }
                                                          })}
                                                          style={{ color: 'blue', cursor: 'pointer' }} // Styling for clickable text
                                                      >
                                                        {device.deviceName}
                                                      </span>
                                                    {index < selectedDevices.length - 1 && ', '}
                                                </React.Fragment>
                                        ))) : (
                                            <span style={{ fontStyle: 'italic', color: 'gray' }}>No Devices</span>
                                        ))
                                    }
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Created</strong>
                                </Col>
                                <Col>
                                    {formatDateString(ticket.startDateTime)}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Updated</strong>
                                </Col>
                                <Col>
                                    {formatDateString(ticket.updateDateTime)}
                                </Col>
                            </Row>
                        </div>
                    </Accordion.Body>
                    </Form>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default NewTicketDetails;
