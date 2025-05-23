import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { DateUtils } from "../../utils/DateUtils";
import MaintenanceSort from "../../utils/MaintenanceSort";

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

    // Custom function to get sorting value
    const getSortValue = (item, key) => {
        if (key === 'locationId') return locationNames[item.locationId] || ''; // Convert ID to name
        return item[key];
    };

    // Use sorting hook
    const { sortedItems, handleSort, sortConfig } = MaintenanceSort(maintenances, { key: 'maintenanceName', direction: 'ascending' }, getSortValue);

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    // Retrieve the last visited maintenance ID from localStorage.
    const lastVisitedMaintenanceId = localStorage.getItem("lastVisitedMaintenanceId");

    if (isMobile) {
        // Mobile view: render each maintenance as a card
        return (
            <div className="mt-3">
                {sortedItems.map((maintenance) => (
                    <Card
                        key={maintenance.id}
                        className="mb-3"
                        style={{
                            cursor: 'pointer',
                            backgroundColor: maintenance.id.toString() === lastVisitedMaintenanceId ? "#ffffcc" : "inherit"
                        }}
                        onClick={() => {
                            localStorage.setItem("lastVisitedMaintenanceId", maintenance.id);
                            setSelectedMaintenance(maintenance);
                            setShowDetailsModal(true);
                        }}
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
                                    <strong>Executed Date:</strong> {DateUtils.formatDate(maintenance.lastDate)}
                                </div>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }

    // Desktop view: render the table-like row layout with sortable headers
    return (
        <>
            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={3} onClick={() => handleSort('locationId')}>
                    Location {renderSortArrow('locationId')}
                </Col>
                <Col md={3} onClick={() => handleSort('maintenanceName')}>
                    Maintenance Name {renderSortArrow('maintenanceName')}
                </Col>
                <Col md={3} onClick={() => handleSort('maintenanceDate')}>
                    Planned Date {renderSortArrow('maintenanceDate')}
                </Col>
                <Col md={1} onClick={() => handleSort('maintenanceStatus')}>
                    Status {renderSortArrow('maintenanceStatus')}
                </Col>
                <Col md={2} onClick={() => handleSort('lastDate')}>
                    Executed Date {renderSortArrow('lastDate')}
                </Col>
            </Row>
            <hr />
            {sortedItems.map((maintenance, index) => {
                const baseBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                const rowBgColor = maintenance.id.toString() === lastVisitedMaintenanceId ? "#ffffcc" : baseBgColor;
                return (
                    <Row
                        key={maintenance.id}
                        className="align-items-center"
                        style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                        onClick={() => {
                            localStorage.setItem("lastVisitedMaintenanceId", maintenance.id);
                            setSelectedMaintenance(maintenance);
                            setShowDetailsModal(true);
                        }}
                    >
                        <Col md={3} className="py-2">
                            {locationNames[maintenance.locationId]}
                        </Col>
                        <Col md={3} className="py-2">
                            {maintenance.maintenanceName}
                        </Col>
                        <Col md={3} className="py-2">
                            {DateUtils.formatDate(maintenance.maintenanceDate)}
                        </Col>
                        <Col md={1} className="py-2">
                            {maintenance.maintenanceStatus}
                        </Col>
                        <Col md={2} className="py-2">
                            {DateUtils.formatDate(maintenance.lastDate)}
                        </Col>
                    </Row>
                );
            })}
        </>
    );
};

export default MaintenanceList;
