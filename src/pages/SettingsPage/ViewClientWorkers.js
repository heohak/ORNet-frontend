import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewClientWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workersResponse, clientsResponse, locationsResponse, rolesResponse] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/worker/all`),
                    axios.get(`${config.API_BASE_URL}/client/all`),
                    axios.get(`${config.API_BASE_URL}/location/all`),
                    axios.get(`${config.API_BASE_URL}/worker/classificator/all`)
                ]);
                setWorkers(workersResponse.data);
                setClients(clientsResponse.data);
                setLocations(locationsResponse.data);
                setRoles(rolesResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refresh]);

    const handleAddWorker = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/worker/add`, {
                clientId,
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
                locationId,
                roleIds: selectedRoles
            });
            if (response.data && response.data.id) {
                const workerId = response.data.id;
                await axios.put(`${config.API_BASE_URL}/worker/${workerId}/${clientId}`);
                for (const roleId of selectedRoles) {
                    await axios.put(`${config.API_BASE_URL}/worker/role/${workerId}/${roleId}`);
                }
            }
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            setShowAddModal(false); // Close the modal after adding the worker
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        setSelectedRoles(prevSelectedRoles =>
            checked ? [...prevSelectedRoles, value] : prevSelectedRoles.filter(role => role !== value)
        );
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Client Workers</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Worker</Button>
            </div>
            <Row>
                {workers.map((worker) => (
                    <Col md={4} key={worker.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{worker.firstName} {worker.lastName}</Card.Title>
                                <Card.Text>
                                    <strong>Email:</strong> {worker.email}<br />
                                    <strong>Phone:</strong> {worker.phoneNumber}<br />
                                    <strong>Title:</strong> {worker.title}<br />
                                    <strong>Client:</strong> {clients.find(client => client.id === worker.clientId)?.shortName || 'N/A'}<br />
                                    <strong>Location:</strong> {locations.find(location => location.id === worker.locationId)?.name || 'N/A'}<br />
                                    <strong>Roles:</strong> {worker.roleIds.map(roleId => roles.find(role => role.id === roleId)?.role || 'N/A').join(', ')}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Worker</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form onSubmit={handleAddWorker}>
                            <Form.Group className="mb-3">
                                <Form.Label>Client</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.shortName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a location</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Roles</Form.Label>
                                {roles.map((role) => (
                                    <Form.Check
                                        key={role.id}
                                        type="checkbox"
                                        label={role.role}
                                        value={role.id}
                                        onChange={handleRoleChange}
                                    />
                                ))}
                            </Form.Group>
                            <Button variant="success" type="submit">
                                Add Worker
                            </Button>
                        </Form>
                    </Container>
                </Modal.Body>
            </Modal>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default ViewClientWorkers;
