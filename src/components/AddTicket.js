import React, {useEffect, useState} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import config from "../config/config";

function AddTicket() {
    const { mainTicketId } = useParams();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const clientIdParam = queryParams.get('clientId');

    const [description, setDescription] = useState('');
    const [rootCause, setRootCause] = useState("");
    const [clientId, setClientId] = useState(clientIdParam || '');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [responseDateTime, setResponseDateTime] = useState('');
    const [crisis, setCrisis] = useState(false);
    const [remote, setRemote] = useState(false);
    const [workType, setWorkType] = useState("");
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [baitWorkersIds, setBaitWorkersIds] = useState([]);
    const [locationIds, setLocationIds] = useState([]);
    const [statusIds, setStatusIds] = useState([]);
    const [status, setStatus] = useState([]);
    const [error, setError] = useState(null);

    const navigate = useNavigate();



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationRes, statusRes, baitWorkerRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/workers`)
                ]);
                setLocations(locationRes.data);
                setStatus(statusRes.data);
                setBaitWorkers(baitWorkerRes.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const newTicket = {
                description,
                clientId,
                startDateTime,
                endDateTime,
                responseDateTime,
                crisis,
                remote,
                workType,
                baitWorkerId: baitWorkersIds.length > 0 ? baitWorkersIds[0] : '',
                locationId: locationIds.length > 0 ? locationIds[0] : '',
                statusId: statusIds.length > 0 ? statusIds[0] : '',
                rootCause,
                ...(mainTicketId && { mainTicketId })  // Include mainTicketId only if it's provided
            };
            await axios.post(`${config.API_BASE_URL}/ticket/add`, newTicket);
            if (!mainTicketId) {
                navigate(`/tickets`);
            } else {
                navigate(`/ticket/${mainTicketId}`);
            }
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="startDateTime" className="mb-3">
                    <Form.Label>Start Date Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="endDateTime" className="mb-3">
                    <Form.Label>End Date Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="responseDateTime" className="mb-3">
                    <Form.Label>Response Date Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={responseDateTime}
                        onChange={(e) => setResponseDateTime(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="crisis" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Crisis"
                        checked={crisis}
                        onChange={(e) => setCrisis(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group controlId="remote" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Remote"
                        checked={remote}
                        onChange={(e) => setRemote(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group controlId="workType" className="mb-3">
                    <Form.Label>Work Type</Form.Label>
                    <Form.Control
                        type="text"
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="workType" className="mb-3">
                    <Form.Label>Root Cause</Form.Label>
                    <Form.Control
                        type="text"
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Responsible</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={baitWorkersIds}
                        onChange={(e) => setBaitWorkersIds([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {baitWorkers.map(baitWorker => (
                            <option key={baitWorker.id} value={baitWorker.id}>
                                {baitWorker.firstName + " " + baitWorker.lastName}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                {!clientIdParam && (
                    <Form.Group controlId="clientId" className="mb-3">
                        <Form.Label>Client ID</Form.Label>
                        <Form.Control
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        />
                    </Form.Group>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Locations</Form.Label>
                    <Form.Control
                        as="select"
                        multiple
                        value={locationIds}
                        onChange={(e) => setLocationIds([...e.target.selectedOptions].map(option => option.value))}
                    >
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
                        multiple
                        value={statusIds}
                        onChange={(e) => setStatusIds([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {status.map(status => (
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
