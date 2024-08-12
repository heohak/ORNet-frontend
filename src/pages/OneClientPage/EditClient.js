import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import config from '../../config/config';

function EditClient() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState({
        fullName: '',
        shortName: '',
        pathologyClient: false,
        surgeryClient: false,
        editorClient: false,
        otherMedicalInformation: '',
        lastMaintenance: '',
        nextMaintenance: '',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
                setClientData(response.data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchClientData();
    }, [clientId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClientData({
            ...clientData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/client/update/${clientId}`, clientData);
            navigate(`/client/${clientId}`); // Redirect to the client details page
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Edit Client</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="fullName"
                        value={clientData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Short Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="shortName"
                        value={clientData.shortName}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Pathology Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="pathologyClient"
                        checked={clientData.pathologyClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Surgery Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="surgeryClient"
                        checked={clientData.surgeryClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Editor Client</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="editorClient"
                        checked={clientData.editorClient}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Other Medical Information</Form.Label>
                    <Form.Control
                        type="text"
                        name="otherMedicalInformation"
                        value={clientData.otherMedicalInformation}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Last Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="lastMaintenance"
                        value={clientData.lastMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Next Maintenance</Form.Label>
                    <Form.Control
                        type="date"
                        name="nextMaintenance"
                        value={clientData.nextMaintenance}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Button variant="success" type="submit">Save Changes</Button>
                <Button variant="secondary" className="ms-3" onClick={() => navigate(`/client/${clientId}`)}>Cancel</Button>
            </Form>
        </Container>
    );
}

export default EditClient;
