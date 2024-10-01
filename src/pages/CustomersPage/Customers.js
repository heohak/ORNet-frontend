import React, { useEffect, useState, useRef, useCallback} from 'react';
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
    const [typingTimeout, setTypingTimeout] = useState(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        // Focus back to the input after customers are fetched
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [customer]);

    const fetchCustomers = useCallback(async (query = '', type = '') => {
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
    }, []);

    // Debouncing logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers(searchQuery, customerType);
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, customerType, fetchCustomers]);


    const handleAddCustomer = () => {
        setShowAddCustomerModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setCustomerType(e.target.value);
    };


    const handleCloseAddCustomerModal = () => {
        setShowAddCustomerModal(false);
        fetchCustomers(); // Refresh the customer list after adding a new customer
    };



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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Customers</h1>
                <Button variant="success" onClick={handleAddCustomer}>Add Customer</Button>
            </div>
            <Form className="mb-3">
                <Row>
                    <Col md={6}>
                        <InputGroup>
                            <Form.Control
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
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
                    <Col md={3} sm={6} key={customer.id} className="mb-4">
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
