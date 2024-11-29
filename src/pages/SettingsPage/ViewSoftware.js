// ViewSoftware.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import AddTechnicalInfoModal from "../OneClientPage/AddTechnicalInfoModal"; // Import the new component

function ViewSoftware() {
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const softwareResponse = await axios.get(`${config.API_BASE_URL}/software/all`);
                setSoftwareList(softwareResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refresh]);

    const handleEdit = (software) => {
        navigate(`/settings/software/edit/${software.id}`, { state: { software } });
    };

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
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Technical Information</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Tech Info
                </Button>
            </div>
            <Row>
                {softwareList.map((software) => (
                    <Col md={4} key={software.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{software.name}</Card.Title>
                                <Card.Text>
                                    <strong>DB Version:</strong> {software.dbVersion}
                                    <br />
                                </Card.Text>
                                <Button variant="secondary" onClick={() => handleEdit(software)}>
                                    Edit
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Button onClick={() => navigate('/settings')}>Back</Button>

            {/* Use AddTechnicalInfoModal */}
            <AddTechnicalInfoModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onAddTechnicalInfo={() => {
                    setRefresh(prev => !prev);
                    setShowAddModal(false);
                }}
            />
        </Container>
    );
}

export default ViewSoftware;
