import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Form, Row, Col, Accordion, Alert } from 'react-bootstrap';
import MaintenanceModal from "./MaintenanceModal";
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../css/Customers.css';

function ClientMaintenances({ maintenances, clientId, setRefresh, client }) {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);


    const handleMaintenanceCardClick = (maintenanceId) => {
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
                    <Button variant="success" onClick={() => setShowAddMaintenanceModal(true)}>
                        Add Maintenance
                    </Button>
                </Col>
            </Row>
            <Row className="mt-1">
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
                    <Alert className="mt-3" variant="info">No maintenances available.</Alert>
                )}
            </Row>
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
