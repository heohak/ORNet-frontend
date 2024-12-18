import React, {useEffect, useState} from 'react';
import {Alert, Button, Card, Col, Form, Row} from 'react-bootstrap';
import EditWorkerModal from './EditWorkerModal';
import axios from 'axios';
import config from "../../config/config";
import {FaEnvelope, FaIdBadge, FaPhone, FaRegStar, FaStar, FaUserTie, FaComment} from 'react-icons/fa';
import '../../css/Customers.css'
import {faEdit, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AddClientWorker from "./AddClientWorker";
import WorkerCommentModal from "./WorkerCommentModal";

function ClientWorker({workers, client, clientId, refresh, setRefresh}) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
    const [workerLocations, setWorkerLocations] = useState({});
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedFilterRoleId, setSelectedFilterRoleId] = useState('');
    const [filteredWorkers, setFilteredWorkers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [favoriteFilter, setFavoriteFilter] = useState(false);

    // For comment modal
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentWorker, setCommentWorker] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchWorkerLocations();
    }, [filteredWorkers]);

    useEffect(() => {
        filterWorkers();
    }, [selectedFilterRoleId, searchQuery, favoriteFilter, refresh]);

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
            const rolesMap = response.data.map(role => ({value: role.id, label: role.role}))
            const sortedRoles = rolesMap.sort((a, b) => a.label.localeCompare(b.label))
            setRoles(sortedRoles);
        } catch (error) {
            console.error('Error fetching roles:', error);
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

            let workersWithRoles = await Promise.all(response.data.map(async worker => {
                const rolesResponse = await axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`);
                const sortedRoles = rolesResponse.data.sort((a, b) => a.role.localeCompare(b.role));
                return {
                    ...worker,
                    roles: sortedRoles
                };
            }));

            // Sort by favorite, then name
            workersWithRoles = workersWithRoles.sort((a, b) => {
                if (a.favorite === b.favorite) {
                    return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                }
                return a.favorite ? -1 : 1;
            });

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
        setShowEditWorkerModal(true);
    };

    const handleUpdateSuccess = async () => {
        filterWorkers();
        setRefresh(prev => !prev);
        setShowEditWorkerModal(false);
    };

    const handleAddWorkerSuccess = async (newWorker) => {
        await fetchRoles();
        try {
            await axios.put(`${config.API_BASE_URL}/worker/${newWorker.id}/${clientId}`);
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
            await axios.put(`${config.API_BASE_URL}/worker/favorite/${workerId}`);
            setFilteredWorkers((prevWorkers) => {
                const updatedWorkers = prevWorkers.map((worker) =>
                    worker.id === workerId ? { ...worker, favorite: !worker.favorite } : worker
                );

                return updatedWorkers.sort((a, b) => {
                    if (a.favorite === b.favorite) {
                        return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                    }
                    return a.favorite ? -1 : 1;
                });
            });
        } catch (error) {
            console.error('Failed to update favorite status');
        } finally {
            filterWorkers();
        }
    };

    const handleOpenCommentModal = (worker) => {
        setCommentWorker(worker);
        setShowCommentModal(true);
    };

    const handleCommentSaved = (workerId, newComment) => {
        setFilteredWorkers((prev) =>
            prev.map((w) => (w.id === workerId ? { ...w, comment: newComment } : w))
        );
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

            <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
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
                        <Col md={4} key={worker.id} className="mb-4">
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
                                        <div style={{display: 'flex', alignItems: 'center'}}>
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
                                                <FontAwesomeIcon icon={faEdit} title="Edit contact"/>
                                            </Button>

                                            {/* Comment icon */}
                                            <Button variant="link" onClick={() => handleOpenCommentModal(worker)}>
                                                <FaComment title="View/Edit Comment" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Card.Text
                                        className="all-page-cardText"
                                        style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                                    >
                                        {/* Role */}
                                        <div>
                                            <FaUserTie className="me-1" />
                                            {worker.roles && worker.roles.length > 0
                                                ? worker.roles.map(role => role.role).join(', ')
                                                : 'N/A'}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <FaPhone className="me-1" />
                                            {worker.phoneNumber ? worker.phoneNumber : 'N/A'}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <FaEnvelope className="me-1" />
                                            {worker.email ? (
                                                <a
                                                    href={`https://outlook.office.com/mail/deeplink/compose?to=${worker.email}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                                >
                                                    {worker.email}
                                                </a>
                                            ) : 'N/A'}
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <FaIdBadge className="me-1" />
                                            {worker.title ? worker.title : 'N/A'}
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            {workerLocations[worker.id]?.name || 'N/A'}
                                        </div>
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
                reFetchRoles={fetchRoles}
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

            {/* Comment Modal */}
            {commentWorker && (
                <WorkerCommentModal
                    show={showCommentModal}
                    onHide={() => setShowCommentModal(false)}
                    worker={commentWorker}
                    onCommentSaved={handleCommentSaved}
                />
            )}
        </>
    );
}

export default ClientWorker;
