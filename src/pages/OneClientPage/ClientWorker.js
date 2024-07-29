import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, ListGroup, Alert, Form } from 'react-bootstrap';
import AddWorker from './AddClientWorker'; // Update the import path as necessary
import axios from 'axios';
import config from "../../config/config"; // Import axios for making HTTP requests

function ClientWorker({ workers, client, clientId, setRefresh }) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [expandedWorkerId, setExpandedWorkerId] = useState(null);
    const [workerLocations, setWorkerLocations] = useState({});
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [filteredWorkers, setFilteredWorkers] = useState(workers);

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchWorkerLocations();
    }, [workers]);

    useEffect(() => {
        filterWorkers();
    }, [selectedRoleId]);

    const fetchWorkerLocations = async () => {
        try {
            const locationPromises = workers.map(worker =>
                axios.get(`${config.API_BASE_URL}/worker/location/${worker.id}`));
            const locationResponses = await Promise.all(locationPromises);
            const locations = {};
            locationResponses.forEach((response, index) => {
                const workerId = workers[index].id;
                locations[workerId] = response.data; // Assuming response.data is the location object
            });
            setWorkerLocations(locations);
        } catch (error) {
            console.error('Error fetching worker locations:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const toggleWorkerDetails = async (workerId) => {
        if (expandedWorkerId === workerId) {
            setExpandedWorkerId(null); // Collapse if already expanded
        } else {
            setExpandedWorkerId(workerId); // Expand the worker
            if (!workerLocations[workerId]) {
                try {
                    const response = await axios.get(`${config.API_BASE_URL}/worker/location/${workerId}`);
                    const location = response.data; // Assuming response.data is the location object
                    setWorkerLocations(prevLocations => ({
                        ...prevLocations,
                        [workerId]: location
                    }));
                } catch (error) {
                    console.error(`Error fetching location for worker ${workerId}:`, error);
                }
            }
        }
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/worker/role/${selectedWorkerId}/${selectedRoleId}`);
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            setShowAddRoleModal(false);
        } catch (error) {
            console.error('Error adding role to worker:', error);
        }
    };

    const filterWorkers = async () => {
        if (selectedRoleId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/worker/filter/${clientId}/${selectedRoleId}`);
                setFilteredWorkers(response.data);
            } catch (error) {
                console.error('Error filtering workers:', error);
            }
        } else {
            setFilteredWorkers(workers);
        }
    };

    return (
        <>
            <h2 className="mb-4">
                {'Workers'}
            </h2>
            <Button variant="primary" onClick={() => setShowAddWorkerModal(true)}>Add Worker</Button>
            <Form.Group controlId="roleFilter" className="mt-3">
                <Form.Label>Filter by Role</Form.Label>
                <Form.Control as="select" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.role}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            {filteredWorkers.length > 0 ? (
                <ListGroup className="mt-3">
                    {filteredWorkers.map((worker) => (
                        <ListGroup.Item key={worker.id}>
                            <Card>
                                <Card.Body>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Card.Title>Title: {worker.title}</Card.Title>
                                            <Card.Text>
                                                <strong>Name: </strong>{worker.firstName + " " + worker.lastName}
                                            </Card.Text>
                                        </div>
                                        <div>
                                            <Button variant="link" onClick={() => toggleWorkerDetails(worker.id)}>
                                                {expandedWorkerId === worker.id ? '▲' : '▼'}
                                            </Button>
                                            <Button variant="link" onClick={() => { setSelectedWorkerId(worker.id); setShowAddRoleModal(true); }}>
                                                Add Role
                                            </Button>
                                        </div>
                                    </div>
                                    {expandedWorkerId === worker.id && workerLocations[worker.id] && (
                                        <div>
                                            <Card.Text><strong>Phone: </strong>{worker.phoneNumber}</Card.Text>
                                            <Card.Text><strong>Email: </strong>{worker.email}</Card.Text>
                                            <Card.Text><strong>Location: </strong>{workerLocations[worker.id].name}</Card.Text>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No workers available.</Alert>
            )}

            <Modal show={showAddWorkerModal} onHide={() => setShowAddWorkerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Worker to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddWorker clientId={clientId} onClose={() => setShowAddWorkerModal(false)} setRefresh={setRefresh} />
                </Modal.Body>
            </Modal>

            <Modal show={showAddRoleModal} onHide={() => setShowAddRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Role to Worker</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddRole}>
                        <Form.Group controlId="roleSelect">
                            <Form.Label>Select Role</Form.Label>
                            <Form.Control as="select" value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} required>
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.role}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Add Role
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientWorker;
