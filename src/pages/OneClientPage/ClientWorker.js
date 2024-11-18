import React, {useEffect, useState} from 'react';
import {Alert, Button, Card, Col, Form, Modal, Row} from 'react-bootstrap';
import EditWorkerModal from './EditWorkerModal'; // Import the EditWorkerModal component
import axios from 'axios';
import config from "../../config/config";
import {FaEnvelope, FaPhone, FaRegStar, FaStar, FaUserTie} from 'react-icons/fa';
import '../../css/Customers.css'
import {faEdit, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AddClientWorker from "./AddClientWorker";

function ClientWorker({workers, client, clientId, setRefresh}) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
    const [workerLocations, setWorkerLocations] = useState({});
    const [selectedWorker, setSelectedWorker] = useState(null); // State to hold the selected worker for editing
    const [roles, setRoles] = useState([]);
    const [selectedFilterRoleId, setSelectedFilterRoleId] = useState(''); // State for filtering
    const [filteredWorkers, setFilteredWorkers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [favoriteFilter, setFavoriteFilter] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchWorkers();
    }, []);

    useEffect(() => {
        fetchWorkerLocations();
    }, [filteredWorkers]);

    useEffect(() => {
        filterWorkers();
    }, [selectedFilterRoleId, searchQuery, favoriteFilter]);

    const fetchWorkerLocations = async () => {
        try {
            const locationPromises = filteredWorkers.map(worker =>
                axios.get(`${config.API_BASE_URL}/worker/location/${worker.id}`)
            );
            const locationResponses = await Promise.all(locationPromises);
            const locations = {};
            locationResponses.forEach((response, index) => {
                const workerId = filteredWorkers[index].id;
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
            setRoles(response.data.map(role => ({value: role.id, label: role.role})));
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchWorkers = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${clientId}`);
            const workersWithRolesPromises = response.data.map(async (worker) => {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`);
                return {...worker, roles: rolesResponse.data};
            });
            const workersWithRoles = await Promise.all(workersWithRolesPromises);
            setFilteredWorkers(workersWithRoles);
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const filterWorkers = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    q: searchQuery,
                    roleId: selectedFilterRoleId || null,
                    clientId: clientId,
                    favorite: favoriteFilter || null
                }
            });

            const workersWithRoles = await Promise.all(response.data.map(async worker => {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`);
                const sortedRoles = rolesResponse.data.sort((a, b) => a.id - b.id)
                return {
                    ...worker,
                    roles: sortedRoles
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

    const handleEditWorker = (worker) => {
        setSelectedWorker(worker);
        setShowEditWorkerModal(true); // Open the EditWorkerModal
    };

    const handleUpdateSuccess = async () => {
        await fetchWorkers(); // Refresh the workers after a successful update
        setRefresh(prev => !prev);
        setShowEditWorkerModal(false); // Close the modal after update
    };

    const handleAddWorkerSuccess = async (newWorker) => {
        await fetchRoles();  //Silent fetch to show new roles for the other workers as well
        try {
            setFilteredWorkers((prevWorkers) => [...prevWorkers, newWorker]);

            const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${newWorker.id}`);
            const updatedWorker = {...newWorker, roles: rolesResponse.data};

            setFilteredWorkers((prevWorkers) =>
                prevWorkers.map(worker => worker.id === updatedWorker.id ? updatedWorker : worker)
            );

            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error fetching roles for the new worker:', error);
        }
    };

    const toggleFavorite = async (workerId) => {
        try {
            // Make the API call to toggle the favorite status
            await axios.put(`${config.API_BASE_URL}/worker/favorite/${workerId}`);

            // Update the favorite status in the local state and re-sort the list
            setFilteredWorkers((prevWorkers) => {
                const updatedWorkers = prevWorkers.map((worker) =>
                    worker.id === workerId ? { ...worker, favorite: !worker.favorite } : worker
                );

                // Sort the updated workers to place favorites at the top
                return updatedWorkers.sort((a, b) => (a.favorite === b.favorite) ? 0 : a.favorite ? -1 : 1);
            });
        } catch (error) {
            console.log('Failed to update favorite status');
        }
    };

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>Contacts</h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddWorkerModal(true)}>
                        Add Contact
                    </Button>
                </Col>
            </Row>

            <Form className="mb-3">
                <Row className="align-items-end">
                    <Col md={3}>
                        <Form.Group controlId="search">
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="roleFilter">
                            <Form.Label>Filter by Role</Form.Label>
                            <Form.Control as="select" value={selectedFilterRoleId}
                                          onChange={(e) => setSelectedFilterRoleId(e.target.value)}>
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="favoriteFilter" className="d-flex align-items-end">
                            <Form.Check
                                type="checkbox"
                                label="Show Only Favorites"
                                checked={favoriteFilter}
                                onChange={(e) => setFavoriteFilter(e.target.checked)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            {filteredWorkers.length > 0 ? (
                <Row className="mt-3">
                    {filteredWorkers.map((worker) => (
                        <Col md={4} key={worker.id} className="mb-4"> {/* Adjust column size as needed */}
                            <Card className="h-100 position-relative customer-page-card">
                                <Card.Body className="all-page-cardBody">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Card.Title className='all-page-cardTitle'>
                                            {worker.firstName} {worker.lastName}
                                        </Card.Title>
                                        <div>
                                            <span
                                                style={{
                                                    cursor: 'pointer',
                                                    color: worker.favorite ? 'gold' : 'gray',
                                                    marginRight: '10px'
                                                }}
                                                onClick={() => toggleFavorite(worker.id)}
                                            >
                                                {worker.favorite ? <FaStar/> : <FaRegStar/>}
                                            </span>

                                            <Button variant="link" onClick={() => handleEditWorker(worker)}>
                                                <FontAwesomeIcon icon={faEdit}
                                                                 title="Edit contact"/>
                                            </Button>
                                        </div>
                                    </div>
                                    <Card.Text className="all-page-cardText">
                                        {/* Role and title */}
                                        <FaUserTie className="me-1" /> {worker.roles.map(role => role.role).join(', ')} {worker.title ? `(${worker.title})` : ''} <br />

                                        {/* Location */}
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> {workerLocations[worker.id]?.name || "N/A"} <br />

                                        {/* Phone */}
                                        <FaPhone className="me-1" /> {worker.phoneNumber} <br />

                                        {/* Email */}
                                        <FaEnvelope className="me-1" /> {worker.email}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert className="mt-3" variant="info">No workers available.</Alert>
            )}

            {/* AddClientWorker Modal */}
            <AddClientWorker
                show={showAddWorkerModal}
                onClose={() => setShowAddWorkerModal(false)}
                clientId={clientId}
                onSuccess={handleAddWorkerSuccess}
            />
            {selectedWorker && (
                <EditWorkerModal
                    show={showEditWorkerModal}
                    handleClose={() => setShowEditWorkerModal(false)}
                    worker={selectedWorker}
                    onUpdateSuccess={handleUpdateSuccess}
                    roles={roles}
                    clientId={clientId}
                />
            )}
        </>
    );
}

export default ClientWorker;
