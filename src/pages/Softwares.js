import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import config from "../config/config";

function Softwares() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = location.state || {};
    const [softwares, setSoftwares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clientId) {
            navigate('/');
            return;
        }

        const fetchSoftwares = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/software/client/${clientId}`);
                setSoftwares(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSoftwares();
    }, [clientId, navigate]);

    const handleViewSoftwareDetails = (softwareId) => {
        navigate(`/software/${softwareId}`, { state: { clientId } });
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
            <h1 className="mb-4">Softwares for Client {clientId}</h1>
            <ListGroup>
                {softwares.map((software) => (
                    <ListGroup.Item key={software.id} action onClick={() => handleViewSoftwareDetails(software.id)}>
                        {software.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Button onClick={() => navigate(-1)} className="mt-3">Back</Button>

        </Container>
    );
}

export default Softwares;
