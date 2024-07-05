import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card,Button, Spinner, Alert } from 'react-bootstrap';

function Workers() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = location.state || {};
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        if (!clientId) {
            navigate('/');
            return;
        }

        const fetchWorkers = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/workers/${clientId}`);
                setWorkers(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, [clientId, navigate]);

    const handleDeleteWorker = async (workerId) => {
        setDeleteError(null);
        try {
            await axios.delete(`http://localhost:8080/workers/${workerId}`);
            setWorkers(workers.filter(worker => worker.id !== workerId));
        } catch (error) {
            setDeleteError(error.message);
        }
    };

    const handleAddWorker = () => {
        navigate('/add-worker', { state: { clientId } });
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
                <h1 className="mb-0">Workers for Client {clientId}</h1>
                <Button variant="success" onClick={handleAddWorker}>Add Worker</Button>
            </div>
            <Row>
                {workers.map((worker) => (
                    <Col md={4} key={worker.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Button
                                    variant="danger"
                                    className="position-absolute top-0 end-0 m-2"
                                    onClick={() => handleDeleteWorker(worker.id)}
                                >
                                    Delete
                                </Button>
                                <Card.Title>{worker.firstName} {worker.lastName}</Card.Title>
                                <Card.Text>
                                    <strong>Email:</strong> {worker.email}<br />
                                    <strong>Phone number:</strong> {worker.phoneNumber}<br />
                                    <strong>Title:</strong> {worker.title}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default Workers;
