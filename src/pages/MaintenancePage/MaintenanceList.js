import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { DateUtils } from "../../utils/DateUtils";

// Custom hook to detect window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

const MaintenanceList = ({ maintenances, locationNames, setSelectedMaintenance, setShowDetailsModal }) => {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // Adjust breakpoint as needed

    if (isMobile) {
        // Mobile view: render each maintenance as a card
        return (
            <div className="mt-3">
                {maintenances.map((maintenance) => (
                    <Card
                        key={maintenance.id}
                        className="mb-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedMaintenance(maintenance); setShowDetailsModal(true); }}
                    >
                        <Card.Body>
                            <Card.Title>{maintenance.maintenanceName}</Card.Title>
                            <Card.Text>
                                <div>
                                    <strong>Location:</strong> {locationNames[maintenance.locationId]}
                                </div>
                                <div>
                                    <strong>Planned Date:</strong> {DateUtils.formatDate(maintenance.maintenanceDate)}
                                </div>
                                <div>
                                    <strong>Status:</strong> {maintenance.maintenanceStatus}
                                </div>
                                <div>
                                    <strong>Last Date:</strong> {DateUtils.formatDate(maintenance.lastDate)}
                                </div>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }

    // Desktop view: render the table-like row layout
    return (
        <>
            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={3}>Maintenance Name</Col>
                <Col md={3}>Location</Col>
                <Col md={3}>Planned Date</Col>
                <Col md={2}>Status</Col>
                <Col md={1}>Last Date</Col>
            </Row>
            <hr />
            {maintenances.map((maintenance, index) => {
                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                return (
                    <Row
                        key={maintenance.id}
                        className="align-items-center"
                        style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                        onClick={() => { setSelectedMaintenance(maintenance); setShowDetailsModal(true); }}
                    >
                        <Col md={3} className="py-2">
                            {maintenance.maintenanceName}
                        </Col>
                        <Col md={3} className="py-2">
                            {locationNames[maintenance.locationId]}
                        </Col>
                        <Col md={3} className="py-2">
                            {DateUtils.formatDate(maintenance.maintenanceDate)}
                        </Col>
                        <Col md={2} className="py-2">
                            {maintenance.maintenanceStatus}
                        </Col>
                        <Col md={1} className="py-2">
                            {DateUtils.formatDate(maintenance.lastDate)}
                        </Col>
                    </Row>
                );
            })}
        </>
    );
};

export default MaintenanceList;
