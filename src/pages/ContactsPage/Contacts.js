import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter';
import '../../css/Contacts.css';
import {FaEnvelope, FaPhone, FaUserTie, FaComment} from "react-icons/fa";
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
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`);

                const sortedWorkers = response.data.sort((a, b) => (a.favorite === b.favorite) ? 0 : a.favorite ? -1 : 1);
                setWorkers(sortedWorkers);

                await fetchAdditionalDetails(sortedWorkers);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchAdditionalDetails = async (workers) => {
            try {
                // Employer details
                const employerPromises = workers.map(worker =>
                    axiosInstance.get(`${config.API_BASE_URL}/worker/employer/${worker.id}`)
                );
                const employerResponses = await Promise.all(employerPromises);
                const employers = {};
                employerResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    employers[workerId] = response.data.shortName;
                });
                setWorkerEmployers(employers);

                // Location details
                const locationPromises = workers.map(worker =>
                    axiosInstance.get(`${config.API_BASE_URL}/worker/location/${worker.id}`)
                );
                const locationResponses = await Promise.all(locationPromises);
                const locations = {};
                locationResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    locations[workerId] = response.data.name || "N/A";
                });
                setWorkerLocations(locations);

                // Roles
                const rolePromises = workers.map(worker =>
                    axiosInstance.get(`${config.API_BASE_URL}/worker/role/${worker.id}`)
                );
                const roleResponses = await Promise.all(rolePromises);
                const roles = {};
                roleResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    roles[workerId] = response.data.map(role => role.role);
                });
                setWorkerRoles(roles);
            } catch (error) {
                console.error("Error fetching additional details:", error);
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
                    <WorkerSearchFilter setWorkers={setWorkers} />
                </div>
            </div>
            <Container className="mt-5 contacts-container">
                <Row>
                    {workers.length === 0 ? (
                        <Alert variant="info">No contacts found.</Alert>
                    ) : (
                        workers.map((worker) => (
                            <Col md={4} key={worker.id} className="mb-4">
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
                                        <Card.Text className="all-page-cardText">
                                            <Row className="g-1">
                                                <Col>
                                                    {/* Roles */}
                                                    {workerRoles[worker.id]?.length > 0 && (
                                                        <>
                                                            <FaUserTie className="me-1" />
                                                            {workerRoles[worker.id].join(', ')}
                                                            <br />
                                                        </>
                                                    )}

                                                    {/* Title */}
                                                    {worker.title && (
                                                        <>
                                                            <FaUserTie className="me-1" />
                                                            {worker.title}
                                                            <br />
                                                        </>
                                                    )}

                                                    {/* Employer */}
                                                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                    {workerEmployers[worker.id] || "Unknown"}
                                                    <br />
                                                </Col>

                                                <Col>
                                                    {/* Location */}
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                    {workerLocations[worker.id] || "N/A"}
                                                    <br />
                                                    {/* Phone */}
                                                    <FaPhone className="me-1" /> {worker.phoneNumber || "N/A"}
                                                    <br />

                                                    {/* Email */}
                                                    <FaEnvelope className="me-1" />
                                                    <a
                                                        href={`https://outlook.office.com/mail/deeplink/compose?to=${worker.email}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        {worker.email || "N/A"}
                                                    </a>
                                                </Col>
                                            </Row>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>

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
