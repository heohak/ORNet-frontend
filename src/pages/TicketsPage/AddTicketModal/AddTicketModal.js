import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import config from "../../../config/config";
import {Alert, Button, Col, Form, Modal, Row} from "react-bootstrap";
import Select from "react-select";
import AddWorkTypeModal from "./AddWorkTypeModal";
import AddLocationModal from "./AddLocationModal";
import AddContactModal from "./AddContactModal";



const AddTicketModal = ({show, handleClose, reFetch, onNavigate, setTicket}) => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        clientId: '',
        crisis: false,
        workTypeIds: [],
        baitWorkerId: '',
        locationId: '',
        baitNumeration: '',
        clientNumeration: '',
        contactIds: [],
        deviceId: undefined
    });

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [submitType, setSubmitType] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, baitWorkerRes, clientRes, workTypeRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/worker/all`),
                    axios.get(`${config.API_BASE_URL}/client/all`),
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
                setClients(clientRes.data);

            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchLocationsAndContactsAndDevices = async () => {
            if (formData.clientId) {
                try {
                    const locationRes = await axios.get(`${config.API_BASE_URL}/client/locations/${formData.clientId}`);
                    const contactRes = await axios.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);
                    const deviceRes = await axios.get (`${config.API_BASE_URL}/device/client/${formData.clientId}`)

                    const contactsWithRoles = await Promise.all(
                        contactRes.data.map(async contact => {
                            const rolesRes = await axios.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                            return {...contact, roles: rolesRes.data.map(role => role.role)};
                        })
                    );

                    setLocations(locationRes.data);
                    setContacts(contactsWithRoles);
                    setDevices(deviceRes.data);
                } catch (error) {
                    console.error('Error fetching locations or contacts:', error);
                }
            }
        };

        fetchLocationsAndContactsAndDevices();
    }, [formData.clientId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value;
        if (id === 'crisis') {
            newValue = value === "true";
        } else if (id === 'contactIds') {
            newValue = [value];
        }
        setFormData(prevData => ({
            ...prevData,
            [id]: newValue
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Ensure required fields like title are filled
        if (!formData.title) {
            setError("Title is required!");
            return;
        }

        try {
            let newTicket = {
                ...formData,
                statusId: openStatusId,
                clientId: formData.clientId,
                workTypeIds: selectedWorkTypes.map(option => option.value),
                ...(formData.deviceId ? { deviceIds: [formData.deviceId] } : {})
            };

            const response = await axios.post(`${config.API_BASE_URL}/ticket/add`, newTicket);

            if (submitType === "submitAndView") {
                const ticketId = parseInt(response.data.token);
                const newTicketData = await axios.get(`${config.API_BASE_URL}/ticket/${ticketId}`);
                setTicket(newTicketData.data);
                onNavigate(newTicketData.data);
            }
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
            clientId: '',
            crisis: false,
            workTypeIds: [],
            baitWorkerId: '',
            locationId: '',
            baitNumeration: '',
            clientNumeration: '',
            contactIds: [],
            deviceId: undefined
        }); // Reset form fields
        setSelectedWorkTypes([]); // Reset selected work types
    }

    const handleWorkTypeAdded = async (workType) => {
        try {
            const newWorkTypeOption = {value: workType.id, label: workType.workType};

            setWorkTypes(prevWorkTypes => [...prevWorkTypes, newWorkTypeOption]);
            setSelectedWorkTypes(prevSelected => [...prevSelected, newWorkTypeOption]);
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
    };

    const handleLocationAdded = async () => {
        if (formData.clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/locations/${formData.clientId}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        }
    };

    const handleContactAdded = async () => {
        if (formData.clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add a New Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    id="clientId"
                                    required
                                >
                                    {clients.length > 0 && <option value="">Select Customer</option>}
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.fullName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Location</Form.Label>
                                    {formData.clientId && (
                                        <Button
                                            variant="link"
                                            onClick={() => setShowLocationModal(true)}
                                            className="py-0 text-primary"
                                        >
                                            Add New Location
                                        </Button>
                                    )}
                                </div>
                                <Form.Control
                                    as="select"
                                    value={formData.locationId}
                                    onChange={handleChange}
                                    id="locationId"
                                    disabled={!formData.clientId}
                                    required
                                >
                                    {!formData.clientId ? (
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
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <div className="d-flex mb-2">
                                    <Form.Label className="align-items-centre mb-0">Contact</Form.Label>
                                    {formData.clientId && (
                                        <Button
                                            variant="link"
                                            onClick={() => setShowContactModal(true)}
                                            className="py-0 text-primary"
                                        >
                                            Add A New Contact
                                        </Button>
                                    )}
                                </div>
                                <Form.Control
                                    as="select"
                                    value={formData.contactIds[0] || ""}
                                    onChange={handleChange}
                                    id="contactIds"
                                    disabled={!formData.clientId}
                                    required
                                >
                                    {!formData.clientId ? (
                                        <option value="">Pick a customer before picking a contact</option>
                                    ) : (
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
                                    )}
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
                                    {!formData.clientId ? (
                                        <option value="">Pick a customer before picking a device</option>
                                    ) : devices.length === 0 ? (
                                        <option value="">No devices found for this client</option>
                                    ) : (
                                        <>
                                            <option value="">Select a Device</option>
                                            {devices.map((device) => (
                                                <option key={device.id} value={device.id}>
                                                    {device.deviceName}
                                                </option>
                                            ))}
                                        </>
                                    )}
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
                                    <Button
                                        variant="link"
                                        onClick={() => setShowWorkTypeModal(true)}
                                        className="text-primary py-0"
                                    >
                                        Add New Work Type
                                    </Button>
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
                        <Col md={3}>
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
                        <Col md={4}></Col>
                        <Col md={4}>
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
                        <Button
                            variant="secondary"
                            onClick={() => setSubmitType("submitAndView")}
                            type="submit" // This will trigger form validation
                        >
                            Submit and View
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setSubmitType("submit")}
                            type="submit" // This will trigger form validation
                        >
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>

            <AddWorkTypeModal
                show={showWorkTypeModal}
                handleClose={() => setShowWorkTypeModal(false)}
                onAdd={handleWorkTypeAdded}
            />
            <AddLocationModal
                show={showLocationModal}
                handleClose={() => setShowLocationModal(false)}
                onAdd={handleLocationAdded}
                clientId={formData.clientId}
            />
            <AddContactModal
                show={showContactModal}
                handleClose={() => setShowContactModal(false)}
                onAdd={handleContactAdded}
                clientId={formData.clientId}
                locations={locations}
            />
        </Modal>
    );
};

export default AddTicketModal;
