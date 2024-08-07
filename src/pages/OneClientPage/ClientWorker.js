import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, ListGroup, Alert, Form } from 'react-bootstrap';
import AddWorker from './AddClientWorker';
import axios from 'axios';
import config from "../../config/config";
import Select from 'react-select';

function ClientWorker({ workers, client, clientId, setRefresh }) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [expandedWorkerId, setExpandedWorkerId] = useState(null);
    const [workerLocations, setWorkerLocations] = useState({});
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedFilterRoleId, setSelectedFilterRoleId] = useState(''); // State for filtering
    const [selectedRoles, setSelectedRoles] = useState([]); // State for adding roles in modal
    const [filteredWorkers, setFilteredWorkers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRoles();
        fetchWorkers();
    }, []);

    useEffect(() => {
        fetchWorkerLocations();
    }, [filteredWorkers]);

    useEffect(() => {
        filterWorkers();
    }, [selectedFilterRoleId, searchQuery]);

    const fetchWorkerLocations = async () => {
        try {
            const locationPromises = filteredWorkers.map(worker =>
                axios.get(`${config.API_BASE_URL}/worker/location/${worker.id}`)
            );
            const locationResponses = await Promise.all(locationPromises);
            const locations = {};
            locationResponses.forEach((response, index) => {
                const workerId = filteredWorkers[index].id;
                console.log(`Worker ${workerId} Location:`, response.data); // Debug line
                locations[workerId] = response.data;
            });
            setWorkerLocations(locations);
        } catch (error) {
            console.error('Error fetching worker locations:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
            console.log('Roles:', response.data); // Debug line
            setRoles(response.data.map(role => ({ value: role.id, label: role.role })));
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchWorkers = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${clientId}`);
            console.log('Workers:', response.data); // Debug line

            const workersWithRolesPromises = response.data.map(async (worker) => {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`);
                console.log(`Worker ${worker.id} Roles:`, rolesResponse.data); // Debug line
                return { ...worker, roles: rolesResponse.data };
            });
            const workersWithRoles = await Promise.all(workersWithRolesPromises);
            setFilteredWorkers(workersWithRoles);
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const toggleWorkerDetails = async (workerId) => {
        if (expandedWorkerId === workerId) {
            setExpandedWorkerId(null);
        } else {
            setExpandedWorkerId(workerId);
            if (!workerLocations[workerId]) {
                try {
                    const response = await axios.get(`${config.API_BASE_URL}/worker/location/${workerId}`);
                    console.log(`Location for worker ${workerId}:`, response.data); // Debug line
                    const location = response.data;
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
            // Fetch current roles of the selected worker
            const currentRolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${selectedWorkerId}`);
            const currentRoles = currentRolesResponse.data.map(role => role.id);

            // Combine current roles with the newly selected roles
            const roleIds = [...new Set([...currentRoles, ...selectedRoles.map(role => role.value)])];

            console.log(`Adding roles to worker ${selectedWorkerId}:`, roleIds); // Debug line

            // Send the combined list of role IDs to the backend
            await axios.put(`${config.API_BASE_URL}/worker/role/${selectedWorkerId}`, { roleIds });

            setShowAddRoleModal(false);
            setSelectedRoles([]); // Clear selected roles after submission
            await fetchWorkers(); // Refresh the workers to reflect the updated roles
        } catch (error) {
            console.error('Error adding roles to worker:', error);
        }
    };


    const filterWorkers = async () => {
        try {
            console.log('Filtering with query:', searchQuery, 'and role:', selectedFilterRoleId); // Debug line
            const response = await axios.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    q: searchQuery,
                    roleId: selectedFilterRoleId || null,
                    clientId: clientId
                }
            });
            console.log('Filtered Workers:', response.data); // Debug line

            const workersWithRoles = await Promise.all(response.data.map(async worker => {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`);
                console.log(`Worker ${worker.id} Roles after filter:`, rolesResponse.data); // Debug line
                return {
                    ...worker,
                    roles: rolesResponse.data
                };
            }));

            setFilteredWorkers(workersWithRoles);
        } catch (error) {
            console.error('Error filtering workers:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddWorkerSuccess = async (newWorker) => {
        try {
            setFilteredWorkers((prevWorkers) => [...prevWorkers, newWorker]);

            const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${newWorker.id}`);
            console.log(`Roles for newly added worker ${newWorker.id}:`, rolesResponse.data); // Debug line
            const updatedWorker = { ...newWorker, roles: rolesResponse.data };

            setFilteredWorkers((prevWorkers) =>
                prevWorkers.map(worker => worker.id === updatedWorker.id ? updatedWorker : worker)
            );

            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error fetching roles for the new worker:', error);
        }
    };

    return (
        <>
            <h2 className="mb-4">Workers</h2>
            <Button variant="primary" onClick={() => setShowAddWorkerModal(true)}>Add Worker</Button>
            <Form.Group controlId="search" className="mt-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search workers..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </Form.Group>
            <Form.Group controlId="roleFilter" className="mt-3">
                <Form.Label>Filter by Role</Form.Label>
                <Form.Control as="select" value={selectedFilterRoleId} onChange={(e) => setSelectedFilterRoleId(e.target.value)}>
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
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
                                            {worker.roles && worker.roles.length > 0 && (
                                                <Card.Text>
                                                    <strong>Roles: </strong>{worker.roles.map(role => role.role).join(', ')}
                                                </Card.Text>
                                            )}
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
                    <AddWorker clientId={clientId} onClose={() => setShowAddWorkerModal(false)} onSuccess={handleAddWorkerSuccess} />
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
                            <Select
                                isMulti
                                options={roles}
                                value={selectedRoles}
                                onChange={setSelectedRoles}
                                placeholder="Select roles"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Add Roles
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientWorker;
