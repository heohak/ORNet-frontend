import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewWorkTypes() {
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [workType, setWorkType] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkTypes = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`);
                setWorkTypes(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkTypes();
    }, []);

    const handleAddWorkType = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/work-type/classificator/add`, {
                workType,
            });
            const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`);
            setWorkTypes(response.data);
            setShowAddModal(false);
            setWorkType('');
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
                <h1>Work Types</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Work Type</Button>
            </div>
            <Row>
                {workTypes.map((workType) => (
                    <Col md={4} key={workType.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{workType.workType}</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Work Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formWorkType">
                            <Form.Label>Work Type</Form.Label>
                            <Form.Control
                                type="text"
                                value={workType}
                                onChange={(e) => setWorkType(e.target.value)}
                                placeholder="Enter work type"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddWorkType}>Add Work Type</Button>
                </Modal.Footer>
            </Modal>
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default ViewWorkTypes;
