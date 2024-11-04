import React, { useEffect, useState} from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Alert,
    Form,
    FormControl,
    InputGroup,
    DropdownButton,
    Dropdown
} from 'react-bootstrap';
import config from "../../config/config";
import NewAddCustomer from "./NewAddCustomer";
import GenerateReportModal from "../../modals/GenerateReportModal";
import '../../css/Customers.css';
import noImg from '../../assets/no-img.jpg';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [showNewAddCustomerModal, setShowNewAddCustomerModal] = useState(false);
    const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'shortName', direction: 'ascending' });
    const [countryFlags, setCountryFlags] = useState({}); // Store flags in a state
    const countryFlagApi = "https://restcountries.com/v3.1/alpha";

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
            const customersData = response.data;

            // Fetch country flags for all customers
            const flags = await fetchCountryFlags(customersData);
            setCountryFlags(flags); // Store fetched flags

            setCustomers(customersData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountryFlags = async (customersData) => {
        const flags = {};
        for (const customer of customersData) {
            const countryCode = customer.country; // Country code in cca3 format
            try {
                const response = await axios.get(`${countryFlagApi}/${countryCode}`);
                flags[countryCode] = response.data[0].flags.png; // Store flag image URL
            } catch (error) {
                console.error(`Error fetching flag for ${countryCode}:`, error);
            }
        }
        return flags;
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
                    {/* NewAddCustomer Modal */}
                    {showNewAddCustomerModal && (
                        <NewAddCustomer
                            show={showNewAddCustomerModal}
                            onClose={handleCloseNewAddCustomerModal}
                        />
                    )}
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
                <Row className="font-weight-bold">
                    <Col md={1}>
                        Country {renderSortArrow('country')}
                    </Col>
                    <Col md={2} onClick={() => handleSort('shortName')}>
                        Short Name {renderSortArrow('shortName')}
                    </Col>
                    <Col md={4} onClick={() => handleSort('fullName')}>
                        Full Name {renderSortArrow('fullName')}
                    </Col>
                    <Col md={2}>
                        Type
                    </Col>
                    <Col md={1}>
                        Contact
                    </Col>
                    <Col className="text-end" md={2}>
                        Activity
                    </Col>
                </Row>
                <hr />
                {sortCustomers(customers, sortConfig.key, sortConfig.direction).length === 0 ? (
                    <Alert variant="info">No customers found.</Alert>
                ) : (
                    sortCustomers(customers, sortConfig.key, sortConfig.direction).map((customer, index) => {
                        const customerTypes = [];
                        if (customer.pathologyClient) customerTypes.push('Pathology');
                        if (customer.surgeryClient) customerTypes.push('Surgery');
                        if (customer.editorClient) customerTypes.push('Editor');
                        const customerTypeDisplay = customerTypes.join(', ') || 'N/A';

                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';


                        return (
                            <Row
                                key={customer.id}
                                className="align-items-center mb-2"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => window.location.href = `/customer/${customer.id}`}
                            >
                                <Col md={1}>
                                    <img
                                        src={countryFlags[customer.country] ? countryFlags[customer.country] : noImg} // Adjust this path to point to your flag image
                                        alt={`${customer.country} flag`}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            marginRight: '8px',
                                        }}
                                    />
                                    {customer.country}
                                </Col>
                                <Col md={2}>{customer.shortName}</Col>
                                <Col md={4}>{customer.fullName}</Col>
                                <Col md={2}>{customerTypeDisplay}</Col>
                                <Col md={1}>Con</Col>
                                <Col className="text-end" md={2}>19.02.24</Col>
                            </Row>
                        );
                    })
                )}
            </div>


            {/* Generate Report Modal */}
            <GenerateReportModal show={showGenerateReportModal} handleClose={handleCloseGenerateReportModal} />
        </Container>
    );
}

export default Customers;
