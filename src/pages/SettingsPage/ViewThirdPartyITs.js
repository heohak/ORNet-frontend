// src/components/ViewThirdPartyITs.js

import React, { useEffect, useState } from 'react';
import axiosInstance from "../../config/axiosInstance";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Spinner,
    Alert
} from 'react-bootstrap';
import config from '../../config/config';
import { FaPhone, FaEnvelope, FaEdit, FaArrowLeft } from 'react-icons/fa';
import EditThirdPartyITModal from "./EditThirdPartyITModal";
import AddThirdPartyITModal from "../OneClientPage/AddThirdPartyITModal";

function ViewThirdPartyITs() {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the Add Modal
    const [showAddModal, setShowAddModal] = useState(false);

    // State for the Edit Modal
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch Third-Party ITs on mount
    useEffect(() => {
        fetchThirdPartyITs();
    }, []);

    // GET existing third-party ITs
    const fetchThirdPartyITs = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/third-party/all`);
            setThirdPartyITs(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Called after successfully adding a new third-party IT in `AddThirdPartyITModal`.
    const handleNewThirdPartyIT = () => {
        setShowAddModal(false);
        // Re-fetch the updated list
        fetchThirdPartyITs();
    };

    const handleEdit = (thirdParty) => {
        setSelectedThirdParty(thirdParty);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedThirdParty(null);
        setShowEditModal(false);
    };

    // Called by EditThirdPartyITModal after a successful update or delete
    const handleUpdateThirdPartyList = () => {
        fetchThirdPartyITs();
    };

    return (
        <Container className="mt-4">
            {/* Back Button */}
            <Button
                variant="link"
                onClick={() => window.history.back()}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }}
            >
                <FaArrowLeft title="Go back" />
            </Button>

            {/* Heading & "Add" Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Third Party ITs</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Third Party IT
                </Button>
            </div>

            {/* Loading & Error State */}
            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Container className="mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                </Container>
            ) : (
                <Row>
                    {/* Display Third-Party ITs */}
                    {thirdPartyITs.map((thirdParty) => (
                        <Col md={4} key={thirdParty.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <Card.Title>{thirdParty.name}</Card.Title>
                                        <Button
                                            variant="link"
                                            className="p-0"
                                            onClick={() => handleEdit(thirdParty)}
                                        >
                                            <FaEdit />
                                        </Button>
                                    </div>
                                    <Card.Text>
                                        <FaEnvelope /> {thirdParty.email}
                                        <br />
                                        <FaPhone /> {thirdParty.phone}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* "Add Third-Party IT" Modal */}
            <AddThirdPartyITModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT} // Called after adding a new third-party
            />

            {/* "Edit Third-Party IT" Modal */}
            {selectedThirdParty && (
                <EditThirdPartyITModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    thirdParty={selectedThirdParty}
                    onUpdate={handleUpdateThirdPartyList}
                />
            )}
        </Container>
    );
}

export default ViewThirdPartyITs;
