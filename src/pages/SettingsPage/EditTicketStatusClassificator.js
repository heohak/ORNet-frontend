import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../../config/config';
import EditTicketStatusAndWorkTypeModal from "../../modals/EditTicketStatusAndWorkTypeModal";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";

function EditTicketStatusClassificator() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);
    const [ticketList, setTicketList] = useState([]);
    const [showEditTicketStatusModal, setShowEditTicketStatusModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    useEffect(() => {
        const fetchClassificator = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/${id}`);
                setStatus(response.data.status);
            } catch (error) {
                setError('Error fetching ticket status classificator');
            }
        };

        fetchClassificator();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/classificator/update/${id}`, { status });
            navigate('/settings/ticket-status-classificators');
        } catch (error) {
            setError('Error updating ticket status classificator');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/search`, {
                params: {
                    statusId: id
                }
            });
            setTicketList(response.data);
            if (response.data.length < 1) {
                setShowDeleteConfirmationModal(true);
            } else {
                setShowEditTicketStatusModal(true);
            }
        } catch (error) {
            setError(error.message);
        }

    };

    const deleteClassificator = async() => {
        try {
            await axios.delete(`${config.API_BASE_URL}/ticket/classificator/${id}`);
            navigate('/settings/ticket-status-classificators');
        } catch (error) {
            setError(error.message)
        }
    }

    const handleNavigate = () => {
        if (id) {
            navigate('/history', { state: { endpoint: `ticket/classificator/history/${id}` } });
        } else {
            console.error("Classificator id is undefined");

        }
    }

    return (
        <Container className="mt-5">
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h1>Edit Ticket Status Classificator</h1>
                <Button variant='secondary' onClick={handleNavigate} className="mt-3 ms-3">
                    See history
                </Button>
            </div>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                        type="text"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="Enter status"
                        required
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" type="submit">Update</Button>
                {(id !== '1' && id !== '2') && (
                    <Button variant="danger" className="mt-3 ms-3" onClick={handleDelete}>
                        Delete
                    </Button>
                )}
            </Form>
            <Button variant="secondary" className="mt-3" onClick={() => navigate('/settings/ticket-status-classificators')}>
                Back
            </Button>
            <EditTicketStatusAndWorkTypeModal
                show={showEditTicketStatusModal}
                handleClose={() => setShowEditTicketStatusModal(false)}
                ticketList={ticketList}
            />
            <DeleteConfirmationModal
                show={showDeleteConfirmationModal}
                handleClose={() => setShowDeleteConfirmationModal(false)}
                handleDelete={deleteClassificator}
            />
        </Container>
    );
}

export default EditTicketStatusClassificator;
