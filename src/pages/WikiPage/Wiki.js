import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from "../../config/config";

function Wiki() {
    const [wikis, setWikis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWikis = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/wiki/all`);
                setWikis(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWikis();
    }, []);

    const handleAddWiki = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/wiki/add`, {
                problem,
                solution,
            });
            const response = await axios.get(`${config.API_BASE_URL}/wiki/all`);
            setWikis(response.data);
            setShowAddModal(false);
            setProblem('');
            setSolution('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteWiki = async (id) => {
        try {
            await axios.delete(`${config.API_BASE_URL}/wiki/${id}`);
            const response = await axios.get(`${config.API_BASE_URL}/wiki/all`);
            setWikis(response.data);
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
                <h1>Wiki</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Wiki</Button>
            </div>
            <Row>
                {wikis.map((wiki) => (
                    <Col md={4} key={wiki.id} className="mb-4">
                        <Card style={{cursor: "pointer"}} onClick={() => navigate(`/wiki/${wiki.id}`)}>
                            <Card.Body>
                                <Card.Title>{wiki.problem}</Card.Title>
                                <Button variant="danger" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWiki(wiki.id);
                                }}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Wiki</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formProblem">
                            <Form.Label>Problem</Form.Label>
                            <Form.Control
                                type="text"
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                placeholder="Enter problem"
                            />
                        </Form.Group>
                        <Form.Group controlId="formSolution" className="mt-3">
                            <Form.Label>Solution</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="Enter solution"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddWiki}>Add Wiki</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Wiki;
