import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css';
import config from "../config/config";

function AddTicket() {
    const { mainTicketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const clientIdParam = queryParams.get('clientId');

    const [formData, setFormData] = useState({
        description: '',
        rootCause: '',
        clientId: clientIdParam || '',
        startDateTime: '',
        endDateTime: '',
        responseDateTime: '',
        crisis: false,
        remote: false,
        workType: '',
        baitWorkerId: '',
        locationId: '',
        statusId: ''
    });

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationRes, statusRes, baitWorkerRes, clientRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/worker/all`),
                    !clientIdParam && axios.get(`${config.API_BASE_URL}/client/all`)
                ]);

                setLocations(locationRes.data);
                setStatuses(statusRes.data);
                setBaitWorkers(baitWorkerRes.data);
                if (clientRes) setClients(clientRes.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [clientIdParam]);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateTimeChange = (date, id) => {
        setFormData((prevData) => ({
            ...prevData,
            [id]: moment(date).format('YYYY-MM-DDTHH:mm:ss')
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const newTicket = {
                ...formData,
                clientId: formData.clientId || clients.find(client => client.id === formData.clientId).id,
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
            <h1 className="mb-4">Add Ticket</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="startDateTime" className="mb-3">
                    <Form.Label>Start Date Time</Form.Label>
                    <Datetime
                        value={formData.startDateTime}
                        onChange={(date) => handleDateTimeChange(date, 'startDateTime')}
                        dateFormat="YYYY-MM-DD"
                        timeFormat="HH:mm"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="endDateTime" className="mb-3">
                    <Form.Label>End Date Time</Form.Label>
                    <Datetime
                        value={formData.endDateTime}
                        onChange={(date) => handleDateTimeChange(date, 'endDateTime')}
                        dateFormat="YYYY-MM-DD"
                        timeFormat="HH:mm"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="responseDateTime" className="mb-3">
                    <Form.Label>Response Date Time</Form.Label>
                    <Datetime
                        value={formData.responseDateTime}
                        onChange={(date) => handleDateTimeChange(date, 'responseDateTime')}
                        dateFormat="YYYY-MM-DD"
                        timeFormat="HH:mm"
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
                <Form.Group controlId="workType" className="mb-3">
                    <Form.Label>Work Type</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.workType}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="rootCause" className="mb-3">
                    <Form.Label>Root Cause</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.rootCause}
                        onChange={handleChange}
                        required
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
                        >
                            <option value="">Select Client</option>
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
                    >
                        <option value="">Select Status</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>
                                {status.status}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Button variant="success" type="submit">
                    Submit
                </Button>
                <Button className="gy-5" onClick={() => navigate(-1)}>Back</Button>
            </Form>
        </Container>
    );
}

export default AddTicket;
