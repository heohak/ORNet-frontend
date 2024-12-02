import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Spinner,
    Alert,
    Modal,
    Form
} from 'react-bootstrap';
import config from '../../config/config';
import { FaPhone, FaEnvelope, FaEdit } from 'react-icons/fa';
import EditThirdPartyITModal from "./EditThirdPartyITModal";

function ViewThirdPartyITs() {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

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

    const handleAddThirdPartyIT = async (e) => {
        e.preventDefault();
        setError(null);
        const trimmedPhoneNumber = phone.trim();
        // Check if the phone number contains only digits
        if (!/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
            setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
            return;
        }
        // Reset the error message if validation passes
        setPhoneNumberError('');
        setPhone(trimmedPhoneNumber);

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
        setSelectedThirdParty(thirdParty);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedThirdParty(null);
        setShowEditModal(false);
    };

    const handleUpdateThirdPartyList = () => {
        // Fetch the updated list of third parties
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
                setThirdPartyITs(response.data);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchThirdPartyITs();
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Third Party ITs</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Third Party IT</Button>
            </div>
            <Button variant="primary" className="mb-4" onClick={() => window.history.back()}>Back</Button>
            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Container className="mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                </Container>
            ) : (
                <Row>
                    {thirdPartyITs.map((thirdParty) => (
                        <Col md={4} key={thirdParty.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <Card.Title>{thirdParty.name}</Card.Title>
                                        <Button
                                            variant="link"
                                            className="p-0"
                                            onClick={() => handleEdit(thirdParty)}
                                        >
                                            <FaEdit />
                                        </Button>
                                    </div>
                                    <Card.Text>
                                        <FaEnvelope /> {thirdParty.email}<br />
                                        <FaPhone /> {thirdParty.phone}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            {/* Add Third Party IT Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Third Party IT</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddThirdPartyIT}>
                    <Modal.Body>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhone" className="mt-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                required
                                isInvalid={!!phoneNumberError} // Display error styling if there's an error
                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button variant="primary" type='submit'>Add Third Party IT</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Third Party IT Modal */}
            {selectedThirdParty && (
                <EditThirdPartyITModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    thirdParty={selectedThirdParty}
                    onUpdate={handleUpdateThirdPartyList}
                />
            )}


        </Container>
    );
}

export default ViewThirdPartyITs;
