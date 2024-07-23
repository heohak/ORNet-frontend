import React, { useState } from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

function ClientMaintenances({ maintenances, clientId, setRefresh }) {
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleAddMaintenance = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment
            });

            if (maintenanceResponse.data && maintenanceResponse.data.token) {
                const maintenanceId = maintenanceResponse.data.token;
                await axios.put(`${config.API_BASE_URL}/client/maintenance/${clientId}/${maintenanceId}`);

                if (files.length > 0) {
                    const formData = new FormData();
                    for (const file of files) {
                        formData.append('files', file);
                    }
                    await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }

                setRefresh(prev => !prev); // Trigger refresh by toggling state
                setShowAddMaintenanceModal(false); // Close the modal after adding the maintenance
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <h2 className="mt-4">Maintenances</h2>
            <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>Add Maintenance</Button>
            {maintenances.length > 0 ? (
                <ListGroup className="mt-3">
                    {maintenances.map((maintenance) => (
                        <ListGroup.Item key={maintenance.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{maintenance.maintenanceName}</Card.Title>
                                    <Card.Text>
                                        <strong>Date:</strong> {maintenance.maintenanceDate}<br />
                                        <strong>Comment:</strong> {maintenance.comment}<br />
                                    </Card.Text>
                                    {maintenance.files && maintenance.files.length > 0 && (
                                        <Card.Text>
                                            <strong>Files:</strong>
                                            <ul>
                                                {maintenance.files.map(file => (
                                                    <li key={file.id}>{file.fileName}</li>
                                                ))}
                                            </ul>
                                        </Card.Text>
                                    )}
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No maintenances available.</Alert>
            )}

            <Modal show={showAddMaintenanceModal} onHide={() => setShowAddMaintenanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Form onSubmit={handleAddMaintenance}>
                        <Form.Group className="mb-3">
                            <Form.Label>Maintenance Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={maintenanceName}
                                onChange={(e) => setMaintenanceName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Maintenance Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={maintenanceDate}
                                onChange={(e) => setMaintenanceDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Files</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit">
                            Add Maintenance
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddMaintenanceModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientMaintenances;
