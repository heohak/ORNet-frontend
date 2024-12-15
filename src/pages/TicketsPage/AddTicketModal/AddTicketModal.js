import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import config from "../../../config/config";
import {Alert, Button, Col, Form, Modal, Row} from "react-bootstrap";
import Select from "react-select";
import AddWorkTypeModal from "./AddWorkTypeModal";
import AddLocationModal from "./AddLocationModal";
import AddContactModal from "./AddContactModal";
import '../../../css/DarkenedModal.css';



const AddTicketModal = ({show, handleClose, reFetch, onNavigate, setTicket, clientId}) => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        clientId: clientId || '',
        crisis: false,
        workTypeIds: [],
        baitWorkerId: '',
        locationId: '',
        baitNumeration: '',
        clientNumeration: '',
    });

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [availableContacts, setAvailableContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [devices, setDevices] = useState([]);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [submitType, setSubmitType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sortList = (list, type) => {
        if (type === "Contact" || type === "BaitWorker") {
            list = list.sort((a, b) => (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName))
        } else if (type === "Device") {
            list = list.sort((a, b) => a.deviceName.localeCompare(b.deviceName))
        } else if (type === "WorkType") {
            list = list.sort((a, b) => a.label.localeCompare(b.label))
        } else {
            list = list.sort((a, b) => a.name.localeCompare(b.name))
        }
        return list
    }

    useEffect(() => {
        formData.locationId = undefined
        setSelectedContacts([]);
        setSelectedDevices([]);
    },[formData.clientId])


    const changeAvailableDevices = (locationId) => {
        locationId = parseInt(locationId)
        const filteredList = devices.filter(device => device.locationId === locationId)
        const sortedList = sortList(filteredList, "Device")
        setAvailableDevices(sortedList)
    };

    const changeAvailableContacts = (locationId) => {
        locationId = parseInt(locationId)
        const filteredList = contacts.filter(contact => contact.locationId === locationId)
        const sortedList = sortList(filteredList, "Contact")
        setAvailableContacts(sortedList)
    }

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
                setBaitWorkers(sortList(baitWorkerRes.data, "BaitWorker"));
                setWorkTypes(sortList(workTypeRes.data.map(workType => ({value: workType.id, label: workType.workType})), "WorkType"));
                setClients(clientRes.data.sort((a, b) => a.shortName.localeCompare(b.shortName)));

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

                    setLocations(locationRes.data.sort((a, b) => a.name.localeCompare(b.name)));
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
        const {id, value } = e.target;
        let newValue = value;
        if (id === 'contactIds') {
            newValue = [value];
        } else if (id === 'crisis') {
            newValue = parseInt(value);
        } else if (id === 'locationId') {
            changeAvailableDevices(value);
            changeAvailableContacts(value);
            setSelectedContacts([]);
            setSelectedDevices([]);
        }
        setFormData( prevData => ({...prevData, [id]: newValue}));
    };

    const handleDeviceChange = (selectedOptions) => {
        // Since this is a multi-select, `selectedOptions` will be an array of selected objects
        setSelectedDevices(selectedOptions || []); // Fallback to an empty array if no options are selected
        console.log('Selected Devices:', selectedOptions); // Debugging
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        setError(null);
        try {
            let newTicket = {
                ...formData,
                statusId: openStatusId,
                clientId: formData.clientId,
                workTypeIds: selectedWorkTypes.map(option => option.value),
                deviceIds: selectedDevices.map(device => device.id),
                crisis: formData.crisis === 1,
                contactIds: selectedContacts.map(contact => contact.id)

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
        } finally {
            setIsSubmitting(false);
        }
    };

    const onClose = () => {
        resetFields();
        handleClose();
    }

    const resetFields = () => {
        setFormData({
            title: '',
            description: '',
            clientId: clientId || '',
            crisis: false,
            workTypeIds: [],
            baitWorkerId: '',
            locationId: '',
            baitNumeration: '',
            clientNumeration: '',
            contactIds: []
        }); // Reset form fields
        setSelectedWorkTypes([]); // Reset selected work types
        setSelectedDevices([]);
        setSelectedContacts([]);
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

    const handleLocationAdded = (addedLocation) => {
        // Update the locations state by adding the new location
        setLocations(prevLocations => [...prevLocations, addedLocation]);
        // Optionally set the newly added location as the selected location
        setFormData(prevData => ({ ...prevData, locationId: addedLocation.id }));
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
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            className="mt-4"
            dialogClassName={showLocationModal || showContactModal || showWorkTypeModal ? 'dimmed' : ''}
        >
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
                                    value={clientId || formData.clientId}
                                    onChange={handleChange}
                                    id="clientId"
                                    required
                                    disabled={clientId}
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
                                <Select
                                    isMulti
                                    options={availableContacts}
                                    value={selectedContacts}
                                    onChange={setSelectedContacts}
                                    getOptionLabel={option => `${option.favorite ? '★ ' : ''}${option.firstName} ${option.lastName}`}
                                    getOptionValue={option => option.id}
                                    isDisabled={!formData.clientId || !formData.locationId}
                                    placeholder={
                                        !formData.clientId
                                            ? "Pick a customer before picking contacts"
                                            : !formData.locationId
                                                ? "Pick a location before picking contacts"
                                                : "Select contacts"
                                    }
                                    components={{ Option: ContactOption }}

                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={7}>
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
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Device</Form.Label>
                                <Select
                                    isMulti
                                    options={availableDevices}
                                    value={selectedDevices}
                                    onChange={setSelectedDevices} // Use the new handler
                                    placeholder={
                                        !formData.clientId
                                            ? "Pick a customer before picking devices"
                                            : !formData.locationId
                                                ? "Pick a location before picking devices"
                                                : "Select devices"
                                    }
                                    isDisabled={!formData.clientId || !formData.locationId}
                                    getOptionLabel={(option) => option.deviceName} // This is optional, just to provide clarity
                                    getOptionValue={(option) => option.id} // Ensures unique value
                                    components={{ Option: deviceOption}}
                                />
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
                                    <Form.Label className="align-items-centre mb-0">Work Types</Form.Label>
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
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Numeration</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.clientNumeration}
                                    onChange={handleChange}
                                    id="clientNumeration"
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
                                <Form.Label>Assignee</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.baitWorkerId}
                                    onChange={handleChange}
                                    id="baitWorkerId"
                                >
                                    <option value="">Select Assignee</option>
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
                            variant="primary"
                            onClick={() => setSubmitType("submitAndView")}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && submitType === "submitAndView" ? 'Submitting...' : 'Submit and View'}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setSubmitType("submit")}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && submitType === "submit" ? 'Submitting...' : 'Submit'}
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
                onHide={() => setShowLocationModal(false)}
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
