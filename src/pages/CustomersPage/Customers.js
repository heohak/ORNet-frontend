import React, { useEffect, useState} from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Form,
    FormControl,
    InputGroup,
    Modal,
    DropdownButton,
    Dropdown
} from 'react-bootstrap';
import config from "../../config/config";
import AddCustomer from "./AddCustomer";
import NewAddCustomer from "./NewAddCustomer";
import GenerateReportModal from "../../modals/GenerateReportModal";
import '../../css/Customers.css';

function Customers() {
    const [customer, setCustomer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [showNewAddCustomerModal, setShowNewAddCustomerModal] = useState(false);
    const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'shortName', direction: 'ascending' });

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

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchCustomers(searchQuery, customerType);
        }, 300); // 300ms delay before search triggers
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, customerType]);


    const handleNewAddCustomer = () => {
        setShowNewAddCustomerModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (type) => {
        setCustomerType(type);
    };


    const handleCloseNewAddCustomerModal = () => {
        setShowNewAddCustomerModal(false);
        fetchCustomers(); // Refresh the customer list after adding a new customer
    };

    const handleGenerateReport = () => {
        setShowGenerateReportModal(true);
    };

    const handleCloseGenerateReportModal = () => {
        setShowGenerateReportModal(false);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortCustomers = (customers, key, direction) => {
        const sortedCustomers = [...customers];
        sortedCustomers.sort((a, b) => {
            // Provide a fallback value of an empty string if a[key] or b[key] is undefined
            const nameA = (a[key] || '').toString().toLowerCase();
            const nameB = (b[key] || '').toString().toLowerCase();
            if (nameA < nameB) return direction === 'ascending' ? -1 : 1;
            if (nameA > nameB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortedCustomers;
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
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
            <Row className="mb-3">
                <Col>
                    <h1>Customers</h1>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" className="me-2" onClick={handleNewAddCustomer}>
                        Add Customer
                    </Button>
                    <Button variant="primary" onClick={handleGenerateReport}>
                        Generate Report
                    </Button>
                </Col>
            </Row>

            <Form className="mb-3">
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <InputGroup>
                            <FormControl
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={customerType || 'All Types'}
                                id="input-group-dropdown-type"
                            >
                                <Dropdown.Item onClick={() => handleFilterChange('')}>All Types</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleFilterChange('pathology')}>Pathology</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleFilterChange('surgery')}>Surgery</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleFilterChange('editor')}>Editor</Dropdown.Item>
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                </Row>

            </Form>
            {/* Table-like row for customers */}
            <div className="mt-3">
                <Row className="font-weight-bold text-center">
                    <Col md={4} onClick={() => handleSort('shortName')}>
                        Short Name {renderSortArrow('shortName')}
                    </Col>
                    <Col md={4} onClick={() => handleSort('fullName')}>
                        Full Name {renderSortArrow('fullName')}
                    </Col>
                    <Col md={4}>
                        Type
                    </Col>
                </Row>
                <hr />
                {sortCustomers(customer, sortConfig.key, sortConfig.direction).length === 0 ? (
                    <Alert variant="info">No customers found.</Alert>
                ) : (
                    sortCustomers(customer, sortConfig.key, sortConfig.direction).map((customer, index) => {
                        const customerTypes = [];
                        if (customer.pathologyClient) customerTypes.push('Pathology');
                        if (customer.surgeryClient) customerTypes.push('Surgery');
                        if (customer.editorClient) customerTypes.push('Editor');
                        const customerTypeDisplay = customerTypes.join(', ') || 'N/A';

                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';


                        return (
                            <Row
                                key={customer.id}
                                className="align-items-center text-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => window.location.href = `/customer/${customer.id}`}
                            >
                                <Col md={4}>{customer.shortName}</Col>
                                <Col md={4}>{customer.fullName}</Col>
                                <Col md={4}>{customerTypeDisplay}</Col>
                            </Row>
                        );
                    })
                )}
            </div>

            <Modal show={showNewAddCustomerModal} onHide={() => setShowNewAddCustomerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewAddCustomer onClose={handleCloseNewAddCustomerModal} />
                </Modal.Body>
            </Modal>

            {/* Generate Report Modal */}
            <GenerateReportModal show={showGenerateReportModal} handleClose={handleCloseGenerateReportModal} />
        </Container>
    );
}

export default Customers;
