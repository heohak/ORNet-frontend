import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Form } from 'react-bootstrap';
import config from "../../config/config";
import AddWikiModal from "./AddWikiModal";
//import "../../css/Wiki.css";
import WikiDetails from "./WikiDetails";
import { FaEdit } from 'react-icons/fa';
import EditWikiModal from "./EditWikiModal";
import axiosInstance from "../../config/axiosInstance";

function Wiki() {
    const [wikis, setWikis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [selectedWiki, setSelectedWiki] = useState(null);

    useEffect(() => {
        fetchWikis();
    }, []);

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchWikis();
        }, 300);
        setTypingTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const fetchWikis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/wiki/search`, {
                params: { q: searchQuery },
            });
            const sortedWikis = response.data.sort((a, b) => a.problem.localeCompare(b.problem));
            setWikis(sortedWikis);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const openDetailsModal = (wiki) => {
        setSelectedWiki(wiki);
        setShowDetailsModal(true);
    };

    const handleEditClick = (wiki, e) => {
        e.stopPropagation(); // Prevent row click from triggering details modal
        setSelectedWiki(wiki);
        setShowEditModal(true);
    };


    return (
        <Container className="mt-5 wiki-container">
            <Row className="d-flex justify-content-between mb-4">
                <Col className="col-md-auto">
                    <h1 className="mb-0">Wiki</h1>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Wiki</Button>
                </Col>
            </Row>

            <Row className="d-flex justify-content-between mb-4">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="Search wiki..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>

            </Row>

            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            {loading ? (
                <Row className="justify-content-center mt-4">
                    <Col md={2} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            ) : (
                <>
                    {/* Table header */}
                    <Row className="row-margin-0 fw-bold mt-2">
                        <Col xs={8} md={8}>Title</Col>
                        <Col xs={4} md={1} className="text-center">Actions</Col>
                    </Row>
                    <hr />

                    {/* Wiki Rows */}
                    {wikis.map((wiki, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={wiki.id}
                                className="align-items-center"
                                style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                                onClick={() => openDetailsModal(wiki)}
                            >
                                <Col xs={8} md={8} className="py-2">
                                    {wiki.problem}
                                </Col>
                                <Col xs={4} md={1} className="d-flex align-items-center justify-content-center py-2">
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        style={{ textDecoration: 'none' }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevents row click event
                                            handleEditClick(wiki, e);
                                        }}
                                    >
                                        <FaEdit />
                                    </Button>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}

            {/* Add Wiki Modal */}
            <AddWikiModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                reFetch={fetchWikis}
            />

            {/* Wiki Details Modal */}
            {selectedWiki &&
                <WikiDetails
                    show={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    reFetch={fetchWikis}
                    wiki={selectedWiki}
                />
            }

            {/* Edit Wiki Modal */}
            {selectedWiki &&
                <EditWikiModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    wiki={selectedWiki}
                    reFetch={fetchWikis}
                />
            }
        </Container>
    );
}

export default Wiki;
