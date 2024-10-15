import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

function AddMaintenanceModal({ show, handleClose, clientId, locationId, setRefresh, onAddMaintenance }) {
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [addError, setAddError] = useState(null);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleAddMaintenance = async (e) => {
        e.preventDefault();
        setAddError(null);

        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment
            });

            if (maintenanceResponse.data && maintenanceResponse.data.token) {
                const maintenanceId = maintenanceResponse.data.token;

                if (clientId) {
                    await axios.put(`${config.API_BASE_URL}/client/maintenance/${clientId}/${maintenanceId}`);
                } else if (locationId) {
                    // Use the endpoint to add maintenance to a location
                    await axios.put(`${config.API_BASE_URL}/location/maintenance/${locationId}`, {
                        maintenanceId,
                        maintenanceName,
                        maintenanceDate,
                        comment
                    });
                }

                if (files.length > 0) {
                    await uploadFiles(maintenanceId);
                }

                setMaintenanceName('');
                setMaintenanceDate('');
                setComment('');
                setFiles([]);

                setRefresh(prev => !prev); // Trigger refresh
                if (onAddMaintenance) {
                    onAddMaintenance();
                }
                handleClose(); // Close modal
            }
        } catch (error) {
            setAddError(error.message);
        }
    };

    const uploadFiles = async (maintenanceId) => {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        try {
            await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            setAddError('Error uploading files.');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Maintenance</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {addError && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{addError}</p>
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
        </Modal>
    );
}

export default AddMaintenanceModal;
