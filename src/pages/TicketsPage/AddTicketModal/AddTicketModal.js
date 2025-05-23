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
import axiosInstance from "../../../config/axiosInstance";
import AsyncSelect from "react-select/async";



const AddTicketModal = ({show, handleClose, reFetch, onNavigate, setTicket, clientId, statuses}) => {

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
        statusId: '',
    });

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [availableContacts, setAvailableContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
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
    const [defaultDeviceOptions, setDefaultDeviceOptions] = useState([]);
    const [refresh, setRefresh] = useState(false);


    const sortList = (list, type) => {
        if (type === "Contact" || type === "BaitWorker") {
            list = list.sort((a, b) => {
                // First, prioritize favorites
                if (a.favorite !== b.favorite) {
                    return b.favorite - a.favorite; // True (1) comes before False (0)
                }
                // Then, sort alphabetically by first and last name
                return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
            });
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

    const changeAvailableContacts = (availableContacts) => {
        const sortedList = sortList(availableContacts, "Contact")
        setAvailableContacts(sortedList)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [baitWorkerRes, clientRes, workTypeRes] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/bait/worker/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/client/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`),
                ]);

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
        const fetchLocationsAndContacts = async () => {
            if (formData.clientId) {
                try {
                    const locationRes = await axiosInstance.get(`${config.API_BASE_URL}/client/locations/${formData.clientId}`);
                    const contactRes = await axiosInstance.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);

                    const contactsWithRoles = await Promise.all(
                        contactRes.data.map(async contact => {
                            const rolesRes = await axiosInstance.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                            return {...contact, roles: rolesRes.data.map(role => role.role)};
                        })
                    );

                    setLocations(locationRes.data.sort((a, b) => a.name.localeCompare(b.name)));
                    setContacts(contactsWithRoles);
                    changeAvailableContacts(contactsWithRoles);
                } catch (error) {
                    console.error('Error fetching locations or contacts:', error);
                }
            }
        };

        fetchLocationsAndContacts();
    }, [formData.clientId, refresh]);

    const handleChange = (e) => {
        const {id, value } = e.target;
        let newValue = value;
        if (id === 'contactIds') {
            newValue = [value];
        } else if (id === 'crisis') {
            newValue = parseInt(value);
        } else if (id === 'locationId') {
            changeAvailableDevices(value);
            setSelectedContacts([]);
            setSelectedDevices([]);
        }
        setFormData( prevData => ({...prevData, [id]: newValue}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);
        setError(null);
        try {
            let newTicket = {
                ...formData,
                clientId: formData.clientId,
                workTypeIds: selectedWorkTypes.map(option => option.value),
                deviceIds: selectedDevices.map(device => device.id),
                crisis: formData.crisis === 1,
                contactIds: selectedContacts.map(contact => contact.id)

            };

            const response = await axiosInstance.post(`${config.API_BASE_URL}/ticket/add`, newTicket);

            if (submitType === "submitAndView") {
                const ticketId = parseInt(response.data.token);
                const newTicketData = await axiosInstance.get(`${config.API_BASE_URL}/ticket/${ticketId}`);
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
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);
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
                <div style={{ fontSize: '0.85em', color: '#666' }}>CRN: {[data.workstationNo, data.cameraNo, data.otherNo].filter(Boolean).join('/')}</div>
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

    // Function to fetch options dynamically from the endpoint
    const loadDeviceOptions = async (inputValue) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    q: inputValue,
                    locationId: formData.locationId,
                    clientId: formData.clientId,
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

    useEffect(() => {
        const fetchDefaultDeviceOptions = async () => {
            if (formData.clientId && formData.locationId) {
                try {
                    const response = await axiosInstance.get(`${config.API_BASE_URL}/device/search`, {
                        params: {
                            q: '',
                            locationId: formData.locationId,
                            clientId: formData.clientId,
                        },
                    });

                    const devicesWithCrn = response.data.map((device) => ({
                        ...device,
                        crn: `${device.workstationNo || ''}${device.cameraNo || ''}${device.otherNo || ''}`,
                        label: `${device.deviceName}`,
                        value: device.id,
                    }));

                    setDefaultDeviceOptions(devicesWithCrn);
                } catch (error) {
                    console.error("Error fetching devices:", error);
                    setDefaultDeviceOptions([]);
                }
            } else {
                setDefaultDeviceOptions([]);
            }
        };

        fetchDefaultDeviceOptions();
    }, [formData.clientId, formData.locationId]);



    return (
        <Modal
            show={show}
            onHide={onClose}
            size="xl"
            className="mt-4"
            backdrop="static"
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
                                <Select
                                    options={[...clients].sort((a, b) => a.fullName.localeCompare(b.fullName))}

                                    getOptionLabel={client => client.fullName}
                                    getOptionValue={client => client.id.toString()}
                                    value={clients.find(client => client.id === Number(formData.clientId)) || null}
                                    onChange={selectedClient => {
                                        if (selectedClient) {
                                            setFormData(prevData => ({
                                                ...prevData,
                                                clientId: selectedClient.id.toString(),
                                            }));
                                        } else {
                                            setFormData(prevData => ({ ...prevData, clientId: "" }));
                                        }
                                    }}
                                    isDisabled={!!clientId}
                                    isSearchable={true}
                                    placeholder={clientId ? "Customer locked to selected" : "Select Customer"}
                                />
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
                                    {formData.clientId && formData.locationId && (
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
                                    placeholder="Enter Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    id="title"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Devices</Form.Label>
                                <AsyncSelect
                                    isMulti
                                    cacheOptions
                                    defaultOptions={defaultDeviceOptions}
                                    loadOptions={loadDeviceOptions}
                                    value={selectedDevices}
                                    onChange={setSelectedDevices}
                                    placeholder="Search and select devices"
                                    components={{ Option: deviceOption }}
                                    isDisabled={!formData.clientId || !formData.locationId}
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
                                    placeholder="Enter Description"
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
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={formData.statusId}
                                    onChange={handleChange}
                                    id="statusId"
                                    required
                                >
                                    <option value="">Select Status</option>
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.status}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>


                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Numeration</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Customer Numeration"
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
                selectedLocation={formData.locationId}
                refresh={() => setRefresh(!refresh)}
            />
        </Modal>
    );
};

export default AddTicketModal;
