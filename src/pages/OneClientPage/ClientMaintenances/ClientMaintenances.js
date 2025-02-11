import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import MaintenanceModal from "./MaintenanceModal";
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../../css/Customers.css';
import '../../../css/OneClientPage/OneClient.css';
import {DateUtils} from "../../../utils/DateUtils";
import MaintenanceDetailsModal from "../../MaintenancePage/MaintenanceDetailsModal";
import TermsModal from "./TermsModal";



function ClientMaintenances({ maintenances, clientId, setRefresh, client, locationNames, responsibleNames }) {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
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

    const handleMaintenanceClick = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setShowDetailsModal(true);
    };

    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        Maintenances
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowTermsModal(true)} className="me-2">
                        Terms
                    </Button>

                    <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                        Add Maintenance
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row className="row-margin-0 fw-bold">
                <Col md={3} onClick={() => handleSort('maintenanceName')}>
                    Maintenance Name {renderSortArrow('maintenanceName')}
                </Col>
                <Col md={3} onClick={() => handleSort('location')}>
                    Location {renderSortArrow('location')}
                </Col>
                <Col md={3} onClick={() => handleSort('maintenanceDate')}>
                    Planned Date {renderSortArrow('maintenanceDate')}
                </Col>
                <Col md={2} onClick={() => handleSort('maintenanceStatus')}>
                    Status {renderSortArrow('maintenanceStatus')}
                </Col>
                <Col md={1} onClick={() => handleSort('lastDate')}>
                    Last Date {renderSortArrow('lastDate')}
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
                            className="align-items-center"
                            style={{ margin: '0 0', cursor: 'pointer' }}
                            onClick={() => handleMaintenanceClick(maintenance)}
                        >
                            <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                                <Row className="align-items-center">
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
                            </Col>
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
            {selectedMaintenance &&
                <MaintenanceDetailsModal
                    show={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    maintenance={selectedMaintenance}
                    locationNames={locationNames}
                    setMaintenance={setSelectedMaintenance}
                    setRefresh={setRefresh}
                    responsibleNames={responsibleNames}
                />
            }

            {/* Terms Modal */}
            <TermsModal
                show={showTermsModal}
                onHide={() => setShowTermsModal(false)}
                setRefresh={setRefresh}
                clientId={clientId}
            />
        </>
    );
}

export default ClientMaintenances;
