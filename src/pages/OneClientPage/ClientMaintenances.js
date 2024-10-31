import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import MaintenanceModal from "./MaintenanceModal";
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../css/Customers.css';

function ClientMaintenances({ maintenances, clientId, setRefresh, client }) {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'maintenanceName', direction: 'ascending' });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedMaintenances = [...maintenances].sort((a, b) => {
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
            <Row className="d-flex justify-content-between align-items-center">
                <Col>
                    <h2 className="mt-1">Maintenances</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                        Add Maintenance
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row className="font-weight-bold text-center mt-2">
                <Col md={6} onClick={() => handleSort('maintenanceName')}>
                    Maintenance Name {renderSortArrow('maintenanceName')}
                </Col>
                <Col md={6} onClick={() => handleSort('maintenanceDate')}>
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
                            <Col md={6}>{maintenance.maintenanceDate}</Col>
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">No maintenances available.</Alert>
            )}

            {/* Add Maintenance Modal */}
            <AddMaintenanceModal
                show={showAddMaintenanceModal}
                handleClose={() => setShowAddMaintenanceModal(false)}
                clientId={clientId}
                setRefresh={setRefresh}
                client={client}
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

export default ClientMaintenances;
