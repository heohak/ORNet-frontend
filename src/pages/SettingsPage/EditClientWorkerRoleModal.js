import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import EditWorkerRoleModal from '../../modals/EditWorkerRoleModal';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';

function EditClientWorkerRoleModal({ show, onHide, role, onUpdate }) {
    const [roleName, setRoleName] = useState(role?.role || '');
    const [error, setError] = useState(null);

    const [workerList, setWorkerList] = useState([]);
    const [showEditWorkerRoleModal, setShowEditWorkerRoleModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.API_BASE_URL}/worker/classificator/update/${role.id}`, {
                role: roleName,
            });
            onUpdate();
            onHide();
        } catch (error) {
            setError('Error updating role');
        }
    };

    const handleDeleteRole = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    roleId: role.id,
                },
            });
            const workers = response.data;

            if (workers.length < 1) {
                setShowDeleteConfirmationModal(true);
            } else {
                // Fetch employer data for each worker
                const workerListWithEmployer = await Promise.all(
                    workers.map(async (worker) => {
                        try {
                            const employerResponse = await axios.get(
                                `${config.API_BASE_URL}/worker/employer/${worker.id}`
                            );
                            return {
                                ...worker,
                                employerFullName: employerResponse.data.fullName,
                            };
                        } catch (error) {
                            console.error('Error fetching employer data:', error);
                            return worker;
                        }
                    })
                );

                setWorkerList(workerListWithEmployer);
                setShowEditWorkerRoleModal(true);
            }
        } catch (error) {
            setError('Error fetching associated workers');
        }
    };

    const deleteClassificator = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/worker/classificator/${role.id}`);
            onUpdate();
            onHide();
        } catch (error) {
            setError('Error deleting role');
        }
    };

    const handleNavigate = () => {
        console.log('Navigate to role history');
    };

    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Customer Contact Role</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateRole}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form.Group controlId="formRole">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Enter role"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteRole}>
                            Delete Role
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Role
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modals for deletion confirmation and worker role editing */}
            <EditWorkerRoleModal
                show={showEditWorkerRoleModal}
                handleClose={() => setShowEditWorkerRoleModal(false)}
                workerList={workerList}
            />
            <DeleteConfirmationModal
                show={showDeleteConfirmationModal}
                handleClose={() => setShowDeleteConfirmationModal(false)}
                handleDelete={deleteClassificator}
            />
        </>
    );
}

export default EditClientWorkerRoleModal;
