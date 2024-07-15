import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewDeviceClassificators() {
    const [classificators, setClassificators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassificators = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
                setClassificators(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClassificators();
    }, []);

    const handleAddClassificator = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/device/classificator/add`, {
                name,
            });
            const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
            setClassificators(response.data);
            setShowAddModal(false);
            setName('');
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
                <h1>Device Classificators</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Classificator</Button>
            </div>
            <Row>
                {classificators.map((classificator) => (
                    <Col md={4} key={classificator.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{classificator.name}</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Classificator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddClassificator}>Add Classificator</Button>
                </Modal.Footer>
            </Modal>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default ViewDeviceClassificators;
