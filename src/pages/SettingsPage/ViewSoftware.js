import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
} from 'react-bootstrap';
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import AddTechnicalInfoModal from '../OneClientPage/AddTechnicalInfoModal';
import EditTechnicalInfoModal from "./EditTechnicalInfoModal";
import axiosInstance from "../../config/axiosInstance";

function ViewSoftware() {
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);

    // State for Edit Modal
    const [selectedSoftware, setSelectedSoftware] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchSoftwareList();
    }, [refresh]);

    const fetchSoftwareList = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/software/all`);
            setSoftwareList(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching software list');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (software) => {
        setSelectedSoftware(software);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedSoftware(null);
        setShowEditModal(false);
    };

    return (
        <Container className="mt-4">

            <Button
                variant="link"
                onClick={() => navigate(-1)}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }} // Adjust styling as desired
            >
                <FaArrowLeft title="Go back" />
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Technical Information</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Tech Info
                </Button>
            </div>
            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    {softwareList.length === 0 ? (
                        <Alert variant="info">No technical information found.</Alert>
                    ) : (
                        <>
                            {/* Table Header */}
                            <Row className="fw-bold mt-2">
                                <Col>Name</Col>
                                <Col>DB Version</Col>
                                <Col md="auto">Actions</Col>
                            </Row>
                            <hr />
                            {/* Software Rows */}
                            {softwareList.map((software, index) => {
                                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={software.id}
                                        className="align-items-center"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col>{software.name}</Col>
                                        <Col>{software.dbVersion}</Col>
                                        <Col md="auto">
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={() => handleEdit(software)}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    )}
                </>
            )}

            {/* Add Technical Info Modal */}
            <AddTechnicalInfoModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onAddTechnicalInfo={() => {
                    setRefresh((prev) => !prev);
                    setShowAddModal(false);
                }}
            />

            {/* Edit Technical Info Modal */}
            {selectedSoftware && (
                <EditTechnicalInfoModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    software={selectedSoftware}
                    onUpdate={() => {
                        setRefresh((prev) => !prev);
                        handleCloseEditModal();
                    }}
                />
            )}
        </Container>
    );
}

export default ViewSoftware;
