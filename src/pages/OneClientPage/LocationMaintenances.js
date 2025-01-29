import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import MaintenanceModal from './MaintenanceModal';
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../css/Customers.css';
import '../../css/DarkenedModal.css';
import axiosInstance from "../../config/axiosInstance";
import {DateUtils} from "../../utils/DateUtils";

function LocationMaintenances({ show, handleClose, location, setRefresh }) {
    const [maintenances, setMaintenances] = useState([]);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);


    useEffect(() => {
        if (location && show) {
            fetchLocationMaintenances();
        }
    }, [location, show]);

    const fetchLocationMaintenances = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/maintenances/${location.id}`);
            const sortedMaintenances = response.data.sort((a, b) => new Date(b.maintenanceDate) - new Date(a.maintenanceDate));
            setMaintenances(sortedMaintenances);
        } catch (error) {
            console.error('Error fetching maintenances for location:', error);
        }
    };

    const handleMaintenanceClick = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setShowMaintenanceModal(true);
    };

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                size="lg"
                backdrop="static"
                dialogClassName={showAddMaintenanceModal ? 'dimmed' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Maintenances for {location.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="d-flex justify-content-between align-items-center">
                        <Col>
                            <h5>Maintenance List</h5>
                        </Col>
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                                Add Maintenance
                            </Button>
                        </Col>
                    </Row>

                    {/* Sortable Table Headers */}
                    <Row className="font-weight-bold text-center mt-3">
                        <Col md={6}>Maintenance Name</Col>
                        <Col md={6}>Date</Col>
                    </Row>
                    <hr />

                    {/* Maintenance List */}
                    {maintenances.length > 0 ? (
                        maintenances.map((maintenance, index) => {
                            const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                            return (
                                <Row
                                    key={maintenance.id}
                                    className="align-items-center text-center py-2"
                                    style={{ backgroundColor: rowBgColor, cursor: 'pointer' }}
                                    onClick={() => handleMaintenanceClick(maintenance.id)}
                                >
                                    <Col md={6}>{maintenance.maintenanceName}</Col>
                                    <Col md={6}>{DateUtils.formatDate(maintenance.maintenanceDate)}</Col>
                                </Row>
                            );
                        })
                    ) : (
                        <Alert className="mt-3" variant="info">No maintenances available for this location.</Alert>
                    )}

                </Modal.Body>
            </Modal>

            {/* Add Maintenance Modal */}
            <AddMaintenanceModal
                show={showAddMaintenanceModal}
                handleClose={() => setShowAddMaintenanceModal(false)}
                locationId={location.id}
                setRefresh={setRefresh}
                onAddMaintenance={() => {
                    fetchLocationMaintenances();
                    setShowAddMaintenanceModal(false);
                }}
            />

            {/* Maintenance Details Modal */}
            <MaintenanceModal
                show={showMaintenanceModal}
                handleClose={() => setShowMaintenanceModal(false)}
                maintenanceId={selectedMaintenanceId}
                locationName={location.name}
            />
        </>
    );
}

export default LocationMaintenances;
