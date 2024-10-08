// src/components/GenerateReportModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import config from '../config/config';

function GenerateReportModal({ show, handleClose }) {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch list of clients when the modal opens
        if (show) {
            fetchClients();
        }
    }, [show]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/all`);
            setClients(response.data);
        } catch (error) {
            setError('Error fetching clients.');
        }
    };
    const clearFields = () => {
        setSelectedClientId('');
        setStartDate('');
        setEndDate('');
        setFileName('');
        setError(null);
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/report/client-tickets`, {
                params: {
                    clientId: selectedClientId,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    fileName: fileName || 'report'
                },
                responseType: 'blob', // to handle file download
            });

            // Trigger file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName || 'report'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            handleClose(); // Close modal on successful report generation
        } catch (error) {
            setError('Error generating report.');
        } finally {
            setLoading(false);
        }
    };
    const handleModalClose = () => {
        clearFields(); // Clear fields on modal close
        handleClose();  // Trigger parent close handler
    };

    return (
        <Modal show={show} onHide={handleModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Generate Client Tickets Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Client</Form.Label>
                        <Form.Select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            required
                        >
                            <option value="">Select a client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.shortName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>File Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter file name"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleGenerateReport} disabled={loading || !selectedClientId}>
                    {loading ? 'Generating...' : 'Generate Report'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GenerateReportModal;
