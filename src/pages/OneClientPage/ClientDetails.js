import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCheck, faEdit, faHistory } from '@fortawesome/free-solid-svg-icons';
import EditClient from "./EditClient";
import axios from "axios";
import config from "../../config/config";
import axiosInstance from "../../config/axiosInstance";
import {DateUtils} from "../../utils/DateUtils";

// Define the default visibility of each field


function ClientDetails({ clientId, navigate, setRefresh, reFetchRoles, setRoles }) {
    const [client, setClient] = useState(null);
    const [error, setError] = useState(null);
    const [showEditClient, setShowEditClient] = useState(false);

    useEffect(() => {
        fetchClientData();
    }, [clientId]);

    const fetchClientData = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/client/${clientId}`);
            setClient(response.data);
        } catch (error) {
            setError(error.message);
        }
    };


    // Estonia date formatter
    const estoniaDateFormat = new Intl.DateTimeFormat('et-EE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });


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
        ].filter(Boolean); // Filter out any false or undefined values

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
                    <Row className="justify-content-between mb-2">
                        <Col className="col-md-auto">
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#343a40' }}>
                                {client.fullName}/{client.shortName}
                            </div>
                        </Col>
                        <Col className="col-md-auto">
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
                                            <div>
                                                <div className="maintenance-text">
                                                    Next: {client.nextMaintenance ? DateUtils.formatDate(client.nextMaintenance) : 'N/A'}
                                                </div>
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
