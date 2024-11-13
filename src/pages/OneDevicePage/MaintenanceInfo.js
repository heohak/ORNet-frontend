// MaintenanceInfo.js
import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import MaintenanceModal from "../OneClientPage/MaintenanceModal";
import AddMaintenanceModal from "../OneClientPage/AddMaintenanceModal";
import '../../css/OneDevicePage/OneDevice.css'; // Adjust the path as needed

function MaintenanceInfo({ maintenanceInfo, deviceId, setRefresh }) {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'maintenanceName', direction: 'ascending' });

    const estoniaDateFormat = new Intl.DateTimeFormat('et-EE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedMaintenances = [...maintenanceInfo].sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const handleMaintenanceClick = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setShowMaintenanceModal(true);
    };

    return (
        <>
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>
                        Maintenances
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                        Add Maintenance
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row style={{ fontWeight: "bold" }} className="text-center">
                <Col md={6} onClick={() => handleSort('maintenanceName')} style={{ cursor: 'pointer' }}>
                    Maintenance Name {renderSortArrow('maintenanceName')}
                </Col>
                <Col md={6} onClick={() => handleSort('maintenanceDate')} style={{ cursor: 'pointer' }}>
                    Date {renderSortArrow('maintenanceDate')}
                </Col>
            </Row>
            <hr />

            {/* Maintenance List */}
            {sortedMaintenances.length > 0 ? (
                sortedMaintenances.map((maintenance, index) => {
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    return (
                        <Row
                            key={maintenance.id}
                            className="align-items-center text-center mb-2"
                            style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                            onClick={() => handleMaintenanceClick(maintenance.id)}
                        >
                            <Col md={6}>{maintenance.maintenanceName}</Col>
                            <Col md={6}>
                                {maintenance.maintenanceDate
                                    ? estoniaDateFormat.format(new Date(maintenance.maintenanceDate))
                                    : ''}
                            </Col>
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">
                    No maintenances available.
                </Alert>
            )}

            {/* Add Maintenance Modal */}
            <AddMaintenanceModal
                show={showAddMaintenanceModal}
                handleClose={() => setShowAddMaintenanceModal(false)}
                deviceId={deviceId}
                setRefresh={setRefresh}
            />

            {/* Maintenance Details Modal */}
            <MaintenanceModal
                show={showMaintenanceModal}
                handleClose={() => setShowMaintenanceModal(false)}
                maintenanceId={selectedMaintenanceId}
            />
        </>
    );
}

export default MaintenanceInfo;
