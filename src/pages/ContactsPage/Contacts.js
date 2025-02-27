// src/pages/Contacts/Contacts.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge, Collapse } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter';
import '../../css/Contacts.css';
import { FaFilter, FaChevronUp, FaChevronDown, FaEnvelope, FaPhone, FaUserTie, FaComment, FaIdBadge, FaStar, FaRegStar } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import WorkerCommentModal from "../OneClientPage/WorkerCommentModal";
import axiosInstance from "../../config/axiosInstance"; // Adjust the path if necessary

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

function Contacts() {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

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

    // State to control mobile filters toggle
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`);
                const sortedWorkers = response.data.sort((a, b) => {
                    if (a.favorite === b.favorite) {
                        return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
                    }
                    return a.favorite ? -1 : 1;
                });

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

                setFilteredWorkers(sortedWorkers);
                setAllWorkers(sortedWorkers);
                setWorkerEmployers(employers);
                setWorkerLocations(locations);
                setWorkerRoles(roles);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, []);

    const handleCopyEmails = () => {
        const emails = allWorkers.filter(worker => selectedWorkers.has(worker.id))
            .map(worker => worker.email)
            .filter(email => email)
            .join("; ");
        const textarea = document.createElement("textarea");
        textarea.value = emails;
        textarea.style.position = "fixed";
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
        setFilteredWorkers((prev) =>
            prev.map(w => w.id === commentWorker.id ? { ...w, comment: newComment } : w)
        );
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
        setSelectedWorkers(prevSelected => {
            if (showOnlySelected) {
                return new Set(); // Always clear selection when "Show Only Selected" is active
            }

            const allWorkerIds = new Set(filteredWorkers.map(worker => worker.id));
            if ([...allWorkerIds].every(id => prevSelected.has(id))) {
                return new Set(); // If everything is selected, deselect all
            }
            return allWorkerIds; // Otherwise, select all
        });
    };


    const displayedWorkers = showOnlySelected
        ? allWorkers.filter(worker => selectedWorkers.has(worker.id))
        : filteredWorkers;

    const getDeadlineColor = (endDateTime) => {
        const now = new Date();
        const endDate = new Date(endDateTime);
        if (endDate < now) return 'red';
        const diffInDays = (endDate - now) / (1000 * 60 * 60 * 24);
        if (diffInDays <= 7) return 'orange';
        return 'green';
    };

    return (
        <>
            {/* Main Menu Container */}
            <Container fluid className="contact-search-menu">
                <Container className="contact-search-menu-items">
                    <Container className="mt-5 search-menu-container">
                        {/* Header */}
                        {isMobile ? (
                            <>
                                <Row className="d-flex justify-content-between mb-2">
                                    <Col xs="auto" className="col-auto-padding-left-0">
                                        <h1 className="mb-0">
                                            Emails
                                        </h1>
                                    </Col>
                                    <Col xs="auto" className="text-end">
                                        <Button
                                            variant={showOnlySelected ? "secondary" : "primary"}
                                            className="me-2"
                                            onClick={() => setShowOnlySelected(!showOnlySelected)}
                                        >
                                            {showOnlySelected ? "All" : "Selected"}
                                        </Button>
                                        <Button variant="primary" onClick={handleCopyEmails}>
                                            {copied ? "Copied!" : "Copy"}
                                        </Button>
                                    </Col>
                                </Row>
                                <Row className="mb-4 text-end">
                                    <Col>
                                        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                        Selected: {selectedWorkers.size}
                                        </span>
                                        <span
                                            style={{ cursor: 'pointer', textDecoration: 'none', color: '#0d6efd' }}
                                            onClick={toggleSelectAll}
                                        >
                                            {([...selectedWorkers].length === filteredWorkers.length && filteredWorkers.length > 0) || showOnlySelected
                                                ? "Deselect All"
                                                : "Select All"}
                                        </span>
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            <Row className="d-flex justify-content-between align-items-center mb-4">
                                <Col xs="auto" className="emails-header-padding">
                                    <h1 className="mb-0">Email List</h1>
                                </Col>
                                <Col xs="auto" className="text-end">
                                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                      Selected: {selectedWorkers.size}
                                    </span>
                                    <span
                                        style={{ cursor: 'pointer', textDecoration: 'none', color: '#0d6efd', marginRight: '10px' }}
                                        onClick={toggleSelectAll}
                                    >
                                        {([...selectedWorkers].length === filteredWorkers.length && filteredWorkers.length > 0) || showOnlySelected
                                            ? "Deselect All"
                                            : "Select All"}
                                    </span>

                                    <Button
                                        variant={showOnlySelected ? "secondary" : "primary"}
                                        className="me-2"
                                        onClick={() => setShowOnlySelected(!showOnlySelected)}
                                    >
                                        {showOnlySelected ? "Show All Workers" : "Show Selected Workers"}
                                    </Button>
                                    <Button variant="primary" onClick={handleCopyEmails}>
                                        {copied ? "Emails Copied!" : "Copy Emails"}
                                    </Button>
                                </Col>
                            </Row>
                        )}

                        {/* The rest of your contact page content would follow here */}
                    </Container>

                    {/* Worker Search Filter */}
                    {isMobile ? (
                        <>
                            <Row className="mb-3 align-items-center">
                                <Col>
                                    <WorkerSearchFilter
                                        collapsed
                                        setWorkers={setFilteredWorkers}
                                        setLoading={() => {}}
                                    />
                                </Col>
                                <Col xs="auto" className="d-flex align-items-center">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    >
                                        <FaFilter style={{ marginRight: '0.5rem' }} />
                                        {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
                                    </Button>
                                </Col>
                            </Row>
                            <Collapse in={showMobileFilters}>
                                <Container fluid className="mb-3" style={{ padding: '0 1rem' }}>
                                    <WorkerSearchFilter
                                        advancedOnly
                                        setWorkers={setFilteredWorkers}
                                        setLoading={() => {}}
                                    />
                                </Container>
                            </Collapse>
                        </>
                    ) : (
                        <WorkerSearchFilter setWorkers={setFilteredWorkers} setLoading={() => {}} />
                    )}
                </Container>
            </Container>

            {/* Loading Spinner or Worker List */}
            {loading ? (
                <Container className="text-center mt-5" style={{ paddingTop: "160px" }}>
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
                                        className={`h-100 position-relative customer-page-card ${
                                            selectedWorkers.has(worker.id) ? 'selected-worker' : ''
                                        }`}
                                        onClick={() => toggleWorkerSelection(worker.id)}
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedWorkers.has(worker.id)
                                                ? '2px solid blue'
                                                : '1px solid lightgray'
                                        }}
                                    >
                                        <Card.Body className="all-page-cardBody">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <Card.Title className="all-page-cardTitle">
                                                        {worker.firstName} {worker.lastName}
                                                    </Card.Title>
                                                </Col>
                                                <Col xs="auto" className="d-flex align-items-center">
                                                    {worker.favorite && (
                                                        <span style={{ cursor: 'pointer', marginRight: '10px' }}>
                            <FaStar style={{ color: 'gold' }} />
                          </span>
                                                    )}
                                                    <Button variant="link" onClick={() => handleOpenCommentModal(worker)}>
                                                        <FaComment title="View/Edit Comment" />
                                                    </Button>
                                                </Col>
                                            </Row>
                                            <Card.Text
                                                className="all-page-cardText"
                                                style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                                            >
                                                <Row>
                                                    <Col>
                                                        <FaUserTie className="me-1" />
                                                        {workerRoles[worker.id] && workerRoles[worker.id].length > 0
                                                            ? workerRoles[worker.id].join(', ')
                                                            : 'N/A'}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FaPhone className="me-1" />
                                                        {worker.phoneNumber ? worker.phoneNumber : 'N/A'}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
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
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FaIdBadge className="me-1" />
                                                        {worker.title ? worker.title : 'N/A'}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                        {workerLocations[worker.id] || 'N/A'}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                                        {workerEmployers[worker.id] || 'N/A'}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FaComment className="me-1" />
                                                        {worker.comment ? worker.comment : 'N/A'}
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

export default Contacts;
