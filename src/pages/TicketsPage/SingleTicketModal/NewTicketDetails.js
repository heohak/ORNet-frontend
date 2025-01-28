import { Accordion, Col, Row, Button, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave } from 'react-icons/fa';  // Import edit and check icons
import config from "../../../config/config";
import Select from "react-select";
import {useLocation, useNavigate} from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";
import {DateUtils} from "../../../utils/DateUtils";
import AsyncSelect from "react-select/async";

const NewTicketDetails = ({ ticket, activeKey, eventKey, handleAccordionToggle, reFetch }) => {
    const location = useLocation();
    const { fromPath } = location.state || { fromPath: "/" };
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
        fetchBaitWorkers();
        fetchDevices();
    }, []);


    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/client/${ticket.clientId}`)
            const devices = response.data.map((device) => ({
                ...device,
                crn: `${device.workstationNo || ''}${device.cameraNo || ''}${device.otherNo || ''}`,
                label: `${device.deviceName}`,
                value: device.id,
            }));
            setSelectedDevices(
                ticket.deviceIds.map((deviceId) =>
                    devices.find((device) => device.id === deviceId)
                )
            );
        } catch (error) {
            console.error("Error fetching customer devices", error);
        }
    };
    // Function to fetch options dynamically from the endpoint
    const loadDeviceOptions = async (inputValue) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    customerRegisterNos: inputValue,
                    clientId: ticket.clientId,
                },
            });

            // Combine CRNs and exclude already selected devices
            const devicesWithCrn = response.data.map((device) => ({
                ...device,
                crn: `${device.workstationNo || ''}${device.cameraNo || ''}${device.otherNo || ''}`,
                label: `${device.deviceName}`,
                value: device.id,
            }));

            return devicesWithCrn.filter(
                (device) => !selectedDevices.some((selected) => selected.id === device.id)
            );
        } catch (error) {
            console.error("Error fetching devices:", error);
            return [];
        }
    };

    const fetchResponsibleName = async () => {
        if (!ticket.baitWorkerId) {
            return
        }
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/${ticket.baitWorkerId}`);
            const fullName = response.data.firstName + " " + response.data.lastName;
            setResponsibleName(fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/${ticket.clientId}`);

            const contactsWithRoles = await Promise.all(
                response.data.map(async contact => {
                    const rolesRes = await axiosInstance.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                    return {...contact, roles: rolesRes.data.map(role => role.role)};
                })
            );
            const filteredContacts = contactsWithRoles.filter(contact => contact.locationId === ticket.locationId);
            setAvailableContacts(filteredContacts);

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
            const response = await axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`)
            const fetchedWorkTypes = response.data.map(workType => ({value: workType.id, label: workType.workType}))
            setAvailableWorkTypes(fetchedWorkTypes)
            setSelectedWorkTypes(editedTicket.workTypeIds.map(workTypeId => fetchedWorkTypes.find(workType => workType.value === workTypeId)))
        } catch (error) {
            console.error('Error fetching ticket work types', error);
        }
    }

    const fetchBaitWorkers = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`);
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
            await axiosInstance.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
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
                <div style={{ fontSize: '0.85em', color: '#666' }}>CRN: {data.workstationNo}{data.cameraNo}{data.otherNo}</div>
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
                        <div style={{alignItems: 'center', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            Details
                            <Button
                                variant="link"
                                type="submit"
                                onClick={(e) => {e.stopPropagation()}}  // Prevent the accordion from collapsing
                                style={{ textDecoration: 'none', padding: 0 }} // Style button
                                className="me-2 d-flex"
                            >
                                {editMode ? <FaSave style={{ fontSize: '1.5rem' }} /> : <FaEdit style={{ fontSize: '1.5rem' }} />}
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
                                        />
                                    ) : editedTicket.clientNumeration ||
                                        <span style={{ fontStyle: 'italic', color: 'gray' }}>None</span>}
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
                                            value={editedTicket.baitWorkerId || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">
                                                Select assignee
                                            </option>
                                            {baitWorkers.map(worker => (
                                                <option key={worker.id} value={worker.id}>
                                                    {worker.firstName} {worker.lastName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : responsibleName ||
                                        <span style={{ fontStyle: 'italic', color: 'gray' }}>None</span>}
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
                                            <AsyncSelect
                                                isMulti
                                                cacheOptions
                                                defaultOptions
                                                loadOptions={loadDeviceOptions}
                                                value={selectedDevices}
                                                onChange={setSelectedDevices}
                                                placeholder="Search and select devices"
                                                components={{ Option: deviceOption }}
                                            />
                                        </Form.Group>
                                    ) : (
                                        selectedDevices.length > 0 ? (
                                            selectedDevices.map((device, index) => (
                                                <React.Fragment key={device.id}>
                                                      <span
                                                          onClick={() => navigate(`/device/${device.id}`, {
                                                              state: { fromPath: fromPath }
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
                                    <strong>Customer Reg No.</strong>
                                </Col>
                                <Col>
                                    {ticket.customerRegisterNos}
                                </Col>

                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Created</strong>
                                </Col>
                                <Col>
                                    {DateUtils.formatDate(ticket.startDateTime)}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Updated</strong>
                                </Col>
                                <Col>
                                    {DateUtils.formatDate(ticket.updateDateTime)}
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
