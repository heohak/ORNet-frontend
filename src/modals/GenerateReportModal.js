// src/components/GenerateReportModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import config from '../config/config';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/OneClientPage/AddActivityModal.css';
import {format} from "date-fns";
import axiosInstance from "../config/axiosInstance";

function GenerateReportModal({ show, handleClose }) {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [includeAllClients, setIncludeAllClients] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('tickets');

    useEffect(() => {
        // Fetch list of clients when the modal opens
        if (show) {
            clearFields();
            fetchClients();
        }
    }, [show]);

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/all`);
            setClients(response.data);
        } catch (error) {
            setError('Error fetching clients.');
        }
    };

    const clearFields = () => {
        setSelectedClientId('');
        setIncludeAllClients(false);
        setStartDate(null);
        setEndDate(null);
        setFileName('');
        setError(null);
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        setError(null);
        try {
            let response;

            // Format dates to 'yyyy-MM-dd' or the format expected by your API
            const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : null;
            const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;

            if (includeAllClients) {
                // Determine which report to generate for all clients based on report type
                const reportEndpoint = reportType === 'tickets'
                    ? `${config.API_BASE_URL}/report/all-clients-tickets`
                    : `${config.API_BASE_URL}/report/all-clients-maintenances`;

                response = await axiosInstance.get(reportEndpoint, {
                    params: {
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        fileName: fileName || 'report'
                    },
                    responseType: 'blob',
                });
            } else {
                // Determine which report endpoint to use based on the selected report type
                const reportEndpoint = reportType === 'tickets'
                    ? `${config.API_BASE_URL}/report/client-tickets`
                    : `${config.API_BASE_URL}/report/client-maintenances`;

                // Generate report for selected client
                response = await axiosInstance.get(reportEndpoint, {
                    params: {
                        clientId: selectedClientId,
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        fileName: fileName || 'report'
                    },
                    responseType: 'blob', // Handle file download
                });
            }

            // Trigger file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName || 'report'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            handleClose();
        } catch (error) {
            console.error('Error generating report:', error);

            if (error.response) {
                const { status, data } = error.response;

                switch (status) {
                    case 400:
                        setError(data.message || 'Invalid input data. Please check your inputs.');
                        break;
                    case 401:
                        setError('You are not authorized to generate this report. Please log in.');
                        break;
                    case 403:
                        setError('You do not have permission to generate this report.');
                        break;
                    case 404:
                        setError('The report service is unavailable. Please try again later.');
                        break;
                    case 500:
                        setError('An internal server error occurred. Please try again later.');
                        break;
                    default:
                        setError(data.message || 'An error occurred while generating the report.');
                }
            } else if (error.request) {
                setError('No response from the server. Please check your network connection.');
            } else {
                setError('An error occurred while setting up the report request.');
            }
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
                <Modal.Title>Generate Customer Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleGenerateReport}>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Include all customers"
                            checked={includeAllClients}
                            onChange={(e) => setIncludeAllClients(e.target.checked)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Report Type</Form.Label>
                        <Form.Select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            required
                        >
                            <option value="tickets">Tickets Report</option>
                            <option value="maintenances">Maintenances Report</option>
                        </Form.Select>
                    </Form.Group>

                    {!includeAllClients && (
                        <Form.Group className="mb-3">
                            <Form.Label>Select Customer</Form.Label>
                            <Form.Select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                required
                            >
                                <option value="">Select a customer</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.shortName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <ReactDatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control dark-placeholder"
                            placeholderText="Select a start date"
                            isClearable
                            required
                            maxDate={new Date()}
                        />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <ReactDatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control dark-placeholder"
                            placeholderText="Select an end date"
                            isClearable
                            required
                            maxDate={new Date()}
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

                    <Modal.Footer>
                        <Button
                            variant="outline-info"
                            onClick={handleModalClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default GenerateReportModal;
