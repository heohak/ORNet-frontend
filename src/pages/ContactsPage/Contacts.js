import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner, Badge } from "react-bootstrap";
import config from "../../config/config";
import WorkerSearchFilter from './WorkerSearchFilter'; // This handles the search and filter
import '../../css/Contacts.css';
import {FaEnvelope, FaPhone, FaUserTie} from "react-icons/fa";

function Contacts() {
    const [workers, setWorkers] = useState([]);
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
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
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
            <Container className="mt-5 contacts-container">
                <Row>
                    {workers.map((worker) => (
                        <Col md={4} key={worker.id} className="mb-4">
                            <Card className='h-100 position-relative customer-page-card'>
                                <Card.Body className='all-page-cardBody'>
                                    <Card.Title className='all-page-cardTitle'>
                                        {worker.firstName} {worker.lastName}{' '}
                                        {worker.favorite && <Badge bg="warning">Favorite</Badge>}
                                    </Card.Title>
                                    <Card.Text className='all-page-cardText'>
                                        {/* Title */}
                                        {worker.title && (
                                            <>
                                                <FaUserTie className="me-1" /> {worker.title} <br />
                                            </>
                                        )}
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

            </Container>
        </>
    );
}

export default Contacts;
