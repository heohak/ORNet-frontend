import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewClientWorkerRoles() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
                setRoles(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleAddRole = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/worker/classificator/add`, {
                role,
            });
            const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
            setRoles(response.data);
            setShowAddModal(false);
            setRole('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (role) => {
        navigate(`/settings/client-worker-roles/edit/${role.id}`, { state: { role } });
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

    const handleNavigate = () => {
        navigate('/history', { state: { endpoint: `worker/classificator/deleted` } });
    }

    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col className="col-md-auto">
                    <h1>Customer Contact Roles</h1>
                </Col>
                <Col className="col-md-auto">
                    <Row>
                        <Col className="col-md-auto">
                            <Button variant='secondary' onClick={handleNavigate}>
                                See Deleted
                            </Button>
                        </Col>
                        <Col className="col-md-auto">
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Role</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                {roles.map((role) => (
                    <Col md={4} key={role.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{role.role}</Card.Title>
                                <Button variant="secondary" onClick={() => handleEdit(role)}>Edit</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Role</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddRole}>
                    <Modal.Body>
                            <Form.Group controlId="formRole">
                                <Form.Label>Role</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="Enter role"
                                    required
                                />
                            </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Add Role</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <Button onClick={() => navigate('/settings')}>Back</Button>
        </Container>
    );
}

export default ViewClientWorkerRoles;
