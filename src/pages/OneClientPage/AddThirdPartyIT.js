import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from "../../config/config";
import Select from 'react-select';

function AddThirdPartyIT({ clientId, onClose, setRefresh }) {
    const [thirdParties, setThirdParties] = useState([]);
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchThirdParties = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/third-party/all`);
                setThirdParties(response.data.map(thirdParty => ({ value: thirdParty.id, label: thirdParty.name })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchThirdParties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedThirdParty) {
            setError("Please select a third-party IT.");
            return;
        }

        try {
            await axios.put(`${config.API_BASE_URL}/client/third-party/${clientId}/${selectedThirdParty.value}`);
            setRefresh(prev => !prev); // Trigger refresh by toggling state
            onClose(); // Close the modal after adding the third-party IT
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Select Third-Party IT</Form.Label>
                    <Select
                        options={thirdParties}
                        value={selectedThirdParty}
                        onChange={setSelectedThirdParty}
                        placeholder="Select a third-party IT"
                    />
                </Form.Group>
                <Button variant="success" type="submit">
                    Add Third-Party IT
                </Button>
            </Form>
        </Container>
    );
}

export default AddThirdPartyIT;
