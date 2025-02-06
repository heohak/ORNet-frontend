import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import axiosInstance from "../../config/axiosInstance";
import '../../css/Ticketslist.css';
import {DateUtils} from "../../utils/DateUtils";

const TicketsList = ({ tickets, loading, onNavigate, error, statuses }) => {
    const [locations, setLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationsError, setLocationsError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });


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

    // Sorting helper functions
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
        let direction = 'ascending'; // Default direction for the first click
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
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

    // Helper function to find location name by locationId
    const getLocationName = (locationId) => {
        const location = locations.find((loc) => loc.id === locationId);
        return location ? location.name : 'Unknown Location';
    };

    // Sort tickets based on the current sort config
    const sortedTickets = sortConfig.key
        ? sortTickets(tickets, sortConfig.key, sortConfig.direction)
        : tickets;

    // Function to render sort arrows
    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕'; // Default for unsorted
    };

    return (
        <div className="mt-3">
            {/* Table header with sortable columns */}
            <Row className="fw-bold">
                <Col md={1} onClick={() => handleSort('date')}>
                    Date {renderSortArrow('date')}
                </Col>
                <Col md={1} onClick={() => handleSort('numeration')}>
                    No. {renderSortArrow('numeration')}
                </Col>
                <Col md={3} onClick={() => handleSort('clientName')}>
                    Customer {renderSortArrow('clientName')}
                </Col>
                <Col md={2} onClick={() => handleSort('location')}>
                    Location {renderSortArrow('location')}
                </Col>
                <Col md={2} onClick={() => handleSort('title')}>
                    Title {renderSortArrow('title')}
                </Col>
                <Col md={2}>Status</Col>
                <Col className="text-center" md={1}>Priority</Col>
            </Row>

            <hr />

            {/* Ticket rows */}
            {sortedTickets.map((ticket, index) => {
                const status = statuses.find((status) => status.id === ticket.statusId);
                const statusName = status?.status || 'Unknown Status';
                const statusColor = status?.color || '#007bff';
                const priorityColor = ticket.crisis ? 'red' : 'green'; // Crisis check

                // Alternating background colors
                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff'; // Light grey and white

                return (
                    <Row
                        key={ticket.id}
                        className="align-items-center py-1"
                        style={{ backgroundColor: rowBgColor, cursor: 'pointer' }} // Apply background color
                        onClick={() => onNavigate(ticket)}
                    >
                        <Col md={1}>{DateUtils.formatDate(ticket.startDateTime)}</Col>
                        <Col md={1}>{ticket.baitNumeration}</Col>
                        <Col md={3}>{ticket.clientName}</Col>
                        <Col md={2}>{getLocationName(ticket.locationId)}</Col> {/* Look up location */}
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
        </div>
    );
};

export default TicketsList;
