import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import config from "../config/config";

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [clientType, setClientType] = useState('');
    const [clientTypes, setClientTypes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async (query = '', type = '') => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (query) {
                response = await axios.get(`${config.API_BASE_URL}/client/search?q=${query}`);
            } else if (type) {
                response = await axios.get(`${config.API_BASE_URL}/client/byType?clientType=${type}`);
            } else {
                response = await axios.get(`${config.API_BASE_URL}/client/all`);
            }
            setClients(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = async (clientId) => {
        setDeleteError(null);
        try {
            await axios.delete(`${config.API_BASE_URL}/client/delete/${clientId}`);
            setClients(clients.filter(client => client.id !== clientId));
        } catch (error) {
            setDeleteError(error.message);
        }
    };

    const handleAddClient = () => {
        navigate('/add-client');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setClientType(e.target.value);
        fetchClients('', e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchClients(searchQuery, clientType);
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

    if (deleteError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{deleteError}</p>
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
                        <Card className="h-100 position-relative">
                            <Button
                                variant="danger"
                                className="position-absolute top-0 end-0 m-2"
                                onClick={() => handleDeleteClient(client.id)}
                            >
                                Delete
                            </Button>
                            <Card.Body style={{ cursor: "pointer" }} onClick={() => navigate(`/client/${client.id}`)} className="d-flex flex-column">
                                <div className="mb-4">
                                    <Card.Title>{client.shortName}</Card.Title>
                                    <Card.Text>
                                        <strong>Full name:</strong> {client.fullName}
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Clients;
