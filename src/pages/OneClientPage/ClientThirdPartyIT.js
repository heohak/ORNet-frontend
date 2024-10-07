import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Alert, Button, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../../config/config";
import AddThirdPartyIT from "./AddThirdPartyIT";
import '../../css/Customers.css';

function ClientThirdPartyIT({ clientId, client }) {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/third-parties/${clientId}`);
                setThirdPartyITs(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThirdPartyITs();
    }, [clientId, refresh]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div className="mt-4">
            <Row className="d-flex justify-content-between align-items-center">
                <Col>
                    <h2 className="mt-1">Third-Party ITs</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Third-Party IT
                    </Button>
                </Col>
            </Row>

            {thirdPartyITs.length > 0 ? (
                <Row className="mt-3">
                    {thirdPartyITs.map((thirdParty) => (
                        <Col md={3} key={thirdParty.id} className="mb-4"> {/* Adjust column size as needed */}
                            <Card className="h-100 position-relative customer-page-card">
                                <Card.Body className="all-page-cardBody">
                                    <div className="mb-4">
                                        <Card.Title className='all-page-cardTitle'>{thirdParty.name}</Card.Title>
                                        <Card.Text className='all-page-cardText'>
                                            <strong>Email:</strong> {thirdParty.email}<br />
                                            <strong>Phone:</strong> {thirdParty.phone}
                                        </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-end"> {/* Align buttons to the right */}
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate(`/settings/third-party-its/edit/${thirdParty.id}`, { state: { thirdParty, clientId } })}
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert className="mt-3" variant="info">No third-party ITs available.</Alert>
            )}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Third-Party IT to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddThirdPartyIT clientId={clientId} onClose={() => setShowAddModal(false)} setRefresh={setRefresh} />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ClientThirdPartyIT;
