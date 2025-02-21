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
    Spinner,
    Form,
    Card
} from 'react-bootstrap';
import config from "../../config/config";
import NewAddCustomer from "./NewAddCustomer";
import GenerateReportModal from "../../modals/GenerateReportModal";
import '../../css/Customers.css';
import noImg from '../../assets/no-img.jpg';
import personIcon from '../../assets/thumbnail_person icon.png';
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { DateUtils } from "../../utils/DateUtils";

// Custom hook to get current window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

function Customers() {
    const location = useLocation();
    const navigate = useNavigate();

    // Always call hooks at the top
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // adjust breakpoint as needed

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClientTypes, setSelectedClientTypes] = useState([]);
    const [showNewAddCustomerModal, setShowNewAddCustomerModal] = useState(false);
    const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'shortName', direction: 'ascending' });
    const [countryFlags, setCountryFlags] = useState({});
    const [availableCountries, setAvailableCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [activityDates, setActivityDates] = useState({});

    const countryFlagApi = "https://restcountries.com/v3.1/alpha";

    // Restore filters from location.state if available
    useEffect(() => {
        if (location.state?.filters) {
            const f = location.state.filters;
            setSearchQuery(f.searchQuery || '');
            setSelectedClientTypes(f.selectedClientTypes || []);
            setSelectedCountry(f.selectedCountry || '');
        }
    }, [location.state]);

    useEffect(() => {
        fetchAvailableCountries();
        fetchCustomers();
        fetchActivityDates();
    }, []);

    const fetchCustomers = async (query = '', clientTypes = [], country = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (clientTypes && clientTypes.length > 0) {
                clientTypes.forEach(type => params.append('clientTypes', type));
            }
            if (country) params.append('country', country);

            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/search`, { params });
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
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/countries`);
            setAvailableCountries(response.data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    const fetchActivityDates = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/activity/dates`);
            setActivityDates(response.data);
        } catch (error) {
            console.error('Error fetching activity dates', error);
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
                    const response = await axiosInstance.get(`${countryFlagApi}/${countryCode}`);
                    flags[countryCode] = response.data[0].flags.png;
                } catch (error) {
                    console.error(`Error fetching flag for ${countryCode}:`, error);
                }
            }
        }));
        setCountryFlags(flags);
    };

    const getDeadlineColor = (endDateTime) => {
        const now = new Date();
        const endDate = new Date(endDateTime);
        if (endDate < now) {
            return 'red';
        }
        const diffInDays = (endDate - now) / (1000 * 60 * 60 * 24);
        if (diffInDays <= 7) {
            return 'orange';
        }
        return 'green';
    };

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchCustomers(searchQuery, selectedClientTypes, selectedCountry);
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, selectedClientTypes, selectedCountry]);

    const handleNewAddCustomer = () => {
        setShowNewAddCustomerModal(true);
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
    };

    const handleCloseNewAddCustomerModal = () => {
        setShowNewAddCustomerModal(false);
        fetchCustomers(); // Refresh after adding a customer
    };

    const handleGenerateReport = () => {
        setShowGenerateReportModal(true);
    };

    const handleCloseGenerateReportModal = () => {
        setShowGenerateReportModal(false);
    };

    const handleSortChange = (key) => {
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

    const handleClientTypeCheck = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedClientTypes(prev => [...prev, value]);
        } else {
            setSelectedClientTypes(prev => prev.filter(type => type !== value));
        }
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

    const sortedCustomers = sortCustomers(customers, sortConfig.key, sortConfig.direction);

    return (
        <Container className="mt-5">
            <Row className="mb-3">
                <Col>
                    <h1>Customers</h1>
                </Col>
            </Row>

            <Row className="mb-4 align-items-center justify-content-between">
                <Col>
                    <InputGroup>
                        <FormControl
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
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
                <Col className="col-md-auto text-end">
                    <Button variant="primary" onClick={handleGenerateReport} className="me-2">
                        Generate Report
                    </Button>
                    <Button variant="primary" onClick={handleNewAddCustomer}>
                        Add Customer
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form>
                        <div className="d-flex flex-wrap">
                            <Form.Check
                                type="checkbox"
                                label="Pathology"
                                value="pathology"
                                checked={selectedClientTypes.includes('pathology')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                label="Surgery"
                                value="surgery"
                                checked={selectedClientTypes.includes('surgery')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                label="Editor"
                                value="editor"
                                checked={selectedClientTypes.includes('editor')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                label="Other"
                                value="other"
                                checked={selectedClientTypes.includes('other')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                label="Prospect"
                                value="prospect"
                                checked={selectedClientTypes.includes('prospect')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                label="Agreement"
                                value="agreement"
                                checked={selectedClientTypes.includes('agreement')}
                                onChange={handleClientTypeCheck}
                                className="me-3 mb-2"
                            />
                        </div>
                    </Form>
                </Col>
            </Row>

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
                    {isMobile ? (
                        // Mobile view: Render each customer as a Card
                        sortedCustomers.length === 0 ? (
                            <Alert variant="info">No customers found.</Alert>
                        ) : (
                            sortedCustomers.map((customer) => {
                                // Determine client types for display
                                const customerTypes = [];
                                if (customer.pathologyClient) customerTypes.push('Pathology');
                                if (customer.surgeryClient) customerTypes.push('Surgery');
                                if (customer.editorClient) customerTypes.push('Editor');
                                if (customer.otherMedicalDevices) customerTypes.push('Other');
                                if (customer.prospect) customerTypes.push('Prospect');
                                if (customer.agreement) customerTypes.push('Agreement');
                                const customerTypeDisplay = customerTypes.length > 0 ? customerTypes.join(', ') : 'N/A';

                                // Get activity deadline color and formatted update date
                                const deadlineColor = getDeadlineColor(activityDates[customer.id]?.endDateTime);
                                const updateDate = DateUtils.formatDate(activityDates[customer.id]?.updateDateTime) || "N/A";

                                return (
                                    <Card
                                        key={customer.id}
                                        className="mb-3"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/customer/${customer.id}`, {
                                            state: {
                                                fromPath: '/customers',
                                                filters: { searchQuery, selectedClientTypes, selectedCountry }
                                            }
                                        })}
                                    >
                                        <Card.Body>
                                            <Card.Title>{customer.fullName}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">{customer.shortName}</Card.Subtitle>
                                            <Card.Text>
                                                <div>
                                                    <strong>Country:</strong> {customer.country}{' '}
                                                    <img
                                                        src={countryFlags[customer.country] ? countryFlags[customer.country] : noImg}
                                                        alt={`${customer.country} flag`}
                                                        style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            marginLeft: '8px'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <strong>Type:</strong> {customerTypeDisplay}
                                                </div>
                                                <div>
                                                    <strong>Activity:</strong>{' '}
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            backgroundColor: deadlineColor,
                                                            marginRight: '8px'
                                                        }}
                                                    />
                                                    {updateDate}
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                );
                            })
                        )
                    ) : (
                        // Desktop view: Render header and rows
                        <div className="mt-3">
                            <Row className="fw-bold">
                                <Col md={1} onClick={() => handleSortChange('country')} style={{ cursor: 'pointer' }}>
                                    Country {renderSortArrow('country')}
                                </Col>
                                <Col md={2} onClick={() => handleSortChange('shortName')} style={{ cursor: 'pointer' }}>
                                    Short Name {renderSortArrow('shortName')}
                                </Col>
                                <Col md={4} onClick={() => handleSortChange('fullName')} style={{ cursor: 'pointer' }}>
                                    Full Name {renderSortArrow('fullName')}
                                </Col>
                                <Col md={3}>
                                    Type
                                </Col>
                                <Col md={1}>
                                    Contact
                                </Col>
                                <Col md={1}>
                                    Activity
                                </Col>
                            </Row>
                            <hr />
                            {sortedCustomers.length === 0 ? (
                                <Alert variant="info">No customers found.</Alert>
                            ) : (
                                sortedCustomers.map((customer, index) => {
                                    const customerTypes = [];
                                    if (customer.pathologyClient) customerTypes.push('Pathology');
                                    if (customer.surgeryClient) customerTypes.push('Surgery');
                                    if (customer.editorClient) customerTypes.push('Editor');
                                    if (customer.otherMedicalDevices) customerTypes.push('Other');
                                    if (customer.prospect) customerTypes.push('Prospect');
                                    if (customer.agreement) customerTypes.push('Agreement');
                                    const customerTypeDisplay = customerTypes.length > 0 ? customerTypes.join(', ') : 'N/A';

                                    const deadlineColor = getDeadlineColor(activityDates[customer.id]?.endDateTime);
                                    const updateDate = DateUtils.formatDate(activityDates[customer.id]?.updateDateTime) || "N/A";

                                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

                                    return (
                                        <Row
                                            key={customer.id}
                                            className="mb-2 py-2"
                                            style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                            onClick={() => navigate(`/customer/${customer.id}`, {
                                                state: {
                                                    fromPath: '/customers',
                                                    filters: { searchQuery, selectedClientTypes, selectedCountry }
                                                }
                                            })}
                                        >
                                            <Col md={1}>
                                                <img
                                                    src={countryFlags[customer.country] ? countryFlags[customer.country] : noImg}
                                                    alt={`${customer.country} flag`}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        marginRight: '8px'
                                                    }}
                                                />
                                                {customer.country}
                                            </Col>
                                            <Col md={2}>{customer.shortName}</Col>
                                            <Col md={4}>{customer.fullName}</Col>
                                            <Col md={3}>{customerTypeDisplay}</Col>
                                            <Col md={1}>
                                                <div
                                                    style={{
                                                        background: '#d6d6ee',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '6px',
                                                        display: "grid",
                                                        alignContent: "center",
                                                        justifyContent: "center",
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/customer/${customer.id}`, { state: { openAccordion: 'contacts' } });
                                                    }}
                                                >
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
                                            <Col md={1}>
                                                <div
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/customer/${customer.id}`, { state: { openAccordion: 'activity' } });
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            backgroundColor: deadlineColor,
                                                            marginRight: '8px',
                                                        }}
                                                    />
                                                    {updateDate}
                                                </div>
                                            </Col>
                                        </Row>
                                    );
                                })
                            )}
                        </div>
                    )}
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
