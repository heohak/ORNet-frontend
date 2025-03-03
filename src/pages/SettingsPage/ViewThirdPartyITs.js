import React, { useEffect, useState } from 'react';
import {Container, Row, Col, Button, Spinner, Alert, Card} from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from '../../config/config';

// Icons
import { FaArrowLeft } from 'react-icons/fa';

// Subcomponents
import AddThirdPartyITModal from "../OneClientPage/AddThirdPartyITModal";
import ViewThirdPartyITModal from "../OneClientPage/ViewThirdPartyITModal";


// Custom hook to get current window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

function ViewThirdPartyITs() {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // "Add Third-Party IT" modal
    const [showAddModal, setShowAddModal] = useState(false);

    // "View Third-Party" modal
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // for responsive layout

    // 1. Fetch Third-Party IT list on mount
    useEffect(() => {
        fetchThirdPartyITs();
    }, []);

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

    // 2. Refresh list after adding new ThirdPartyIT
    const handleNewThirdPartyIT = () => {
        setShowAddModal(false);
        fetchThirdPartyITs();
    };

    // 3. If row is clicked, open "view" modal
    const handleRowClick = (tp) => {
        setSelectedThirdParty(tp);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setSelectedThirdParty(null);
        setShowViewModal(false);
    };

    // 4. After updating (or removing) a third-party in the "view" modal, refresh
    const handleUpdateList = () => {
        fetchThirdPartyITs();
    };

    // 5. Render
    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }
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

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Third-Party ITs</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Third Party IT
                </Button>
            </div>

            {/* Optional: Sortable Table Headers
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
      */}

            {/* We can skip sorting code here and just show in a row-based list */}
            {thirdPartyITs.length === 0 ? (
                <Alert variant="info">No Third-Party ITs found.</Alert>
            ) : (
                isMobile ? (
                    // Mobile view: Render each third-party IT as a Card
                    thirdPartyITs.map((thirdParty) => (
                        <Card
                            key={thirdParty.id}
                            className="mb-3"
                            onClick={() => handleRowClick(thirdParty)}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <Card.Body>
                                <Card.Title>{thirdParty.name}</Card.Title>
                                <Card.Text>
                                    <div>
                                        <strong>Phone:</strong> {thirdParty.phone || "N/A"}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {thirdParty.email || "N/A"}
                                    </div>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                <>
                    {/* Table-like headers (non-clickable) */}
                    <Row className="fw-bold row-margin-0">
                        <Col md={4}>Name</Col>
                        <Col md={4}>Phone</Col>
                        <Col md={4}>Email</Col>
                    </Row>
                    <hr />

                    {thirdPartyITs.map((tp, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={tp.id}
                                className="align-items-center"
                                style={{ margin: '0 0', cursor: 'pointer', backgroundColor: rowBgColor }}
                                onClick={() => handleRowClick(tp)}
                            >
                                <Col className="py-2">
                                    <Row className="align-items-center">
                                        <Col md={4}>{tp.name}</Col>
                                        <Col md={4}>{tp.phone || "N/A"}</Col>
                                        <Col md={4}>{tp.email || "N/A"}</Col>
                                    </Row>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            ))}

            {/* Add ThirdPartyIT Modal */}
            <AddThirdPartyITModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />

            {/* View ThirdPartyIT Modal */}
            {selectedThirdParty && (
                <ViewThirdPartyITModal
                    show={showViewModal}
                    onHide={handleCloseViewModal}
                    thirdParty={selectedThirdParty}
                    onUpdate={handleUpdateList}
                />
            )}
        </Container>
    );
}

export default ViewThirdPartyITs;
