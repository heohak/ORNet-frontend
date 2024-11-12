import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Alert,
    FormControl,
    InputGroup,
    DropdownButton,
    Dropdown,
    Spinner
} from 'react-bootstrap';
import config from "../../config/config";
import NewAddCustomer from "./NewAddCustomer";
import GenerateReportModal from "../../modals/GenerateReportModal";
import '../../css/Customers.css';
import noImg from '../../assets/no-img.jpg';
import personIcon from '../../assets/thumbnail_person icon.png';
import {useNavigate} from "react-router-dom";


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
    const [countryFlags, setCountryFlags] = useState({});
    const [availableCountries, setAvailableCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const countryFlagApi = "https://restcountries.com/v3.1/alpha";
    const navigate = useNavigate();
    useEffect(() => {
        fetchAvailableCountries();
        fetchCustomers();
    }, []);

    const fetchCustomers = async (query = '', type = '', country = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (query) params.q = query;
            if (type) params.clientType = type;
            if (country) params.country = country;

            const response = await axios.get(`${config.API_BASE_URL}/client/search`, { params });
            const customersData = response.data;

            setCustomers(customersData);

            fetchCountryFlags(customersData); // Fetch flags separately
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCountries = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/countries`);
            setAvailableCountries(response.data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    const capitalizeFirstLetter = (string) => {
        if (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        return '';
    };

    const fetchCountryFlags = async (customersData) => {
        const flags = {};
        await Promise.all(customersData.map(async (customer) => {
            const countryCode = customer.country;
            if (!flags[countryCode]) { // Avoid duplicate fetches
                try {
                    const response = await axios.get(`${countryFlagApi}/${countryCode}`);
                    flags[countryCode] = response.data[0].flags.png;
                } catch (error) {
                    console.error(`Error fetching flag for ${countryCode}:`, error);
                }
            }
        }));
        setCountryFlags(flags); // Update state once all fetches are done
    };




    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchCustomers(searchQuery, customerType, selectedCountry);
        }, 300); // 300ms delay before search triggers
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, customerType, selectedCountry]);

    const handleNewAddCustomer = () => {
        setShowNewAddCustomerModal(true);
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleFilterChange = (type) => {
        setCustomerType(type);
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
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

            </Row>

            {/* Filters and Add Customer Button */}
            <Row className="mb-4 align-items-center justify-content-between">
                <Col>
                    <Row>
                        {/* Search Bar */}
                        <Col md={6}>
                            <InputGroup>
                                <FormControl
                                    placeholder="Search customers..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </InputGroup>
                        </Col>

                        {/* Customer Type Filter */}
                        <Col className="col-md-auto">
                            <InputGroup>
                                <DropdownButton
                                    as={InputGroup.Append}
                                    variant="outline-secondary"
                                    title={customerType ? capitalizeFirstLetter(customerType) : 'All Types'}
                                    id="input-group-dropdown-type"
                                >
                                    <Dropdown.Item onClick={() => handleFilterChange('')}>All Types</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleFilterChange('pathology')}>Pathology</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleFilterChange('surgery')}>Surgery</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleFilterChange('editor')}>Editor</Dropdown.Item>
                                </DropdownButton>
                            </InputGroup>
                        </Col>

                        {/* Country Filter */}
                        <Col className="col-md-auto">
                            <InputGroup>
                                <DropdownButton
                                    as={InputGroup.Append}
                                    variant="outline-secondary"
                                    title={selectedCountry || 'All Countries'}
                                    id="input-group-dropdown-country"
                                >
                                    <Dropdown.Item onClick={() => handleCountryChange('')}>All Countries</Dropdown.Item>
                                    {availableCountries.map((countryCode) => (
                                        <Dropdown.Item key={countryCode} onClick={() => handleCountryChange(countryCode)}>
                                            {countryCode}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </InputGroup>
                        </Col>
                    </Row>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={handleGenerateReport}>
                        Generate Report
                    </Button>
                </Col>

                {/* Add Customer Button */}
                <Col className="col-md-auto text-end">
                    <Button variant="primary" onClick={handleNewAddCustomer}>
                        Add Customer
                    </Button>
                </Col>
            </Row>

            {/* Loading Spinner */}
            {loading && (
                <Row className="justify-content-center">
                    <Col md={2} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {/* Customers List */}
            {!loading && (
                <>
                    <div className="mt-3">
                        <Row style={{fontWeight: "bold"}} className="font-weight-bold text-center">
                            <Col md={1} onClick={() => handleSort('country')}>
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
                                const customerTypeDisplay = customerTypes.join('/') || 'N/A';

                                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

                                return (
                                    <Row
                                        key={customer.id}
                                        className="align-items-center text-center mb-2"
                                        style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                        onClick={() => navigate(`/customer/${customer.id}`, { state: { openAccordion: 'contacts' } })}
                                    >
                                        <Col md={1}>
                                            <img
                                                src={countryFlags[customer.country] ? countryFlags[customer.country] : noImg}
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
                                        <Col className="d-flex justify-content-center" md={1}>
                                            <div style={{background: '#d6d6ee', width: '24px', height: '24px', borderRadius: '6px'}}>
                                                <img
                                                    src={personIcon}
                                                    alt="person_icon.png"
                                                    style={{
                                                      width: '20px',
                                                      height: '20px'
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                        <Col className="text-end" md={2}>19.02.24</Col>
                                    </Row>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* NewAddCustomer Modal */}
            {showNewAddCustomerModal && (
                <NewAddCustomer
                    show={showNewAddCustomerModal}
                    onClose={handleCloseNewAddCustomerModal}
                />
            )}

            {/* Generate Report Modal */}
            <GenerateReportModal show={showGenerateReportModal} handleClose={handleCloseGenerateReportModal} />
        </Container>
    );
}

export default Customers;
