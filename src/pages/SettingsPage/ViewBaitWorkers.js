import React, { useEffect, useState, } from 'react';
import axios from 'axios';
import { Row, Col, Card, Button, Spinner, Alert, Form, Modal, Container } from 'react-bootstrap';
import config from "../../config/config";
import {useNavigate} from "react-router-dom";

function ViewBaitWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/bait/worker/all`);
                setWorkers(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, []);

    const handleAddWorker = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/bait/worker/add`, {
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
            });
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/all`);
            setWorkers(response.data);
            setShowAddModal(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhoneNumber('');
            setTitle('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteWorker = async (id) => {
        try {
            await axios.delete(`${config.API_BASE_URL}/bait/worker/${id}`);
            const response = await axios.get(`${config.API_BASE_URL}/bait/worker/all`);
            setWorkers(response.data);
        } catch (error) {
            setError(error.message);
        }
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
        <Container className="mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Bait Workers</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Worker</Button>
            </div>

            <Row>
                {workers.map((worker) => (
                    <Col md={4} key={worker.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{worker.firstName} {worker.lastName}</Card.Title>
                                <Card.Text>
                                    Email: {worker.email}
                                    <br />
                                    Phone: {worker.phoneNumber}
                                    <br />
                                    Title: {worker.title}
                                </Card.Text>
                                <Button variant="danger" onClick={() => handleDeleteWorker(worker.id)}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Button onClick={() => navigate(-1)}>Back</Button>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Worker</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName" className="mt-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhoneNumber" className="mt-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </Form.Group>
                        <Form.Group controlId="formTitle" className="mt-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddWorker}>Add Worker</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewBaitWorkers;
