import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";
import { FaEdit } from 'react-icons/fa';

import AddThirdPartyIT from "./AddThirdPartyIT";
import EditThirdPartyITModal from "../SettingsPage/EditThirdPartyITModal";
import ViewThirdPartyITModal from "./ViewThirdPartyITModal";

function ClientThirdPartyIT({ clientId, refresh, setRefresh }) {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // For editing
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // For viewing details
    const [selectedForView, setSelectedForView] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Sorting config
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // Fetch Third-Party ITs for this client
    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/client/third-parties/${clientId}`);
                setThirdPartyITs(response.data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchThirdPartyITs();
    }, [clientId, refresh]);

    // Sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const sortedThirdParties = [...thirdPartyITs].sort((a, b) => {
        const valueA = a[sortConfig.key] ?? '';
        const valueB = b[sortConfig.key] ?? '';
        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    // Edit
    const handleEdit = (thirdParty) => {
        setSelectedThirdParty(thirdParty);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setSelectedThirdParty(null);
        setShowEditModal(false);
    };

    // Refresh after update
    const handleUpdateThirdPartyList = () => {
        setRefresh(prev => !prev);
    };

    // View
    const handleRowClick = (thirdParty) => {
        setSelectedForView(thirdParty);
        setShowViewModal(true);
    };
    const handleCloseViewModal = () => {
        setSelectedForView(null);
        setShowViewModal(false);
    };

    if (loading) return <div>Loading...</div>;
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
                    <h2 className="mb-0" style={{ paddingBottom: "20px" }}>
                        Third-Party ITs
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Third-Party IT
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row className="row-margin-0 fw-bold">
                <Col md={4} onClick={() => handleSort('name')}>
                    Name {renderSortArrow('name')}
                </Col>
                <Col md={4} onClick={() => handleSort('phone')}>
                    Phone {renderSortArrow('phone')}
                </Col>
                <Col md={4} onClick={() => handleSort('email')}>
                    Email {renderSortArrow('email')}
                </Col>
            </Row>
            <hr />

            {sortedThirdParties.length > 0 ? (
                sortedThirdParties.map((thirdParty, index) => {
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    return (
                        <Row
                            key={thirdParty.id}
                            className="align-items-center"
                            style={{ margin: '0 0', cursor: 'pointer', backgroundColor: rowBgColor }}
                            onClick={() => handleRowClick(thirdParty)}
                        >
                            <Col className="py-2">
                                <Row className="align-items-center">
                                    <Col md={4}>{thirdParty.name}</Col>
                                    <Col md={4}>{thirdParty.phone || "N/A"}</Col>
                                    <Col md={4}>{thirdParty.email || "N/A"}</Col>
                                    <Col md={2}>
                                        <Button
                                            variant="link"
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent opening the View modal
                                                handleEdit(thirdParty);
                                            }}
                                        >
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">
                    No third-party ITs available.
                </Alert>
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

            {/* View Third-Party IT Modal */}
            {selectedForView && (
                <ViewThirdPartyITModal
                    show={showViewModal}
                    onHide={handleCloseViewModal}
                    thirdParty={selectedForView}
                    onUpdate={handleUpdateThirdPartyList}
                    clientId={clientId}
                />
            )}
        </>
    );
}

export default ClientThirdPartyIT;
