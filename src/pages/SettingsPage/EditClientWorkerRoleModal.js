import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import config from '../../config/config';
import CannotDeleteWorkerRoleModal from '../../modals/CannotDeleteWorkerRoleModal';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';
import axiosInstance from "../../config/axiosInstance";

function EditClientWorkerRoleModal({ show, onHide, role, onUpdate }) {
    const [roleName, setRoleName] = useState(role?.role || '');
    const [error, setError] = useState(null);

    const [workerList, setWorkerList] = useState([]);
    const [showCannotDeleteModal, setShowCannotDeleteModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    const handleUpdateRole = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/worker/classificator/update/${role.id}`, {
                role: roleName,
            });
            onUpdate();
            onHide();
        } catch (error) {
            setError('Error updating role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/search`, {
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
                            const employerResponse = await axiosInstance.get(
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
                setShowCannotDeleteModal(true);
            }
        } catch (error) {
            setError('Error fetching associated workers');
        } finally {
            setIsDeleting(false);
        }
    };

    const deleteClassificator = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/worker/classificator/${role.id}`);
            onUpdate();
            onHide();
        } catch (error) {
            setError('Error deleting role');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Modal
                dialogClassName={showDeleteConfirmationModal || showCannotDeleteModal ? "dimmed" : ""}
                backdrop="static"
                show={show}
                onHide={onHide}
            >
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
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Role"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal when the worker cannot be deleted, because it is linked with other customers */}
            <CannotDeleteWorkerRoleModal
                show={showCannotDeleteModal}
                handleClose={() => setShowCannotDeleteModal(false)}
                workerList={workerList}
            />
            <DeleteConfirmationModal
                show={showDeleteConfirmationModal}
                handleClose={() => setShowDeleteConfirmationModal(false)}
                handleDelete={deleteClassificator}
                isDeleting={isDeleting}
            />
        </>
    );
}

export default EditClientWorkerRoleModal;
