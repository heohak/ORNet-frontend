import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewThirdPartyITs() {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
                setThirdPartyITs(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThirdPartyITs();
    }, []);

    const handleAddThirdPartyIT = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/third-party/add`, {
                name,
                email,
                phone,
            });
            const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
            setThirdPartyITs(response.data);
            setShowAddModal(false);
            setName('');
            setEmail('');
            setPhone('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (thirdParty) => {
        navigate(`/settings/third-party-its/edit/${thirdParty.id}`, { state: { thirdParty } });
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
                <h1>Third Party ITs</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Third Party IT</Button>
            </div>
            <Row>
                {thirdPartyITs.map((thirdParty) => (
                    <Col md={4} key={thirdParty.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{thirdParty.name}</Card.Title>
                                <Card.Text>
                                    <strong>Email:</strong> {thirdParty.email}<br />
                                    <strong>Phone:</strong> {thirdParty.phone}
                                </Card.Text>
                                <Button variant="secondary" onClick={() => handleEdit(thirdParty)}>Edit</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Third Party IT</Modal.Title>
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
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddThirdPartyIT}>Add Third Party IT</Button>
                </Modal.Footer>
            </Modal>
            <Button onClick={() => navigate('/settings')}>Back</Button>
        </Container>
    );
}

export default ViewThirdPartyITs;
