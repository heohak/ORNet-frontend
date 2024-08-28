import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import config from "../../config/config";
import AddClient from "./AddClient";
import '../../css/Clients.css';

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [clientType, setClientType] = useState('');
    const [showAddClientModal, setShowAddClientModal] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async (query = '', type = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/search`, {
                params: { q: query, clientType: type }
            });
            setClients(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleAddClient = () => {
        setShowAddClientModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setClientType(e.target.value);
        fetchClients(searchQuery, e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchClients(searchQuery, clientType);
    };

    const handleCloseAddClientModal = () => {
        setShowAddClientModal(false);
        fetchClients(); // Refresh the clients list after adding a new client
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
                <h1>Clients</h1>
                <Button variant="success" onClick={handleAddClient}>Add Client</Button>
            </div>
            <Form className="mb-4" onSubmit={handleSearchSubmit}>
                <Row>
                    <Col md={8}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <Button variant="primary" type="submit">Search</Button>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select value={clientType} onChange={handleFilterChange}>
                            <option value="">Filter by Type</option>
                            <option value="pathology">Pathology</option>
                            <option value="surgery">Surgery</option>
                            <option value="editor">Editor</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Form>
            <Row>
                {clients.map((client) => (
                    <Col md={4} key={client.id} className="mb-4">
                        <Card className="h-100 position-relative all-page-card">
                            <Card.Body onClick={() => window.location.href = `/client/${client.id}`} className="d-flex flex-column all-page-cardBody">
                                <div className="mb-4">
                                    <Card.Title className='all-page-cardTitle'>Name: {client.shortName}</Card.Title>
                                    <Card.Text className='all-page-cardText'>
                                        <strong>Full name:</strong> {client.fullName}
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddClientModal} onHide={() => setShowAddClientModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Client</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddClient onClose={handleCloseAddClientModal} />
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Clients;
