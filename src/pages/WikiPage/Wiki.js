import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Form } from 'react-bootstrap';
import config from "../../config/config";
import AddWikiModal from "./AddWikiModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "../../css/Wiki.css";
import WikiDetails from "./WikiDetails";

function Wiki() {
    const [wikis, setWikis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
            const response = await axios.get(`${config.API_BASE_URL}/wiki/search`, {
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

    if (loading && !wikis.length) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    const openDetailsModal = (wiki) => {
        setSelectedWiki(wiki);
        setShowDetailsModal(true);
    }


    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between mb-4">
                <Col className="col-md-auto">
                    <h1 className="mb-0">Wiki</h1>
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
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Wiki</Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {/* Table header */}
            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={8}>Title</Col>
                <Col md={2}>Actions</Col>
            </Row>
            <hr />

            {/* Wiki Rows */}
            {wikis.map((wiki, index) => {
                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff'; // Alternating row colors
                return (
                    <Row
                        key={wiki.id}
                        className="align-items-center"
                        style={{ margin: "0 0", cursor: 'pointer' }}
                        onClick={() => openDetailsModal(wiki)}
                    >
                        <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                            <Row className="align-items-center">
                                <Col md={8}>{wiki.problem}</Col>
                            </Row>
                        </Col>
                    </Row>
                );
            })}

            {/* Add Wiki Modal */}
            <AddWikiModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                reFetch={fetchWikis}
            />

            {/* Delete Confirmation Modal */}
            {selectedWiki &&
                <DeleteConfirmModal
                    show={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    reFetch={fetchWikis}
                    wiki={selectedWiki}
                />
            }
            {/* Wiki Details Modal */}
            {selectedWiki &&
                <WikiDetails
                    show={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    reFetch={fetchWikis}
                    wiki={selectedWiki}
                />
            }
        </Container>
    );
}

export default Wiki;
