import { Accordion, Col, Row, Button, Form } from "react-bootstrap";
import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import axios from "axios";
import {FaEdit, FaSave, FaTrash} from 'react-icons/fa';  // Import edit and check icons
import config from "../../../config/config";
import Select from "react-select";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";
import DeleteModal from "./DeleteModal";

const ModalDetails = forwardRef(({
                          activity,
                          activeKey,
                          eventKey,
                          handleAccordionToggle,
                          reFetch,
                          setShowDeleteModal,
                          showDeleteModal,
                          isEditing,
                          closeActivity,

                      }, ref) => {
    const [responsibleName, setResponsibleName] = useState('');
    const [availableWorkTypes, setAvailableWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);  // Holds all workers fetched from the backend
    const [editedActivity, setEditedActivity] = useState(activity);  // Copy of ticket for editing
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


    const handleDelete = async() => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/client-activity/delete/${activity.id}`)
            reFetch();
            setShowDeleteModal(false);
            closeActivity();
        } catch (error) {
            console.error('Error deleting activity', error);
        }
    }

    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/client/${activity.clientId}`);
            const fetchedDevices = response.data.map(device => ({value: device.id, label: device.deviceName}))
            setAvailableDevices(fetchedDevices);
            setSelectedDevices(activity.deviceIds.map(deviceId => fetchedDevices.find(device => device.value === deviceId)));
        } catch (error) {
            console.error("Error fetching customer devices", error);
        }
    };

    const fetchResponsibleName = async () => {
        if (!activity.baitWorkerId) {
            return;
        }
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/bait/worker/${activity.baitWorkerId}`);
            const fullName = response.data.firstName + " " + response.data.lastName;
            setResponsibleName(fullName);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/${activity.clientId}`);
            const fetchedContacts = response.data.map(contact => ({value: contact.id, label: `${contact.firstName} ${contact.lastName}`}))
            setAvailableContacts(fetchedContacts);
            setSelectedContacts(editedActivity.contactIds.map(contactId => fetchedContacts.find(contact => contact.value === contactId)));
        } catch (error) {
            console.error('Error fetching ticket contacts', error);
        }
    }

    const fetchWorkTypes = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`)
            const fetchedWorkTypes = response.data.map(workType => ({value: workType.id, label: workType.workType}))
            setAvailableWorkTypes(fetchedWorkTypes)
            setSelectedWorkTypes(editedActivity.workTypeIds.map(workTypeId => fetchedWorkTypes.find(workType => workType.value === workTypeId)))
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



    useImperativeHandle(ref, () => ({
        saveChanges: handleSaveChanges, // Expose this function to parent
    }));

    // Save updated information to the backend
    const handleSaveChanges = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                ...editedActivity,
                contactIds: selectedContacts.map(contact => contact.value),
                workTypeIds: selectedWorkTypes.map(workType => workType.value),
                deviceIds: selectedDevices.map(device => device.value)
            });

            const selectedWorker = baitWorkers.find(worker => worker.id === parseInt(editedActivity.baitWorkerId));
            if (selectedWorker) {
                setResponsibleName(`${selectedWorker.firstName} ${selectedWorker.lastName}`);
            }


            setEditedActivity({ ...editedActivity, crisis: editedActivity.crisis});
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
                        Details
                    </Accordion.Header>
                    <Accordion.Body>
                        <div>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Assignee</strong>
                                </Col>
                                <Col>
                                    {isEditing ? (
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
                                    {isEditing ? (
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

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Contacts</strong>
                                </Col>
                                <Col style={{minWidth: '250px'}}>
                                    {isEditing ? (
                                        <Form.Group className="mb-3">
                                            <Select
                                                isMulti
                                                options={availableContacts}
                                                value={selectedContacts}
                                                onChange={setSelectedContacts}
                                                placeholder="Select Contacts"
                                            />
                                        </Form.Group>
                                    ) : ( selectedContacts.length > 0
                                        ? selectedContacts.map(contact => contact.label).join(', ')
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
                                    {isEditing ? (
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

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Created</strong>
                                </Col>
                                <Col style={{minWidth: '250px'}}>
                                    {formatDateString(activity.startDateTime)}
                                </Col>
                            </Row>

                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Updated</strong>
                                </Col>
                                <Col style={{minWidth: '250px'}}>
                                    {formatDateString(activity.updateDateTime)}
                                </Col>
                            </Row>
                            <Row className="mb-2 justify-content-end">
                                <Col className="col-md-auto">
                                    <FaTrash
                                        style={{ cursor: "pointer", fontSize: "1.5rem" }}
                                        onClick={() => setShowDeleteModal(true)}
                                        title="Delete Ticket"
                                        className="text-danger"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={handleDelete}
            />
        </>
    );
});

export default ModalDetails;
