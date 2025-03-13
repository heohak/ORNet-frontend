import React, {useEffect, useState} from 'react';
import {Row, Col, Button, Alert, Card} from 'react-bootstrap';
import AddMaintenanceModal from "../../MaintenancePage/AddMaintenanceModal";
import '../../../css/Customers.css';
import '../../../css/OneClientPage/OneClient.css';
import {DateUtils} from "../../../utils/DateUtils";
import MaintenanceDetailsModal from "../../MaintenancePage/MaintenanceDetailsModal";
import TermsModal from "./TermsModal";
import axiosInstance from "../../../config/axiosInstance";
import MaintenanceSort from "../../../utils/MaintenanceSort";




function ClientMaintenances({ maintenances, clientId, setRefresh, client, locationNames, responsibleNames, isMobile }) {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [baitWorkers, setBaitWorkers] = useState([])



    useEffect(() => {
        fetchBaitWorkers();
    },[])

    const fetchBaitWorkers = async() => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`)
            const workers = response.data.map(worker => ({
                value: worker.id,
                label: `${worker.firstName} ${worker.lastName}`
            }))
            setBaitWorkers(workers)
        } catch (error) {
            console.error("Error fetching Bait Workers", error);
        }
    }
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

    const handleMaintenanceClick = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setShowDetailsModal(true);
    };

    return (
        <>
            <Row className="align-items-center justify-content-between mb-4">
                <Col xs="auto">
                    <h2 className="mb-0">Maintenances</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={() => setShowTermsModal(true)} className="me-1">
                        Terms
                    </Button>
                    <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                        {isMobile ? 'Add' : 'Add Maintenance'}
                    </Button>
                </Col>
            </Row>


            {isMobile ? (
                <>
                    {sortedItems.length > 0 ? (
                        sortedItems.map((maintenance) => (
                            <Card
                                key={maintenance.id}
                                className="mb-3 mt-3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleMaintenanceClick(maintenance)}
                            >
                                <Card.Body>
                                    <Card.Title>{maintenance.maintenanceName}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {DateUtils.formatDate(maintenance.maintenanceDate)}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <div>
                                            <strong>Location:</strong> {locationNames[maintenance.locationId]}
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
                        ))
                    ) : (
                        <Alert className="mt-3" variant="info">No maintenances available.</Alert>
                    )}
                </>
            ) : (
                <>
                    <Row className="row-margin-0 fw-bold">
                        <Col md={3} onClick={() => handleSort('maintenanceDate')}>
                            Executed Date {renderSortArrow('maintenanceDate')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('maintenanceName')}>
                            Maintenance Name {renderSortArrow('maintenanceName')}
                        </Col>
                        <Col md={3} onClick={() => handleSort('locationId')}>
                            Location {renderSortArrow('locationId')}
                        </Col>
                        <Col md={1} onClick={() => handleSort('maintenanceStatus')}>
                            Status {renderSortArrow('maintenanceStatus')}
                        </Col>
                        <Col md={2} onClick={() => handleSort('lastDate')}>
                            Planned Date {renderSortArrow('lastDate')}
                        </Col>
                    </Row>
                    <hr />
                    {sortedItems.length > 0 ? (
                        sortedItems.map((maintenance, index) => {
                            const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                            return (
                                <Row
                                    key={maintenance.id}
                                    className="align-items-center"
                                    style={{ margin: '0 0', cursor: 'pointer' }}
                                    onClick={() => handleMaintenanceClick(maintenance)}
                                >
                                    <Col className="py-2" style={{ backgroundColor: rowBgColor }}>
                                        <Row className="align-items-center">
                                            <Col md={3} className="py-2">
                                                {DateUtils.formatDate(maintenance.lastDate)}
                                            </Col>
                                            <Col md={3} className="py-2">
                                                {maintenance.maintenanceName}
                                            </Col>
                                            <Col md={3} className="py-2">
                                                {locationNames[maintenance.locationId]}
                                            </Col>
                                            <Col md={1} className="py-2">
                                                {maintenance.maintenanceStatus}
                                            </Col>
                                            <Col md={2} className="py-2">
                                                {DateUtils.formatDate(maintenance.maintenanceDate)}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            );
                        })
                    ) : (
                        <Alert className="mt-3" variant="info">No maintenances available.</Alert>
                    )}
                </>
            )}

            {/* Add Maintenance Modal */}
            <AddMaintenanceModal
                show={showAddMaintenanceModal}
                onHide={() => setShowAddMaintenanceModal(false)}
                selectedClientId={clientId}
                setRefresh={setRefresh}
                workers={baitWorkers}
                clients={[client]}
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
                    isMobile={isMobile}
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
