import React, { useState } from 'react';
import { Card, ListGroup, Alert, Button, Modal } from 'react-bootstrap';
import AddClientDevice from '../../components/AddClientDevice';
import {useNavigate} from "react-router-dom";

function ClientDevices({ devices,client, clientId, setRefresh }) {
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <h2 className="mb-4">
                {client ? `${client.shortName} Devices` : 'Client Devices'}
            </h2>
            <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>Add Device</Button>
            {devices.length > 0 ? (
                <ListGroup className="mt-3">
                    {devices.map((device) => (
                        <ListGroup.Item key={device.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title style={{cursor: "pointer", color: "#0000EE"}} onClick={() => navigate(`/device/${device.id}`)}>{device.deviceName}</Card.Title>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No devices available.</Alert>
            )}

            <Modal show={showAddDeviceModal} onHide={() => setShowAddDeviceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Device to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddClientDevice clientId={clientId} onClose={() => setShowAddDeviceModal(false)} setRefresh={setRefresh} /> {/* Pass clientId and setRefresh as props */}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientDevices;
