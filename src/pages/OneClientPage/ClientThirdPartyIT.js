import React, { useEffect, useState } from 'react';
import { Card, Alert, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaEdit, FaEnvelope, FaPhone } from 'react-icons/fa';
import config from "../../config/config";
import AddThirdPartyIT from "./AddThirdPartyIT";
import EditThirdPartyITModal from "../SettingsPage/EditThirdPartyITModal";
import '../../css/Customers.css';

function ClientThirdPartyIT({ clientId, refresh, setRefresh }) {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // State for Edit Modal
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/third-parties/${clientId}`);
                setThirdPartyITs(response.data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThirdPartyITs();
    }, [clientId, refresh]);

    const handleEdit = (thirdParty) => {
        setSelectedThirdParty(thirdParty);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedThirdParty(null);
        setShowEditModal(false);
    };

    const handleUpdateThirdPartyList = () => {
        // Trigger a refresh to update the list
        setRefresh((prev) => !prev);
    };

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
        <>
            <Row className="d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>Third-Party ITs</h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Third-Party IT
                    </Button>
                </Col>
            </Row>

            {thirdPartyITs.length > 0 ? (
                <Row className="mt-1">
                    {thirdPartyITs.map((thirdParty) => (
                        <Col md={3} key={thirdParty.id} className="mb-4">
                            <Card className="h-100 position-relative customer-page-card">
                                <Card.Body className="all-page-cardBody">
                                    <div className="position-absolute top-0 end-0 m-2">
                                        <Button
                                            variant="link"
                                            className="p-0"
                                            onClick={() => handleEdit(thirdParty)}
                                        >
                                            <FaEdit title="Edit Third Party IT" />
                                        </Button>
                                    </div>
                                    <Card.Title className="all-page-cardTitle">{thirdParty.name}</Card.Title>
                                    <Card.Text className="all-page-cardText">
                                        <FaPhone className="me-2" />{thirdParty.phone}<br />
                                        <FaEnvelope className="me-2" />{thirdParty.email}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert className="mt-3" variant="info">No third-party ITs available.</Alert>
            )}

            {/* Add Third Party IT Modal */}
            <AddThirdPartyIT
                clientId={clientId}
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                setRefresh={setRefresh}
                clientThirdParties={thirdPartyITs}
            />

            {/* Edit Third Party IT Modal */}
            {selectedThirdParty && (
                <EditThirdPartyITModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    thirdParty={selectedThirdParty}
                    clientId={clientId}
                    onUpdate={handleUpdateThirdPartyList}
                />
            )}
        </>
    );
}

export default ClientThirdPartyIT;
