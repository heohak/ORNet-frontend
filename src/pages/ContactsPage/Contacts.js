import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter'; // This handles the search and filter
import '../../css/Contacts.css';
import {FaEnvelope, FaPhone, FaUserTie} from "react-icons/fa";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuilding, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

function Contacts() {
    const [workers, setWorkers] = useState([]);
    const [workerEmployers, setWorkerEmployers] = useState({});
    const [workerLocations, setWorkerLocations] = useState({});
    const [workerRoles, setWorkerRoles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/worker/search`);

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
                // Fetch employer details
                const employerPromises = workers.map(worker =>
                    axios.get(`${config.API_BASE_URL}/worker/employer/${worker.id}`)
                );
                const employerResponses = await Promise.all(employerPromises);
                const employers = {};
                employerResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    employers[workerId] = response.data.shortName; // Assuming `name` exists in the response
                });
                setWorkerEmployers(employers);

                // Fetch location details
                const locationPromises = workers.map(worker =>
                    axios.get(`${config.API_BASE_URL}/worker/location/${worker.id}`)
                );
                const locationResponses = await Promise.all(locationPromises);
                const locations = {};
                locationResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    locations[workerId] = response.data.name || "N/A"; // Assuming `name` exists in the response
                });
                setWorkerLocations(locations);

                // Fetch roles for each worker
                const rolePromises = workers.map(worker =>
                    axios.get(`${config.API_BASE_URL}/worker/role/${worker.id}`)
                );
                const roleResponses = await Promise.all(rolePromises);
                const roles = {};
                roleResponses.forEach((response, index) => {
                    const workerId = workers[index].id;
                    roles[workerId] = response.data.map(role => role.role); // Assuming `role` exists in the response
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
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
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
                            <Button
                                variant="primary"
                                onClick={handleCopyEmails}
                            >
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
                                    <Card.Title className='all-page-cardTitle'>
                                        {worker.firstName} {worker.lastName}{' '}
                                        {worker.favorite && <Badge bg="warning">Favorite</Badge>}
                                    </Card.Title>
                                    <Card.Text className="all-page-cardText">
                                        <Row className="g-1"> {/* Adjusted gutter spacing */}
                                            <Col>
                                                {/* Roles and Title */}
                                                {workerRoles[worker.id]?.length > 0 && (
                                                    <>
                                                        <FaUserTie className="me-1" />
                                                        {workerRoles[worker.id].join(', ')}
                                                        {worker.title ? ` (${worker.title})` : ''} <br />
                                                    </>
                                                )}
                                                {/* Employer */}
                                                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                {workerEmployers[worker.id] || "Unknown"} <br />

                                                {/* Location */}
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                {workerLocations[worker.id] || "N/A"}
                                            </Col>
                                            <Col>
                                                {/* Phone */}
                                                <FaPhone className="me-1" /> {worker.phoneNumber} <br />

                                                {/* Email */}
                                                <FaEnvelope className="me-1" /> {worker.email}
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
        </>
    );
}

export default Contacts;
