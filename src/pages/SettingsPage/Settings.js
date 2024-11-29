import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    FaLaptop,
    FaUserShield,
    FaMapMarkerAlt,
    FaDatabase,
    FaTools,
    FaNetworkWired,
    FaLink,
    FaUserFriends,
    FaSitemap,
    FaFileUpload,
    FaServer,
} from 'react-icons/fa';
import '../../css/SettingsPage/Settings.css';

function Settings() {
    const navigate = useNavigate();

    const settingsOptions = [
        {
            title: 'Predefined Device Names',
            icon: <FaLaptop />,
            route: '/settings/predefined-device-names',
        },
        {
            title: 'Bait Workers',
            icon: <FaUserShield />,
            route: '/view-bait-workers',
        },
        {
            title: 'Locations',
            icon: <FaMapMarkerAlt />,
            route: '/settings/locations',
        },
        {
            title: 'Device Types',
            icon: <FaDatabase />,
            route: '/settings/device-classificators',
        },
        {
            title: 'Ticket Status Classificators',
            icon: <FaTools />,
            route: '/settings/ticket-status-classificators',
        },
        {
            title: 'Third Party ITs',
            icon: <FaNetworkWired />,
            route: '/settings/third-party-its',
        },
        {
            title: 'Linked Devices',
            icon: <FaLink />,
            route: '/settings/linked-devices',
        },
        {
            title: 'Customer Contact Roles',
            icon: <FaUserFriends />,
            route: '/settings/client-worker-roles',
        },
        {
            title: 'Technical Information',
            icon: <FaSitemap />,
            route: '/settings/software',
        },
        {
            title: 'Upload Files',
            icon: <FaFileUpload />,
            route: '/settings/files',
        },
        {
            title: 'Work Types',
            icon: <FaServer />,
            route: '/settings/work-types',
        },
    ];

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Settings</h1>
            <Row xs={1} md={2} lg={3} className="g-4">
                {settingsOptions.map((option, idx) => (
                    <Col key={idx}>
                        <Card
                            className="settings-card h-100"
                            onClick={() => navigate(option.route)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body className="d-flex align-items-center">
                                <div className="me-3 settings-icon">{option.icon}</div>
                                <Card.Title>{option.title}</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Settings;
