import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from '../../config/config';

function EditThirdPartyIT() {
    const location = useLocation();
    const navigate = useNavigate();
    const { thirdParty } = location.state;

    const [name, setName] = useState(thirdParty.name);
    const [email, setEmail] = useState(thirdParty.email);
    const [phone, setPhone] = useState(thirdParty.phone);
    const [error, setError] = useState(null);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.put(`${config.API_BASE_URL}/third-party/update/${thirdParty.id}`, {
                name,
                email,
                phone,
            });
            navigate('/settings/third-party-its');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/third-party/${thirdParty.id}`);
            navigate('/settings/third-party-its');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Edit Third Party IT</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formPhone" className="mt-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Update
                </Button>
                <Button variant="danger" onClick={handleDelete} className="mt-3 ms-3">
                    Delete
                </Button>
                <Button variant="secondary" onClick={() => navigate('/settings/third-party-its')} className="mt-3 ms-3">
                    Cancel
                </Button>
            </Form>
        </Container>
    );
}

export default EditThirdPartyIT;
