import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import { FaTrash } from 'react-icons/fa';

function EditWorkTypeModal({ show, onHide, workType, onUpdate }) {
    const [editedWorkType, setEditedWorkType] = useState(workType.workType);
    const [error, setError] = useState(null);
    const [ticketList, setTicketList] = useState([]);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${config.API_BASE_URL}/work-type/classificator/update/${workType.id}`,
                {
                    workType: editedWorkType,
                }
            );
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/search`, {
                params: {
                    workTypeId: workType.id,
                },
            });
            setTicketList(response.data);
            if (response.data.length < 1) {
                setShowDeleteConfirmationModal(true);
            } else {
                // Handle the case where tickets are associated
                alert('Cannot delete work type associated with tickets.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const deleteClassificator = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/work-type/classificator/${workType.id}`);
            if (onUpdate) {
                onUpdate();
            }
            setShowDeleteConfirmationModal(false);
            onHide();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteConfirmationModal(false);
    };

    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Work Type</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdate}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            <FaTrash /> Delete Work Type
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Work Type
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmationModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Work Type Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to delete this work type? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={deleteClassificator}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditWorkTypeModal;
