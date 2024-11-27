import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import config from "../../config/config";

function WikiDetails() {
    const { wikiId } = useParams();
    const [wiki, setWiki] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWiki = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/wiki/${wikiId}`);
                setWiki(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWiki();
    }, [wikiId]);

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
            <Card>
                <Card.Body>
                    <Card.Title>Problem</Card.Title>
                    <Card.Text>{wiki.problem}</Card.Text>
                    <Card.Title>Solution</Card.Title>
                    {/* Preserve text formatting using <pre> */}
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                        {wiki.solution}
                    </pre>
                    <Button onClick={() => navigate(-1)}>Back</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default WikiDetails;
