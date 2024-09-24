import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import config from "../../config/config";
import AddCustomer from "./AddCustomer";
import '../../css/Customers.css';

function Customers() {
    const [customer, setCustomer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async (query = '', type = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/search`, {
                params: { q: query, clientType: type }
            });
            setCustomer(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const handleAddCustomer = () => {
        setShowAddCustomerModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setCustomerType(e.target.value);
        fetchCustomers(searchQuery, e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCustomers(searchQuery, customerType);
    };

    const handleCloseAddCustomerModal = () => {
        setShowAddCustomerModal(false);
        fetchCustomers(); // Refresh the customer list after adding a new customer
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
                <h1>Customers</h1>
                <Button variant="success" onClick={handleAddCustomer}>Add Customer</Button>
            </div>
            <Form className="mb-4" onSubmit={handleSearchSubmit}>
                <Row>
                    <Col md={8}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <Button variant="primary" type="submit">Search</Button>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select value={customerType} onChange={handleFilterChange}>
                            <option value="">Filter by Type</option>
                            <option value="pathology">Pathology</option>
                            <option value="surgery">Surgery</option>
                            <option value="editor">Editor</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Form>
            <Row>
                {customer.map((customer) => (
                    <Col md={4} key={customer.id} className="mb-4">
                        <Card className="h-100 position-relative all-page-card">
                            <Card.Body onClick={() => window.location.href = `/customer/${customer.id}`} className="all-page-cardBody">
                                <div className="mb-4">
                                    <Card.Title className='all-page-cardTitle'>Name: {customer.shortName}</Card.Title>
                                    <Card.Text className='all-page-cardText'>
                                        <strong>Full name:</strong> {customer.fullName}
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddCustomerModal} onHide={() => setShowAddCustomerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddCustomer onClose={handleCloseAddCustomerModal} />
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Customers;
