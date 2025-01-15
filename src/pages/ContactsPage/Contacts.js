import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter';
import '../../css/Contacts.css';
import {FaEnvelope, FaPhone, FaUserTie, FaComment, FaIdBadge} from "react-icons/fa";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuilding, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import WorkerCommentModal from "../OneClientPage/WorkerCommentModal";
import axiosInstance from "../../config/axiosInstance"; // Adjust the path if necessary

function Contacts() {
    const [workers, setWorkers] = useState([]);
    const [workerEmployers, setWorkerEmployers] = useState({});
    const [workerLocations, setWorkerLocations] = useState({});
    const [workerRoles, setWorkerRoles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    // State for comment modal
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentWorker, setCommentWorker] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true); // Start loading

            try {
                // Fetch workers data
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`);

                // Sort workers
                const sortedWorkers = response.data.sort((a, b) => {
                    if (a.favorite === b.favorite) {
                        return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                    }
                    return a.favorite ? -1 : 1; // Favorites come first
                });

                // Fetch additional details for each worker (employers, locations, roles)
                const [employerResponses, locationResponses, roleResponses] = await Promise.all([
                    Promise.all(sortedWorkers.map(worker =>
                        axiosInstance.get(`${config.API_BASE_URL}/worker/employer/${worker.id}`)
                    )),
                    Promise.all(sortedWorkers.map(worker =>
                        axiosInstance.get(`${config.API_BASE_URL}/worker/location/${worker.id}`)
                    )),
                    Promise.all(sortedWorkers.map(worker =>
                        axiosInstance.get(`${config.API_BASE_URL}/worker/role/${worker.id}`)
                    ))
                ]);

                // Process and store the additional data
                const employers = {};
                const locations = {};
                const roles = {};

                employerResponses.forEach((response, index) => {
                    const workerId = sortedWorkers[index].id;
                    employers[workerId] = response.data.shortName;
                });

                locationResponses.forEach((response, index) => {
                    const workerId = sortedWorkers[index].id;
                    locations[workerId] = response.data.name || "N/A";
                });

                roleResponses.forEach((response, index) => {
                    const workerId = sortedWorkers[index].id;
                    roles[workerId] = response.data.map(role => role.role);
                });

                // Set the final state after all data is fetched and processed
                setWorkers(sortedWorkers);
                setWorkerEmployers(employers);
                setWorkerLocations(locations);
                setWorkerRoles(roles);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchWorkers();
    }, []);


    const handleCopyEmails = () => {
        const emails = workers.map(worker => worker.email).filter(email => email).join(", ");
        navigator.clipboard.writeText(emails).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpenCommentModal = (worker) => {
        setCommentWorker(worker);
        setShowCommentModal(true);
    };

    const handleCommentSaved = (newComment) => {
        // Update the worker's comment in the workers array
        setWorkers((prev) =>
            prev.map(w => w.id === commentWorker.id ? { ...w, comment: newComment } : w)
        );
        // Keep the modal open, just updated the comment shown
    };


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
        <>
            <div className="contact-search-menu">
                <div className="contact-search-menu-items">
                    <div className="contact-search-menu-header mb-4">
                        <h1 className="mb-0">Email List</h1>
                        <div className="d-flex">
                            <Button variant="primary" onClick={handleCopyEmails}>
                                {copied ? "Emails Copied!" : "Copy Emails"}
                            </Button>
                        </div>
                    </div>
                    <WorkerSearchFilter setWorkers={setWorkers} setLoading={setLoading} />
                </div>
            </div>
            {loading ? (
                <Container className="text-center mt-5" style={{paddingTop: "150px"}}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : (
            <Container className="mt-5 contacts-container">
                <Row>
                    {workers.length === 0 ? (
                        <Alert variant="info">No contacts found.</Alert>
                    ) : (
                        workers.map((worker) => (
                            <Col md={3} key={worker.id} className="mb-4">
                                <Card className='h-100 position-relative customer-page-card'>
                                    <Card.Body className='all-page-cardBody'>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Card.Title className='all-page-cardTitle'>
                                                {worker.firstName} {worker.lastName}{' '}
                                                {worker.favorite && <Badge bg="warning">Favorite</Badge>}
                                            </Card.Title>
                                            {/* Comment icon */}
                                            <Button variant="link" onClick={() => handleOpenCommentModal(worker)}>
                                                <FaComment title="View/Edit Comment" />
                                            </Button>
                                        </div>
                                        <Card.Text className="all-page-cardText" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                                            {/* Role */}
                                            <div>
                                                <FaUserTie className="me-1" />
                                                {workerRoles[worker.id] && workerRoles[worker.id].length > 0
                                                    ? workerRoles[worker.id].join(', ')
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
                                                {workerLocations[worker.id] || 'N/A'}
                                            </div>

                                            {/* Employer */}
                                            <div>
                                                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                {workerEmployers[worker.id] || 'N/A'}
                                            </div>
                                        </Card.Text>


                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
            )}

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

export default Contacts;
