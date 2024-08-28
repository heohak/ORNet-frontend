import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config/config";

function EditBaitWorker() {
    const { baitWorkerId } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/bait/worker/${baitWorkerId}`);
                const workerData = response.data;
                setFirstName(workerData.firstName);
                setLastName(workerData.lastName);
                setEmail(workerData.email);
                setPhoneNumber(workerData.phoneNumber);
                setTitle(workerData.title);
            } catch (error) {
                setError('Error fetching worker data');
            } finally {
                setLoading(false);
            }
        };

        fetchWorker();
    }, [baitWorkerId]);

    const handleUpdateWorker = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/bait/worker/update/${baitWorkerId}`, {
                firstName,
                lastName,
                email,
                phoneNumber,
                title,
            });
            navigate('/view-bait-workers');
        } catch (error) {
            setError('Error updating worker');
        }
    };

    const handleDeleteWorker = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/bait/worker/${baitWorkerId}`);
            navigate('/view-bait-workers');
        } catch (error) {
            setError('Error deleting worker');
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
            <h1>Edit Worker</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
                <Form.Group controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                    />
                </Form.Group>
                <Form.Group controlId="formLastName" className="mt-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                    />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                    />
                </Form.Group>
                <Form.Group controlId="formPhoneNumber" className="mt-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                    />
                </Form.Group>
                <Form.Group controlId="formTitle" className="mt-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" onClick={handleUpdateWorker}>
                    Update Worker
                </Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleDeleteWorker}>
                    Delete Worker
                </Button>
                <Button variant="secondary" className="mt-3 ms-3" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>
        </Container>
    );
}

export default EditBaitWorker;
