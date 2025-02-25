import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter';
import '../../css/Contacts.css';
import {FaEnvelope, FaPhone, FaUserTie, FaComment, FaIdBadge, FaStar, FaRegStar} from "react-icons/fa";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuilding, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import WorkerCommentModal from "../OneClientPage/WorkerCommentModal";
import axiosInstance from "../../config/axiosInstance"; // Adjust the path if necessary

function Contacts() {
    const [filteredWorkers, setFilteredWorkers] = useState([]);
    const [allWorkers, setAllWorkers] = useState([]);
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

    const [selectedWorkers, setSelectedWorkers] = useState(new Set());
    const [showOnlySelected, setShowOnlySelected] = useState(false);

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
                setFilteredWorkers(sortedWorkers);
                setAllWorkers(sortedWorkers);
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
        const emails = allWorkers.filter(worker => selectedWorkers.has(worker.id)).map(worker => worker.email).filter(email => email).join("; ");
        const textarea = document.createElement("textarea");
        textarea.value = emails;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textarea);
    };

    const handleOpenCommentModal = (worker) => {
        setCommentWorker(worker);
        setShowCommentModal(true);
    };

    const handleCommentSaved = (newComment) => {
        // Update the worker's comment in the workers array
        setFilteredWorkers((prev) =>
            prev.map(w => w.id === commentWorker.id ? { ...w, comment: newComment } : w)
        );
        // Keep the modal open, just updated the comment shown
    };

    const toggleWorkerSelection = (workerId) => {
        setSelectedWorkers((prevSelected) => {
            const newSelection = new Set(prevSelected);
            if (newSelection.has(workerId)) {
                newSelection.delete(workerId);
            } else {
                newSelection.add(workerId);
            }
            return newSelection;
        });
    };

    const toggleSelectAll = () => {
        if (showOnlySelected) return;
        setSelectedWorkers(prevSelected => {
            const allWorkerIds = new Set(filteredWorkers.map(worker => worker.id));

            // If all filtered workers are selected, clear selection
            if ([...allWorkerIds].every(id => prevSelected.has(id))) {
                return new Set();
            }

            // Otherwise, select all filtered workers
            return allWorkerIds;
        });
    };


    // If showOnlySelected is true, filter workers to show only selected ones
    const displayedWorkers = showOnlySelected
        ? allWorkers.filter(worker => selectedWorkers.has(worker.id))
        : filteredWorkers;



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
                    <div className="d-flex align-items-center">
                        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>
                                Selected: {selectedWorkers.size}
                        </span>
                        {/* Select All Button */}
                        <span
                            style={{
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: '#0d6efd',
                                marginRight: '10px'
                            }}
                            onClick={toggleSelectAll}
                        >
                            Select All
                        </span>
                        <Button
                            variant={showOnlySelected ? "secondary" : "primary"}
                            onClick={() => setShowOnlySelected(!showOnlySelected)}
                            className="me-2"
                        >
                            {showOnlySelected ? "Show All Workers" : "Show Selected Workers"}
                        </Button>

                        <Button variant="primary" onClick={handleCopyEmails}>
                                {copied ? "Emails Copied!" : "Copy Emails"}
                            </Button>
                    </div>
                </div>
                    <WorkerSearchFilter setWorkers={setFilteredWorkers} setLoading={setLoading} />
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
                    {displayedWorkers.length === 0 ? (
                        <Alert variant="info">No contacts found.</Alert>
                    ) : (
                        displayedWorkers.map((worker) => (
                            <Col md={3} key={worker.id} className="mb-4">
                                <Card
                                    className={`h-100 position-relative customer-page-card ${selectedWorkers.has(worker.id) ? 'selected-worker' : ''}`}
                                    onClick={() => toggleWorkerSelection(worker.id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedWorkers.has(worker.id) ? '2px solid blue' : '1px solid lightgray'
                                    }}
                                >

                                <Card.Body className='all-page-cardBody'>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Card.Title className='all-page-cardTitle'>
                                                {worker.firstName} {worker.lastName}
                                            </Card.Title>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {worker.favorite && (
                                                    <span style={{ cursor: 'pointer', marginRight: '10px' }}>
                <FaStar style={{ color: 'gold' }} />
            </span>
                                                )}
                                                <Button variant="link" onClick={() => handleOpenCommentModal(worker)}>
                                                    <FaComment title="View/Edit Comment" />
                                                </Button>
                                            </div>
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

                                            {/* Comment */}
                                            <div>
                                                <FaComment className="me-1" />
                                                {worker.comment ? worker.comment : 'N/A'}
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
