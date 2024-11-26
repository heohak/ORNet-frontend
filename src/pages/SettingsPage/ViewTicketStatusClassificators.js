import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function ViewTicketStatusClassificators() {
    const [classificators, setClassificators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassificators = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
                setClassificators(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClassificators();
    }, []);

    const handleAddClassificator = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/ticket/classificator/add`, {
                status: status
            });
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            setClassificators(response.data);
            setShowAddModal(false);
            setStatus('');
        } catch (error) {
            setError('Error adding ticket status classificator');
        }
    };

    const handleEdit = (classificator) => {
        navigate(`/settings/ticket-status-classificators/edit/${classificator.id}`, { state: { classificator } });
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
        navigate('/history', { state: { endpoint: `ticket/classificator/deleted` } });
    }

    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col className="col-md-auto">
                    <h1>Ticket Status Classificators</h1>
                </Col>
                <Col className="col-md-auto">
                    <Row>
                        <Col className="col-md-auto">
                            <Button variant='secondary' onClick={handleNavigate}>
                                See Deleted
                            </Button>
                        </Col>
                        <Col className="col-md-auto">
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Classificator</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                {classificators.map((classificator) => {
                    const statusName = classificator?.status || 'Unknown Status';
                    const statusColor = classificator?.color || '#007bff';
                    return (
                    <Col md={3} key={classificator.id} className="mb-4">
                        <Card>
                            <Row className="d-flex justify-content-between">
                                <Col className="col-md-auto">
                                    <div className="d-flex align-items-center">
                                        <h3 className="p-2 fw-semibold">{statusName}</h3>
                                        <Button
                                            style={{
                                                width: "20px",
                                                height: "20px", // Ensure the box is square
                                                backgroundColor: statusColor,
                                                borderColor: statusColor,
                                                marginLeft: "10px"
                                            }}
                                            disabled
                                            className="p-0 ms-2" // Remove padding for a clean square
                                        />
                                    </div>
                                </Col>

                                <Col className="col-md-auto">
                                    <Button
                                        variant="link"
                                        onClick={() => handleEdit(classificator)}
                                        className="" // Align to the top-right corner
                                    >
                                        <FontAwesomeIcon icon={faEdit} title="Edit Customer" />
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                    </Col>
                    )})}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Classificator</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddClassificator}>
                    <Modal.Body>
                            <Form.Group controlId="formStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    placeholder="Enter status"
                                    required
                                />
                            </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Add Classificator</Button>
                    </Modal.Footer>
            </Form>
            </Modal>
            <Button onClick={() => navigate('/settings')}>Back</Button>
        </Container>
    );
}

export default ViewTicketStatusClassificators;
