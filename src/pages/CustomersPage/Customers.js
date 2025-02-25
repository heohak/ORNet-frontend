import React, { useEffect, useState, useRef } from 'react';
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
    Card,
    Collapse
} from 'react-bootstrap';
import config from "../../config/config";
import NewAddCustomer from "./NewAddCustomer";
import GenerateReportModal from "../../modals/GenerateReportModal";
import '../../css/Customers.css';
import noImg from '../../assets/no-img.jpg';
import personIcon from '../../assets/thumbnail_person icon.png';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { DateUtils } from "../../utils/DateUtils";
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
    const navigate = useNavigate();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // for responsive layout

    // Data states
    const [customers, setCustomers] = useState([]);
    const [activityDates, setActivityDates] = useState({});
    const [countryFlags, setCountryFlags] = useState({});
    const [availableCountries, setAvailableCountries] = useState([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClientTypes, setSelectedClientTypes] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'shortName', direction: 'ascending' });
    const [showNewAddCustomerModal, setShowNewAddCustomerModal] = useState(false);
    const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // For skipping the initial save to localStorage
    const firstRender = useRef(true);

    const countryFlagApi = "https://restcountries.com/v3.1/alpha";

    // -------------------- Load filters from localStorage on mount --------------------
    useEffect(() => {
        const savedFilters = localStorage.getItem("customerFilters");
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                setSearchQuery(parsed.searchQuery || "");
                setSelectedClientTypes(parsed.selectedClientTypes || []);
                setSelectedCountry(parsed.selectedCountry || "");
            } catch (err) {
                console.error("Error parsing saved filters:", err);
            }
        }
    }, []);

    // -------------------- Save filters to localStorage on every change (skip first render) --------------------
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const filters = { searchQuery, selectedClientTypes, selectedCountry };
        localStorage.setItem("customerFilters", JSON.stringify(filters));
    }, [searchQuery, selectedClientTypes, selectedCountry]);

    // Clear filters
    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedClientTypes([]);
        setSelectedCountry("");
        localStorage.removeItem("customerFilters");
    };

    // -------------------- Initial data fetch on mount --------------------
    useEffect(() => {
        fetchAvailableCountries();
        fetchActivityDates();
    }, []);

    // -------------------- Debounce filter changes for fetch --------------------
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchCustomers(searchQuery, selectedClientTypes, selectedCountry);
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery, selectedClientTypes, selectedCountry]);

    // -------------------- Fetchers --------------------
    const fetchCustomers = async (query = '', clientTypes = [], country = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (clientTypes.length > 0) {
                clientTypes.forEach(type => params.append('clientTypes', type));
            }
            if (country) params.append('country', country);

            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/search`, { params });
            const data = response.data;
            setCustomers(data);
            fetchCountryFlags(data);
        } catch (err) {
            setError(err.message);
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

    const fetchCountryFlags = async (customersData) => {
        const flags = {};
        await Promise.all(customersData.map(async (customer) => {
            const countryCode = customer.country;
            if (!flags[countryCode]) {
                try {
                    const res = await axiosInstance.get(`${countryFlagApi}/${countryCode}`);
                    flags[countryCode] = res.data[0].flags.png;
                } catch (err) {
                    console.error(`Error fetching flag for ${countryCode}:`, err);
                }
            }
        }));
        setCountryFlags(flags);
    };

    // -------------------- Helpers --------------------
    const getDeadlineColor = (endDateTime) => {
        const now = new Date();
        const endDate = new Date(endDateTime);
        if (endDate < now) return 'red';
        const diffInDays = (endDate - now) / (1000 * 60 * 60 * 24);
        if (diffInDays <= 7) return 'orange';
        return 'green';
    };

    const handleNewAddCustomer = () => {
        setShowNewAddCustomerModal(true);
    };

    const handleCloseNewAddCustomerModal = () => {
        setShowNewAddCustomerModal(false);
        // Refresh after adding a customer
        fetchCustomers(searchQuery, selectedClientTypes, selectedCountry);
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

    const sortCustomers = (list, key, direction) => {
        const sorted = [...list];
        sorted.sort((a, b) => {
            const nameA = (a[key] || '').toString().toLowerCase();
            const nameB = (b[key] || '').toString().toLowerCase();
            if (nameA < nameB) return direction === 'ascending' ? -1 : 1;
            if (nameA > nameB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleCountryChange = (countryCode) => {
        setSelectedCountry(countryCode);
    };

    const handleClientTypeCheck = (e) => {
        const { value, checked } = e.target;
        setSelectedClientTypes(prev =>
            checked ? [...prev, value] : prev.filter(type => type !== value)
        );
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
    const lastVisitedCustomerId = localStorage.getItem("lastVisitedCustomerId");

    return (
        <Container className="mt-5">
            {isMobile ? (
                <>
                    {/* Mobile Header: Title + Generate Report & Add Customer buttons */}
                    <Row className="d-flex justify-content-between align-items-center mb-4">
                        <Col xs='auto'>
                            <h1 className="mb-0">Customers</h1>
                        </Col>
                        <Col xs='auto' className="text-end">
                            <Button variant="primary" onClick={handleGenerateReport} className="me-2">
                                Report
                            </Button>
                            <Button variant="primary" onClick={handleNewAddCustomer}>
                                Add New
                            </Button>
                        </Col>
                    </Row>
                    {/* Mobile Filters */}
                    <Row className="mb-3 align-items-center">
                        <Col>
                            <InputGroup>
                                <FormControl
                                    placeholder="Search customers..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center">
                            <Button variant="outline-secondary" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                                <FaFilter style={{ marginRight: '0.5rem' }} />
                                {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
                            </Button>
                        </Col>
                    </Row>
                    <Collapse in={showMobileFilters}>
                        <div className="mb-3" style={{ padding: '0 1rem' }}>
                            {/* Advanced filters: Country dropdown and Client Types checkboxes */}
                            <Row className="mb-2">
                                <Col>
                                    <InputGroup>
                                        <DropdownButton
                                            as={InputGroup.Append}
                                            variant="outline-secondary"
                                            title={selectedCountry || 'All Countries'}
                                            id="input-group-dropdown-country"
                                        >
                                            <Dropdown.Item onClick={() => handleCountryChange('')}>
                                                All Countries
                                            </Dropdown.Item>
                                            {availableCountries.map((code) => (
                                                <Dropdown.Item key={code} onClick={() => handleCountryChange(code)}>
                                                    {code}
                                                </Dropdown.Item>
                                            ))}
                                        </DropdownButton>
                                    </InputGroup>
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
                            {/* Clear Filters Button inside the dropdown */}
                            <Row className="mt-2">
                                <Col>
                                    <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
                                        Clear Filters
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Collapse>
                </>
            ) : (
                <>
                    {/* Desktop Header */}
                    <Row className="mb-3">
                        <Col>
                            <h1>Customers</h1>
                        </Col>
                    </Row>
                    {/* Desktop Filters */}
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
                                    <Dropdown.Item onClick={() => handleCountryChange('')}>
                                        All Countries
                                    </Dropdown.Item>
                                    {availableCountries.map((code) => (
                                        <Dropdown.Item key={code} onClick={() => handleCountryChange(code)}>
                                            {code}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </InputGroup>
                        </Col>
                        <Col className="col-md-auto text-end">
                            <Button variant="outline-secondary" onClick={handleClearFilters} className="me-2">
                                Clear Filters
                            </Button>
                            <Button variant="primary" onClick={handleGenerateReport} className="me-2">
                                Generate Report
                            </Button>
                            <Button variant="primary" onClick={handleNewAddCustomer}>
                                Add Customer
                            </Button>
                        </Col>
                    </Row>
                    {/* Desktop Client Types */}
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
                </>
            )}

            {loading && (
                <Row className="justify-content-center">
                    <Col md={2} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {!loading && (
                <>
                    {sortedCustomers.length === 0 ? (
                        <Alert variant="info">No customers found.</Alert>
                    ) : (
                        isMobile ? (
                            // Mobile view: each customer as a Card
                            sortedCustomers.map((customer) => (
                                <Card
                                    key={customer.id}
                                    className="mb-3"
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: customer.id.toString() === lastVisitedCustomerId ? "#ffffcc" : "inherit"
                                    }}
                                    onClick={() => {
                                        localStorage.setItem("lastVisitedCustomerId", customer.id);
                                        navigate(`/customer/${customer.id}`);
                                    }}
                                >
                                    <Card.Body>
                                        <Card.Title>{customer.fullName}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {customer.shortName}
                                        </Card.Subtitle>
                                        <Card.Text>
                                            <div>
                                                <strong>Country:</strong> {customer.country}{' '}
                                                <img
                                                    src={countryFlags[customer.country] || noImg}
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
                                                <strong>Type:</strong>{' '}
                                                {[
                                                    customer.pathologyClient && 'Pathology',
                                                    customer.surgeryClient && 'Surgery',
                                                    customer.editorClient && 'Editor',
                                                    customer.otherMedicalDevices && 'Other',
                                                    customer.prospect && 'Prospect',
                                                    customer.agreement && 'Agreement'
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || 'N/A'}
                                            </div>
                                            <div>
                                                <strong>Activity:</strong>{' '}
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        backgroundColor: getDeadlineColor(activityDates[customer.id]?.endDateTime),
                                                        marginRight: '8px'
                                                    }}
                                                />
                                                {DateUtils.formatDate(activityDates[customer.id]?.updateDateTime) || "N/A"}
                                            </div>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            // Desktop view: header + rows
                            <div className="mt-3">
                                <Row className="fw-bold">
                                    <Col
                                        md={1}
                                        onClick={() => handleSortChange('country')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Country {renderSortArrow('country')}
                                    </Col>
                                    <Col
                                        md={2}
                                        onClick={() => handleSortChange('shortName')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Short Name {renderSortArrow('shortName')}
                                    </Col>
                                    <Col
                                        md={4}
                                        onClick={() => handleSortChange('fullName')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Full Name {renderSortArrow('fullName')}
                                    </Col>
                                    <Col md={3}>Type</Col>
                                    <Col md={1}>Contact</Col>
                                    <Col md={1}>Activity</Col>
                                </Row>
                                <hr />
                                {sortedCustomers.map((customer, index) => {
                                    const customerTypes = [];
                                    if (customer.pathologyClient) customerTypes.push('Pathology');
                                    if (customer.surgeryClient) customerTypes.push('Surgery');
                                    if (customer.editorClient) customerTypes.push('Editor');
                                    if (customer.otherMedicalDevices) customerTypes.push('Other');
                                    if (customer.prospect) customerTypes.push('Prospect');
                                    if (customer.agreement) customerTypes.push('Agreement');

                                    const typeDisplay = customerTypes.length > 0
                                        ? customerTypes.join(', ')
                                        : 'N/A';

                                    const deadlineColor = getDeadlineColor(activityDates[customer.id]?.endDateTime);
                                    const updateDate =
                                        DateUtils.formatDate(activityDates[customer.id]?.updateDateTime) || "N/A";

                                    const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                    const rowBgColor =
                                        customer.id.toString() === lastVisitedCustomerId ? "#ffffcc" : baseBgColor;

                                    return (
                                        <Row
                                            key={customer.id}
                                            className="mb-2 py-2"
                                            style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                            onClick={() => {
                                                localStorage.setItem("lastVisitedCustomerId", customer.id);
                                                navigate(`/customer/${customer.id}`);
                                            }}
                                        >
                                            <Col md={1}>
                                                <img
                                                    src={countryFlags[customer.country] || noImg}
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
                                            <Col md={3}>{typeDisplay}</Col>
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
                                                        navigate(`/customer/${customer.id}`, {
                                                            state: { openAccordion: 'contacts' }
                                                        });
                                                    }}
                                                >
                                                    <img
                                                        src={personIcon}
                                                        alt="person_icon.png"
                                                        style={{ width: '20px', height: '20px' }}
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
                                                        navigate(`/customer/${customer.id}`, {
                                                            state: { openAccordion: 'activity' }
                                                        });
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
                                })}
                            </div>
                        )
                    )}
                </>
            )}

            {loading && (
                <Row className="justify-content-center">
                    <Col md={2} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {showNewAddCustomerModal && (
                <NewAddCustomer
                    show={showNewAddCustomerModal}
                    onClose={handleCloseNewAddCustomerModal}
                />
            )}

            {showGenerateReportModal && (
                <GenerateReportModal
                    show={showGenerateReportModal}
                    handleClose={handleCloseGenerateReportModal}
                />
            )}
        </Container>
    );
}

export default Customers;
