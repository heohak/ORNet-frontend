import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import axiosInstance from "../../config/axiosInstance";

function SummaryModal({ show, handleClose, devices }) {
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            fetchSummary();
        }
    }, [show]);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const deviceIds = devices.map(device => device.id);

            const response = await axiosInstance.get(`${config.API_BASE_URL}/device/summary`, {
                params: {
                    deviceIds: deviceIds.join(',')
                }
            });
            setSummary(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal backdrop="static" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Device Summary</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                ) : error ? (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                ) : (
                    <ListGroup>
                        {Object.entries(summary).map(([key, value]) => (
                            <ListGroup.Item key={key}>
                                {key}: {value}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SummaryModal;
