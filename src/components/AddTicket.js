import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Container, Alert, Badge, Row, Stack, Col } from 'react-bootstrap';
import moment from 'moment';
import config from "../config/config";

function AddTicket() {
    const { mainTicketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const clientIdParam = queryParams.get('clientId');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rootCause: '',
        clientId: clientIdParam || '',
        startDateTime: '',
        crisis: false,
        remote: false,
        workTypeIds: [], // Changed from workType to workTypeIds
        baitWorkerId: '',
        locationId: '',
        statusId: ''
    });


    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [clientName, setClientName] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [availableOptions, setAvailableOptions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationRes, statusRes, baitWorkerRes, clientRes, workTypeRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/worker/all`),
                    !clientIdParam && axios.get(`${config.API_BASE_URL}/client/all`),
                    axios.get(`${config.API_BASE_URL}/work-type/classificator/all`)
                ]);

                setLocations(locationRes.data);
                setStatuses(statusRes.data);
                setBaitWorkers(baitWorkerRes.data);
                const fetchedWorkTypes = workTypeRes.data;
                setWorkTypes(fetchedWorkTypes);
                setAvailableOptions(fetchedWorkTypes); // Set available options initially
                if (clientRes) setClients(clientRes.data);

                if (clientIdParam) {
                    const clientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientIdParam}`);
                    setClientName(clientResponse.data.fullName);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [clientIdParam]);


    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelection = (e) => {
        const selectedValue = parseInt(e.target.value, 10);
        if (selectedValue) {
            const selectedWorkType = workTypes.find(type => type.id === selectedValue);
            if (selectedWorkType) {
                setSelectedOptions(prev => [...prev, selectedWorkType]);
                setAvailableOptions(prev => prev.filter(option => option.id !== selectedValue));
            }
            e.target.value = ''; // Reset dropdown selection
        }
    };

    const removeBubble = (workTypeId) => {
        setSelectedOptions(prev => prev.filter(option => option.id !== workTypeId));
        setAvailableOptions(prev => [
            ...prev,
            workTypes.find(option => option.id === workTypeId)
        ].sort((a, b) => a.id - b.id)); // Sort if needed
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const localDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');

            const newTicket = {
                ...formData,
                startDateTime: localDateTime,
                clientId: formData.clientId || clients.find(client => client.id === formData.clientId)?.id,
                workTypeIds: selectedOptions.map(option => option.id), // Map selected work type objects to IDs
                ...(mainTicketId && { mainTicketId })
            };

            await axios.post(`${config.API_BASE_URL}/ticket/add`, newTicket);
            navigate(mainTicketId ? `/ticket/${mainTicketId}` : `/tickets`);
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <Container className="mt-5">
            <h1 className="mb-4">{clientIdParam ? `Add Ticket for ${clientName}` : "Add a New Ticket"}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="title" className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="crisis" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Crisis"
                        checked={formData.crisis}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="remote" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Remote"
                        checked={formData.remote}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <div>
                        <Form.Label column sm={2}>
                            Select Work Type
                        </Form.Label>
                    </div>
                    <Col sm={10}>
                        <Form.Control as="select" onChange={handleSelection}>
                            <option value="">Select an option</option>
                            {availableOptions.map(workType => (
                                <option key={workType.id} value={workType.id}>
                                    {workType.workType}
                                </option>
                            ))}
                        </Form.Control>
                    </Col>
                </Form.Group>

                <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
                    {selectedOptions.map(workType => (
                        <Badge
                            key={workType.id}
                            pill
                            bg="primary"
                            className="position-relative d-flex align-items-center"
                        >
                            {workType.workType}
                            <Button
                                variant="outline-light"
                                className="position-absolute top-0 end-0 ms-2"
                                size="sm"
                                onClick={() => removeBubble(workType.id)}
                            >
                                &times;
                            </Button>
                        </Badge>
                    ))}
                </Stack>

                <Form.Group controlId="rootCause" className="mb-3">
                    <Form.Label>Root Cause</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.rootCause}
                        onChange={handleChange}
                    />
                </Form.Group>
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
                {!clientIdParam && (
                    <Form.Group controlId="clientId" className="mb-3">
                        <Form.Label>Client</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData.clientId}
                            onChange={handleChange}
                            id="clientId"
                            required
                        >
                            {clients.length > 0 && <option value="">Select Client</option>}
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.fullName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        as="select"
                        value={formData.locationId}
                        onChange={handleChange}
                        id="locationId"
                    >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
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
                <div className="mb-3">
                    <Button variant="success" type="submit">
                        Submit
                    </Button>
                    <Button className="gy-5" onClick={() => navigate(-1)}>Back</Button>
                </div>
            </Form>
        </Container>
    );
}

export default AddTicket;
