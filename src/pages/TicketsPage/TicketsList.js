import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Button, Card } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';
import { DateUtils } from "../../utils/DateUtils";
import '../../css/Ticketslist.css';

// Custom hook to get window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

const TicketsList = ({ tickets, loading, onNavigate, error, statuses }) => {
    const [locations, setLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationsError, setLocationsError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    // Get current window width and determine if mobile view should be used.
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // adjust breakpoint as needed

    // Fetch all locations when the component mounts
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
                const data = await response.data;
                setLocations(data);
                setLocationsLoading(false);
            } catch (err) {
                setLocationsError('Failed to load locations.');
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // Sorting helper function
    const sortTickets = (tickets, key, direction) => {
        const sortedTickets = [...tickets];
        sortedTickets.sort((a, b) => {
            if (key === 'date') {
                const dateA = new Date(a.startDateTime);
                const dateB = new Date(b.startDateTime);
                return direction === 'ascending' ? dateA - dateB : dateB - dateA;
            } else if (key === 'numeration') {
                const [yearA, numberA] = a.baitNumeration.split('-');
                const [yearB, numberB] = b.baitNumeration.split('-');
                if (yearA === yearB) {
                    return direction === 'ascending' ? numberA - numberB : numberB - numberA;
                }
                return direction === 'ascending' ? yearA - yearB : yearB - yearA;
            } else if (key === 'clientName' || key === 'location' || key === 'title') {
                const nameA = key === 'location' ? getLocationName(a.locationId) : a[key];
                const nameB = key === 'location' ? getLocationName(b.locationId) : b[key];
                if (nameA < nameB) return direction === 'descending' ? -1 : 1;
                if (nameA > nameB) return direction === 'descending' ? 1 : -1;
                return 0;
            }
            return 0;
        });
        return sortedTickets;
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Helper function to get location name by locationId
    const getLocationName = (locationId) => {
        const location = locations.find((loc) => loc.id === locationId);
        return location ? location.name : 'Unknown Location';
    };

    if (loading || locationsLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error || locationsError) {
        return (
            <div className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error || locationsError}</p>
                </Alert>
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="mt-5">
                <Alert variant="info">No tickets found.</Alert>
            </div>
        );
    }

    // Sort tickets based on current sort config
    const sortedTickets = sortConfig.key
        ? sortTickets(tickets, sortConfig.key, sortConfig.direction)
        : tickets;

    // Function to render sort arrows for desktop header
    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    return (
        <div className="mt-3">
            {isMobile ? (
                // Mobile view: Render tickets as cards
                sortedTickets.map((ticket) => {
                    const status = statuses.find((status) => status.id === ticket.statusId);
                    const statusName = status?.status || 'Unknown Status';
                    const statusColor = status?.color || '#007bff';
                    const priorityColor = ticket.crisis ? 'red' : 'green';
                    return (
                        <Card
                            key={ticket.id}
                            className="mb-3"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onNavigate(ticket)}
                        >
                            <Card.Body>
                                <Card.Title>{ticket.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    {DateUtils.formatDate(ticket.startDateTime)} | {ticket.baitNumeration}
                                </Card.Subtitle>
                                <Card.Text>
                                    <div>
                                        <strong>Customer:</strong> {ticket.clientName}
                                    </div>
                                    <div>
                                        <strong>Location:</strong> {getLocationName(ticket.locationId)}
                                    </div>
                                    <div className="mt-2">
                                        <strong>Status:</strong>
                                        <span
                                            style={{
                                                backgroundColor: statusColor,
                                                border: `1px solid ${statusColor}`,
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                marginLeft: '10px'
                                            }}
                                        >
                                            {statusName}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <strong>Priority:&nbsp;</strong>
                                        <Button
                                            style={{ backgroundColor: priorityColor, borderColor: priorityColor }}
                                            size="sm"
                                            disabled
                                        ></Button>
                                    </div>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    );
                })
            ) : (
                // Desktop view: Render header row and ticket rows
                <>
                    <Row className="fw-bold">
                        <Col md={1} onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                            Date {renderSortArrow('date')}
                        </Col>
                        <Col md={1} onClick={() => handleSort('numeration')} style={{ cursor: 'pointer' }}>
                            No. {renderSortArrow('numeration')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('clientName')} style={{ cursor: 'pointer' }}>
                            Customer {renderSortArrow('clientName')}
                        </Col>
                        <Col md={2} onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                            Location {renderSortArrow('location')}
                        </Col>
                        <Col md={2} onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                            Title {renderSortArrow('title')}
                        </Col>
                        <Col md={2}>Status</Col>
                        <Col className="text-center" md={1}>Priority</Col>
                    </Row>
                    <hr />
                    {sortedTickets.map((ticket, index) => {
                        const status = statuses.find((status) => status.id === ticket.statusId);
                        const statusName = status?.status || 'Unknown Status';
                        const statusColor = status?.color || '#007bff';
                        const priorityColor = ticket.crisis ? 'red' : 'green';
                        // Alternating row background colors
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={ticket.id}
                                className="align-items-center py-1"
                                style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                onClick={() => onNavigate(ticket)}
                            >
                                <Col md={1}>{DateUtils.formatDate(ticket.startDateTime)}</Col>
                                <Col md={1}>{ticket.baitNumeration}</Col>
                                <Col md={3}>{ticket.clientName}</Col>
                                <Col md={2}>{getLocationName(ticket.locationId)}</Col>
                                <Col md={2}>{ticket.title}</Col>
                                <Col className="d-flex" md={2}>
                                    <Button
                                        style={{ backgroundColor: statusColor, borderColor: statusColor }}
                                        disabled
                                    >
                                        {statusName}
                                    </Button>
                                </Col>
                                <Col className="text-center" md={1}>
                                    <Button
                                        style={{ backgroundColor: priorityColor, borderColor: priorityColor }}
                                        disabled
                                    ></Button>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default TicketsList;
