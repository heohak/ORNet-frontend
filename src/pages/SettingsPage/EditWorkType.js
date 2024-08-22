import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';
import EditTicketStatusAndWorkTypeModal from "../../modals/EditTicketStatusAndWorkTypeModal";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";

function EditWorkType() {
    const location = useLocation();
    const navigate = useNavigate();
    const { workType } = location.state || {}; // Get the workType passed from the previous page
    const [editedWorkType, setEditedWorkType] = useState(workType.workType);
    const [error, setError] = useState(null);

    const [ticketList, setTicketList] = useState([]);
    const [showEditTicketStatusModal, setShowEditTicketStatusModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/work-type/classificator/update/${workType.id}`, {
                workType: editedWorkType,
            });
            navigate('/settings/work-types');
        } catch (error) {
            setError(error.message);
        }
    };


    const handleDelete = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/search`, {
                params: {
                    workTypeId: workType.id
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
            await axios.delete(`${config.API_BASE_URL}/work-type/classificator/${workType.id}`);
            navigate('/settings/work-types');
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <Container className="mt-5">
            <h1>Edit Work Type</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="formWorkType">
                    <Form.Label>Work Type</Form.Label>
                    <Form.Control
                        type="text"
                        value={editedWorkType}
                        onChange={(e) => setEditedWorkType(e.target.value)}
                        placeholder="Enter work type"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Update Work Type
                </Button>
                <Button variant="danger" onClick={handleDelete} className="mt-3 ms-3">
                    Delete Work Type
                </Button>
                <Button variant="secondary" onClick={() => navigate('/settings/work-types')} className="mt-3 ms-3">
                    Cancel
                </Button>
            </Form>
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

export default EditWorkType;
