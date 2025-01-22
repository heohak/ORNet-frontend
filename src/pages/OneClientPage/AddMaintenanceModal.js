// AddMaintenanceModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/OneClientPage/AddActivityModal.css'; // Adjust the path as needed
import { format } from 'date-fns';
import axiosInstance from "../../config/axiosInstance";

function AddMaintenanceModal({ show, handleClose, clientId, locationId, deviceId, setRefresh, onAddMaintenance }) {
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState(null);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [addError, setAddError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleAddMaintenance = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setAddError(null);

        try {
            let maintenanceId;

            const formattedMaintenanceDate = maintenanceDate ? format(maintenanceDate, 'yyyy-MM-dd') : null;

            if (clientId) {
                // For clients, create maintenance and associate it separately
                const maintenanceResponse = await axiosInstance.post(`${config.API_BASE_URL}/maintenance/add`, {
                    maintenanceName,
                    maintenanceDate: formattedMaintenanceDate,
                    comment
                });

                if (maintenanceResponse.data && maintenanceResponse.data.token) {
                    maintenanceId = maintenanceResponse.data.token;
                    await axiosInstance.put(`${config.API_BASE_URL}/client/maintenance/${clientId}/${maintenanceId}`);
                } else {
                    throw new Error('Failed to create maintenance for client');
                }
            } else if (locationId) {
                // For locations, use the endpoint that creates and associates maintenance
                const response = await axiosInstance.put(`${config.API_BASE_URL}/location/maintenance/${locationId}`, {
                    maintenanceName,
                    maintenanceDate,
                    comment
                });

                if (response.data && response.data.token) {
                    maintenanceId = response.data.token;
                } else {
                    throw new Error('Failed to create maintenance for location');
                }
            } else if (deviceId) {
                // For devices, create maintenance and associate it
                const maintenanceResponse = await axiosInstance.post(`${config.API_BASE_URL}/maintenance/add`, {
                    maintenanceName,
                    maintenanceDate,
                    comment
                });

                if (maintenanceResponse.data && maintenanceResponse.data.token) {
                    maintenanceId = maintenanceResponse.data.token;
                    await axiosInstance.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`);
                } else {
                    throw new Error('Failed to create maintenance for device');
                }
            }

            // Upload files using the obtained maintenanceId
            if (files.length > 0 && maintenanceId) {
                await uploadFiles(maintenanceId);
            }

            // Reset form fields
            setMaintenanceName('');
            setMaintenanceDate('');
            setComment('');
            setFiles([]);

            // Refresh data and close modal
            if (setRefresh) setRefresh(prev => !prev);
            if (onAddMaintenance) onAddMaintenance();
            handleClose();
        } catch (error) {
            setAddError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadFiles = async (maintenanceId) => {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
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
                <Modal.Title>Add New Maintenance</Modal.Title>
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
                            placeholder="Enter Maintenance Name"
                            value={maintenanceName}
                            onChange={(e) => setMaintenanceName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Maintenance Date</Form.Label>
                        <ReactDatePicker
                            selected={maintenanceDate}
                            onChange={(date) => setMaintenanceDate(date)}
                            dateFormat="dd.MM.yyyy"
                            className="form-control dark-placeholder"
                            placeholderText="Select a date"
                            isClearable
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Enter Comment"
                            rows={4}
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
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={handleClose}>
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Maintenance'}
                        </Button>
                    </Modal.Footer>

                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AddMaintenanceModal;
