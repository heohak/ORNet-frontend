import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert, Button, Modal, Form } from 'react-bootstrap';
import AddClientDevice from './AddClientDevice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config/config"; // Import axios for making HTTP requests

function ClientDevices({ devices, client, clientId, setRefresh }) {
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [classificators, setClassificators] = useState([]);
    const [selectedClassificatorId, setSelectedClassificatorId] = useState('');
    const [filteredDevices, setFilteredDevices] = useState(devices);

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassificators();
    }, []);

    useEffect(() => {
        filterDevices();
    }, [selectedClassificatorId]);

    const fetchClassificators = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`);
            setClassificators(response.data);
        } catch (error) {
            console.error('Error fetching classificators:', error);
        }
    };

    const filterDevices = async () => {
        if (selectedClassificatorId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/filter/${clientId}/${selectedClassificatorId}`);
                setFilteredDevices(response.data);
            } catch (error) {
                console.error('Error filtering devices:', error);
            }
        } else {
            setFilteredDevices(devices);
        }
    };

    return (
        <>
            <h2 className="mb-4">
                {'Devices'}
            </h2>
            <Button variant="primary" onClick={() => setShowAddDeviceModal(true)}>Add Device</Button>
            <Form.Group controlId="classificatorFilter" className="mt-3">
                <Form.Label>Filter by Classificator</Form.Label>
                <Form.Control as="select" value={selectedClassificatorId} onChange={(e) => setSelectedClassificatorId(e.target.value)}>
                    <option value="">All Classificators</option>
                    {classificators.map((classificator) => (
                        <option key={classificator.id} value={classificator.id}>{classificator.name}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            {filteredDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {filteredDevices.map((device) => (
                        <ListGroup.Item key={device.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title style={{ cursor: "pointer", color: "#0000EE" }} onClick={() => navigate(`/device/${device.id}`)}>{device.deviceName}</Card.Title>
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
