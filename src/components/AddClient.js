import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function AddClient() {
    const [fullName, setFullName] = useState('');
    const [shortName, setShortName] = useState('');
    const [thirdPartyIT, setThirdPartyIT] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.post('http://localhost:8080/client', {
                fullName,
                shortName,
                thirdPartyIT
            });
            navigate('/clients');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Add Client</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Short Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Third Party IT</Form.Label>
                    <Form.Control
                        type="text"
                        value={thirdPartyIT}
                        onChange={(e) => setThirdPartyIT(e.target.value)}
                    />
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Client
                </Button>
                <Button className="gy-5" onClick={() => navigate(-1)}>Back</Button>
            </Form>
        </Container>
    );
}

export default AddClient;
