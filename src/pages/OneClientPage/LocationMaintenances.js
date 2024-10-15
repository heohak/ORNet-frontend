import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import MaintenanceModal from './MaintenanceModal';
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../css/Customers.css';

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
            const response = await axios.get(`${config.API_BASE_URL}/location/maintenances/${location.id}`);
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error fetching maintenances for location:', error);
        }
    };

    const handleMaintenanceCardClick = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setShowMaintenanceModal(true);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg">
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
                    <Row className="mt-3">
                        {maintenances.length > 0 ? (
                            maintenances.map((maintenance) => (
                                <Col md={4} key={maintenance.id} className="mb-4">
                                    <Card className="h-100 position-relative customer-page-card" onClick={() => handleMaintenanceCardClick(maintenance.id)}>
                                        <Card.Body className="all-page-cardBody">
                                            <Card.Title className='all-page-cardTitle'>{maintenance.maintenanceName}</Card.Title>
                                            <Card.Text className='all-page-cardText'>
                                                <strong>Date:</strong> {maintenance.maintenanceDate}<br />
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Alert className="mt-3" variant="info">No maintenances available for this location.</Alert>
                        )}
                    </Row>
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
            />
        </>
    );
}

export default LocationMaintenances;
