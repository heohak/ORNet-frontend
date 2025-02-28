import React, { useEffect, useState } from 'react';
import { Button, Alert, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faHistory } from '@fortawesome/free-solid-svg-icons';
import EditClient from "./EditClient";
import config from "../../config/config";
import axiosInstance from "../../config/axiosInstance";
import { DateUtils } from "../../utils/DateUtils";
import { format } from 'date-fns';

function ClientDetails({ clientId, navigate, setRefresh, reFetchRoles, setRoles, isMobile }) {
    const [client, setClient] = useState(null);
    const [error, setError] = useState(null);
    const [showEditClient, setShowEditClient] = useState(false);
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState(null);
    const [lastTrainingDate, setLastTrainingDate] = useState(null);

    useEffect(() => {
        fetchClientData();
        fetchNextMaintenanceDate();
    }, [clientId]);

    const fetchNextMaintenanceDate = async () => {
        try {
            const response = await axiosInstance.get(`/maintenance/next/${clientId}`);
            setNextMaintenanceDate(response.data);
        } catch (error) {
            console.error("Error fetching next maintenance date", error);
        }
    };

    useEffect(() => {
        const fetchLastTrainingDate = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/training/last/${clientId}`);
                setLastTrainingDate(response.data);
            } catch (err) {
                console.error('Error fetching last training date:', err);
            }
        };
        if (clientId) {
            fetchLastTrainingDate();
        }
    }, [clientId]);

    const fetchClientData = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/${clientId}`);
            setClient(response.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleNavigate = () => {
        if (client && client.id) {
            navigate('/history', { state: { endpoint: `client/history/${client.id}` } });
        } else {
            setError('Client or client id is undefined');
        }
    };

    const renderTypes = () => {
        const types = [
            client.pathologyClient && "Pathology",
            client.editorClient && "Editor",
            client.surgeryClient && "Surgery",
            client.otherMedicalDevices && "Other Medical Devices"
        ].filter(Boolean);
        return types.join(", ");
    };

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <>
            {client ? (
                <>
                    {/* Header Row */}
                    <Row className="justify-content-between mb-2">
                        <Col xs={12} md="auto">
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#343a40' }}>
                                {client.fullName}/{client.shortName}
                            </div>
                        </Col>
                        <Col xs={12} md="auto" className="text-md-end mt-2 mt-md-0">
                            <Button
                                variant="link"
                                onClick={() => setShowEditClient(true)}
                                className="text-primary me-2"
                            >
                                <FontAwesomeIcon icon={faEdit} title="Edit Customer" />
                            </Button>
                            <Button variant="link" onClick={handleNavigate} className="text-primary">
                                <FontAwesomeIcon icon={faHistory} title="View history" />
                            </Button>
                        </Col>
                    </Row>

                    {isMobile ? (
                        // Mobile layout: Combine Maintenance and Training info in one row with two columns.
                        <Row className="mb-3">
                            <Col xs={6}>
                                <div className="mb-2">
                                    <div className="maintenance-box">
                                        <div className="maintenance-text">Maintenance</div>
                                    </div>
                                    <div className="maintenance-text">
                                        Next: {client.nextMaintenance ? DateUtils.formatDate(nextMaintenanceDate) : 'None'}
                                    </div>
                                </div>
                                <div>
                                    <div className="maintenance-box">
                                        <div className="maintenance-text">Training</div>
                                    </div>
                                    <div className="maintenance-text">
                                        Last: {lastTrainingDate ? DateUtils.formatDate(new Date(lastTrainingDate)) : 'None'}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={6} className="d-flex align-items-center justify-content-center">
                                <div className="maintenance-text">{renderTypes()}</div>
                            </Col>
                        </Row>
                    ) : (
                        // Desktop layout: Separate rows for Maintenance and Training.
                        <>
                            <Row className="justify-content-between mb-3">
                                <Col className="col-md-auto">
                                    <Row>
                                        <Col className="col-md-auto">
                                            <div className="maintenance-box">
                                                <div className="maintenance-text">Maintenance</div>
                                            </div>
                                        </Col>
                                        <Col className="col-md-auto">
                                            <Row className="maintenance-date-box">
                                                <Col className="col-md-auto">
                                                    <div className="maintenance-text">
                                                        Next: {client.nextMaintenance ? DateUtils.formatDate(nextMaintenanceDate) : 'None'}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="col-md-auto align-content-center">
                                    <div className="maintenance-text">{renderTypes()}</div>
                                </Col>
                            </Row>
                            <Row className="justify-content-between mb-3">
                                <Col className="col-md-auto">
                                    <Row>
                                        <Col className="col-md-auto">
                                            <div className="maintenance-box">
                                                <div className="maintenance-text">Training</div>
                                            </div>
                                        </Col>
                                        <Col className="col-md-auto">
                                            <Row className="maintenance-date-box">
                                                <Col className="col-md-auto">
                                                    <div className="maintenance-text">
                                                        Last: {lastTrainingDate ? DateUtils.formatDate(new Date(lastTrainingDate)) : 'None'}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <Alert variant="info">No client details available.</Alert>
            )}
            {showEditClient && (
                <EditClient
                    clientId={client.id}
                    onClose={() => setShowEditClient(false)}
                    onSave={(updatedClient) => {
                        setClient(updatedClient);
                        setShowEditClient(false);
                    }}
                    setRefresh={setRefresh}
                    reFetchRoles={reFetchRoles}
                    setRoles={setRoles}
                />
            )}
        </>
    );
}

export default ClientDetails;
