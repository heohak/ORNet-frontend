import React, {useEffect, useState} from "react";
import axios from "axios";
import config from "../../../config/config";
import {Alert, Button, Col, Form, Modal, Row} from "react-bootstrap";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../css/OneClientPage/AddActivityModal.css';
import Select from "react-select";
import axiosInstance from "../../../config/axiosInstance";

const AddActivityModal = ({show, handleClose, reFetch, clientId, clientLocations, clientContacts, clientName}) => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        clientId: clientId,
        crisis: false,
        workTypeIds: [],
        baitWorkerId: '',
        locationId: '',
        baitNumeration: '',
        contactIds: [],
        endDateTime: null,
    });

    const [locations, setLocations] = useState(clientLocations);
    const [contacts, setContacts] = useState(clientContacts);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleDateChange = (date) => {
        setFormData(prevData => ({
            ...prevData,
            endDateTime: date,
        }));
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, baitWorkerRes, workTypeRes] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`),
                ]);
                const statuses = statusRes.data;
                if (statuses.length > 0) {
                    // Filter for open status
                    const open = statuses.find(status => status.status === 'Open');
                    if (open) {
                        setOpenStatusId(open.id);
                    }
                }
                setBaitWorkers(baitWorkerRes.data);
                setWorkTypes(workTypeRes.data.map(workType => ({value: workType.id, label: workType.workType})));

            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchContactsAndDevices = async () => {
            if (formData.clientId) {
                try {
                    const contactsWithRoles = await Promise.all(
                        contacts.map(async contact => {
                            const rolesRes = await axiosInstance.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                            return {...contact, roles: rolesRes.data.map(role => role.role)};
                        })
                    );
                    const sortedContacts = contactsWithRoles.sort((a, b) => {
                        // First, prioritize favorites
                        if (a.favorite !== b.favorite) {
                            return b.favorite - a.favorite; // True (1) comes before False (0)
                        }
                        // Then, sort alphabetically by first and last name
                        return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                    });
                    setContacts(sortedContacts);
                } catch (error) {
                    console.error('Error fetching locations or contacts:', error);
                }
            }
        };

        fetchContactsAndDevices();
    }, [formData.clientId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value;
        if (id === 'crisis') {
            newValue = parseInt(value);
        }
        setFormData(prevData => ({ ...prevData, [id]: newValue }));
    };


    const handleContactChange = (selectedOptions) => {
        setFormData((prevData) => ({
            ...prevData,
            contactIds: selectedOptions.map((contact) => contact.id),
        }));
    };




    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        try {
            let newActivity = {
                ...formData,
                statusId: openStatusId,
                workTypeIds: selectedWorkTypes.map(option => option.value),
                contactIds: formData.contactIds,
                crisis: formData.crisis === 1,
                endDateTime: new Date(formData.endDateTime),
            };

            await axiosInstance.post(`${config.API_BASE_URL}/client-activity/add`, newActivity);

            reFetch();
            handleClose();
            resetFields();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    const resetFields = () => {
        setFormData({
            title: '',
            description: '',
            clientId: clientId,
            crisis: false,
            workTypeIds: [],
            baitWorkerId: '',
            locationId: '',
            baitNumeration: '',
            contactIds: [],
            endDateTime: null,
        });
        setSelectedWorkTypes([]);
    }

    return (
        <Modal backdrop="static" show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <div>
                    <Modal.Title>Add a New Activity</Modal.Title>
                    <p className="mb-0 text-muted">{clientName}</p>
                </div>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Deadline</Form.Label>
                                <div>
                                    <ReactDatePicker
                                        selected={formData.endDateTime}
                                        onChange={handleDateChange}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder" // Add a custom class
                                        placeholderText="Select a date"
                                        isClearable
                                        required
                                    />

                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Location</Form.Label>

                                </div>
                                <Form.Control
                                    as="select"
                                    value={formData.locationId}
                                    onChange={handleChange}
                                    id="locationId"
                                    disabled={!formData.clientId}
                                    required
                                >
                                    <>
                                        <option value="">Select Location</option>
                                        {locations.map(location => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Contacts</Form.Label>
                                <Select
                                    isMulti
                                    options={contacts}
                                    getOptionLabel={(option) =>
                                        `${option.favorite ? "★ " : ""}${option.firstName} ${option.lastName}`
                                    }
                                    getOptionValue={(option) => option.id}
                                    value={contacts.filter((contact) =>
                                        formData.contactIds.includes(contact.id)
                                    )}
                                    onChange={handleContactChange}
                                    placeholder="Select contacts"
                                />
                            </Form.Group>

                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    id="title"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Selected Work Types</Form.Label>
                                </div>
                                <Select
                                    isMulti
                                    options={workTypes}
                                    value={selectedWorkTypes}
                                    onChange={setSelectedWorkTypes}
                                    placeholder="Select work types"

                                />
                            </Form.Group>

                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Enter Description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    id="description"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Priority</Form.Label>
                                <Form.Select
                                    id="crisis"
                                    value={formData.crisis ? 1 : 0}
                                    onChange={handleChange}
                                >
                                    <option value="1">High</option>
                                    <option value="0">Normal</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Responsible</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.baitWorkerId}
                                    onChange={handleChange}
                                    id="baitWorkerId"
                                >
                                    <option value="">Select Responsible</option>
                                    {baitWorkers.map(baitWorker => (
                                        <option key={baitWorker.id} value={baitWorker.id}>
                                            {baitWorker.firstName + " " + baitWorker.lastName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Submitting..' : 'Submit'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddActivityModal;
