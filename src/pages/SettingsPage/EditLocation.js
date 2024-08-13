import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config/config";

function EditLocation() {
    const { locationId } = useParams();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/${locationId}`);
                const locationData = response.data;
                setName(locationData.name);
                setAddress(locationData.address);
                setPhone(locationData.phone);
            } catch (error) {
                setError('Error fetching location data');
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [locationId]);

    const handleUpdateLocation = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/location/update/${locationId}`, {
                name,
                address,
                phone
            });
            navigate('/settings/locations');
        } catch (error) {
            setError('Error updating location');
        }
    };

    const handleDeleteLocation = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/location/${locationId}`);
            navigate('/settings/locations');
        } catch (error) {
            setError('Error deleting location');
        }
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

    return (
        <Container className="mt-5">
            <h1>Edit Location</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                    />
                </Form.Group>
                <Form.Group controlId="formAddress" className="mt-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter address"
                    />
                </Form.Group>
                <Form.Group controlId="formPhone" className="mt-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" onClick={handleUpdateLocation}>
                    Update Location
                </Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleDeleteLocation}>
                    Delete Location
                </Button>
                <Button variant="secondary" className="mt-3 ms-3" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>
        </Container>
    );
}

export default EditLocation;
