// src/components/DeviceStatusManager.js

import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import ReactDatePicker from "react-datepicker";
import axiosInstance from "../../config/axiosInstance";

function DeviceStatusManager({ deviceId, introducedDate, writtenOffDate, setRefresh }) {
    // States for handling written-off status
    const [showWrittenOffModal, setShowWrittenOffModal] = useState(false);
    const [currentWrittenOffDate, setCurrentWrittenOffDate] = useState(writtenOffDate || '');
    const [isWrittenOff, setIsWrittenOff] = useState(!!writtenOffDate);
    const [writtenOffComment, setWrittenOffComment] = useState('');
    const [showReactivateModal, setShowReactivateModal] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [dateError, setDateError] = useState(null);
    const [error, setError] = useState(null);

    // Function to handle adding a written-off date
    const handleAddWrittenOffDate = async (e) => {
        e.preventDefault();
        if (new Date(currentWrittenOffDate) < new Date(introducedDate)) {
            setDateError('Written Off Date cannot be before the Introduced Date.');
            return;
        }
        const formattedDate = new Date(currentWrittenOffDate).toISOString().split("T")[0];

        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/device/written-off/${deviceId}`,
                writtenOffComment, // Sending the writtenOffComment in the request body
                {
                    params:
                        { writtenOffDate: formattedDate },
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    }
                }
            );
            setIsWrittenOff(true); // Mark the device as written off
            setRefresh(prev => !prev); // Refresh data
            setShowWrittenOffModal(false); // Close modal
            setDateError(null);
        } catch (err) {
            console.error('Error updating written off date:', err);
            setDateError('Failed to update written off date.');
        }
    };

    // Function to handle reactivating a device
    const handleReactivateDevice = async () => {
        try {
            await axiosInstance.put(
                `${config.API_BASE_URL}/device/reactivate/${deviceId}`,
                writtenOffComment,
                {
                    headers: {
                        "Content-Type": "text/plain", // Important to specify the correct content type
                    }
                }
            );
            setCurrentWrittenOffDate(''); // Clear the written off date
            setIsWrittenOff(false); // Update the status
            setRefresh(prev => !prev); // Refresh the data
            setShowReactivateModal(false);
        } catch (err) {
            console.error('Error reactivating the device:', err);
            setError('Failed to reactivate the device.');
        }
    };

    return (
        <>
            {isWrittenOff ? (
                <Button
                    variant="success ms-2"
                    onClick={() => {
                        setWrittenOffComment('');
                        setShowReactivateModal(true);
                    }}
                >
                    Reactivate
                </Button>
            ) : (
                <Button
                    variant="warning"
                    onClick={() => {
                        setCurrentWrittenOffDate('');
                        setWrittenOffComment('');
                        setShowWrittenOffModal(true);
                    }}
                >
                    Write Off
                </Button>
            )}

            {/* Error Alerts */}
            {dateError && (
                <Alert
                    variant="danger"
                    className="mt-3"
                    onClose={() => setDateError(null)}
                    dismissible
                >
                    {dateError}
                </Alert>
            )}

            {error && (
                <Alert
                    variant="danger"
                    className="mt-3"
                    onClose={() => setError(null)}
                    dismissible
                >
                    {error}
                </Alert>
            )}

            {/* Written Off Modal */}
            <Modal
                show={showWrittenOffModal}
                onHide={() => setShowWrittenOffModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Written Off Date</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddWrittenOffDate}>
                    <Modal.Body>
                        <Form.Group controlId="writtenOffDate">
                            <Form.Label>Written Off Date</Form.Label>
                            <ReactDatePicker
                                selected={currentWrittenOffDate}
                                onChange={(date) => setCurrentWrittenOffDate(date)}
                                dateFormat="dd.MM.yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select a date"
                                isClearable={currentWrittenOffDate !== ''}
                                required
                                minDate={introducedDate}
                            />
                        </Form.Group>

                        <Form.Group controlId="writtenOffComment" className="mt-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={writtenOffComment}
                                onChange={(e) => setWrittenOffComment(e.target.value)}
                                placeholder="Enter reason for writing off the device"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-info"
                            onClick={() => setShowWrittenOffModal(false)}
                        >
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Reactivate Modal */}
            <Modal
                show={showReactivateModal}
                onHide={() => setShowReactivateModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reactivate Device</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body>
                        <Form.Group controlId="reactivateComment">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={writtenOffComment}
                                onChange={(e) => setWrittenOffComment(e.target.value)}
                                placeholder="Enter reason for reactivating the device"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-info"
                            onClick={() => setShowReactivateModal(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleReactivateDevice}
                        >
                            Reactivate
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default DeviceStatusManager;
