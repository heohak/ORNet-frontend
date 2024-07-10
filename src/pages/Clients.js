import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [expandedClientIds, setExpandedClientIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:8080/client');
                setClients(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleNavigateWorkers = (clientId) => {
        navigate('/workers', { state: { clientId } });
    };

    const handleNavigateDevices = (clientId) => {
        navigate(`/clients/${clientId}/devices`);
    };

    const handleNavigateSoftwares = (clientId) => {
        navigate(`/clients/${clientId}/softwares`, { state: { clientId } });
    };

    const handleDeleteClient = async (clientId) => {
        setDeleteError(null);
        try {
            await axios.delete(`http://localhost:8080/client/${clientId}`);
            setClients(clients.filter(client => client.id !== clientId));
        } catch (error) {
            setDeleteError(error.message);
        }
    };

    const handleAddClient = () => {
        navigate('/add-client');
    };

    const handleToggleExpand = (clientId) => {
        setExpandedClientIds((prevIds) =>
            prevIds.includes(clientId)
                ? prevIds.filter((id) => id !== clientId)
                : [...prevIds, clientId]
        );
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
                <h1>Kliendid</h1>
                <Button variant="success" onClick={handleAddClient}>Add Client</Button>
            </div>
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
                            <Card.Body className="d-flex flex-column">
                                <div className="mb-4">
                                    <Card.Title>{client.fullName}</Card.Title>
                                    <Card.Text>
                                        <strong>Short Name:</strong> {client.shortName}
                                    </Card.Text>
                                    {expandedClientIds.includes(client.id) && (
                                        <>
                                            <Card.Text>
                                                <strong>Pathology Client:</strong> {client.pathologyClient ? 'Yes' : 'No'}<br />
                                                <strong>Surgery Client:</strong> {client.surgeryClient ? 'Yes' : 'No'}<br />
                                                <strong>Editor Client:</strong> {client.editorClient ? 'Yes' : 'No'}<br />
                                                <strong>Other Medical Information:</strong> {client.otherMedicalInformation}<br />
                                                <strong>Last Maintenance:</strong> {client.lastMaintenance}<br />
                                                <strong>Next Maintenance:</strong> {client.nextMaintenance}
                                            </Card.Text>
                                            <div className="d-flex flex-wrap justify-content-center">
                                                <Button variant="primary" className="mb-2 me-2" onClick={() => handleNavigateWorkers(client.id)}>
                                                    View Workers
                                                </Button>
                                                <Button variant="secondary" className="mb-2 me-2" onClick={() => handleNavigateDevices(client.id)}>
                                                    View Devices
                                                </Button>
                                                <Button variant="info" className="mb-2 me-2" onClick={() => handleNavigateSoftwares(client.id)}>
                                                    View Softwares
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Button variant="link" onClick={() => handleToggleExpand(client.id)}>
                                    {expandedClientIds.includes(client.id) ? 'View Less' : 'View More'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Clients;
