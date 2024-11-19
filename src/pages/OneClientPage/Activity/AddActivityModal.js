import React, {useEffect, useState} from "react";
import axios from "axios";
import config from "../../../config/config";
import {Alert, Button, Col, Form, Modal, Row} from "react-bootstrap";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../css/OneClientPage/AddActivityModal.css';
import Select from "react-select";

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
        clientNumeration: '',
        contactIds: [],
        deviceId: undefined,
        endDateTime: null,
    });

    const [locations, setLocations] = useState(clientLocations);
    const [contacts, setContacts] = useState(clientContacts);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [error, setError] = useState(null);

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
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/worker/all`),
                    axios.get(`${config.API_BASE_URL}/work-type/classificator/all`),
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
                    const deviceRes = await axios.get (`${config.API_BASE_URL}/device/client/${formData.clientId}`)

                    const contactsWithRoles = await Promise.all(
                        contacts.map(async contact => {
                            const rolesRes = await axios.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                            return {...contact, roles: rolesRes.data.map(role => role.role)};
                        })
                    );

                    setContacts(contactsWithRoles);
                    setDevices(deviceRes.data);
                } catch (error) {
                    console.error('Error fetching locations or contacts:', error);
                }
            }
        };

        fetchContactsAndDevices();
    }, [formData.clientId]);

    const handleChange = (e) => {
        const {id, value } = e.target;
        let newValue = value;
        if (id === 'contactIds') {
            newValue = [value];
        } else if (id === 'crisis') {
            newValue = parseInt(value);
        }
        setFormData( prevData => ({...prevData, [id]: newValue}));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let newActivity = {
                ...formData,
                statusId: openStatusId,
                workTypeIds: selectedWorkTypes.map(option => option.value),
                crisis: formData.crisis === 1,
                endDateTime: new Date(formData.endDateTime),
                ...(formData.deviceId ? { deviceIds: [formData.deviceId] } : {})
            };

            await axios.post(`${config.API_BASE_URL}/client-activity/add`, newActivity);

            reFetch();
            handleClose();
            resetFields();

        } catch (err) {
            setError(err.message);
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
            clientNumeration: '',
            contactIds: [],
            deviceId: undefined,
            endDateTime: null,
        }); // Reset form fields
        setSelectedWorkTypes([]); // Reset selected work types
    }


    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
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
                                        dateFormat="dd/MM/yyyy"
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
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Contact</Form.Label>
                                </div>
                                <Form.Control
                                    as="select"
                                    value={formData.contactIds[0] || ""}
                                    onChange={handleChange}
                                    id="contactIds"
                                    disabled={!formData.clientId}
                                    required
                                >
                                    <>
                                        <option value="">Select a Contact</option>
                                        {contacts.map(contact => (
                                            <option key={contact.id} value={contact.id}>
                                                {contact.favorite ? "★ " : ""}
                                                {contact.firstName + " " + contact.lastName}
                                                {contact.roles && contact.roles.length > 0 && ` - Roles: ${contact.roles.join(", ")}`}
                                            </option>
                                        ))}
                                    </>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    id="title"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Device</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.deviceId}
                                    onChange={handleChange}
                                    id="deviceId"
                                    disabled={!formData.clientId || devices.length === 0}
                                >
                                    <>
                                        <option value="">Select a Device</option>
                                        {devices.map((device) => (
                                            <option key={device.id} value={device.id}>
                                                {device.deviceName}
                                            </option>
                                        ))}
                                    </>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={7}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    id="description"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
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
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>


                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Client Numeration</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.clientNumeration}
                                    onChange={handleChange}
                                    id="clientNumeration"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
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
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Responsible</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.baitWorkerId}
                                    onChange={handleChange}
                                    id="baitWorkerId"
                                    required
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
                        <Button variant="primary" type="submit">Submit</Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddActivityModal;
