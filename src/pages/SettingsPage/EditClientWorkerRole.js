import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";
import EditWorkerRoleModal from "../../modals/EditWorkerRoleModal";

function EditClientWorkerRole() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;

    const [roleName, setRoleName] = useState(role?.role || '');
    const [error, setError] = useState(null);

    const [workerList, setWorkerList] = useState([]);
    const [showEditWorkerRoleModal, setShowEditWorkerRoleModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const handleUpdateRole = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/worker/classificator/update/${role.id}`, {
                role: roleName,
            });
            navigate('/settings/client-worker-roles');
        } catch (error) {
            setError(error.message);
        }
    };


    const handleDeleteRole = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/search`, {
                params: {
                    roleId: role.id
                }
            });
            const workers = response.data;

            if (workers.length < 1) {
                setShowDeleteConfirmationModal(true);
            } else {
                // Fetch employer data for each worker
                const workerListWithEmployer = await Promise.all(workers.map(async (worker) => {
                    try {
                        const employerResponse = await axios.get(`${config.API_BASE_URL}/worker/employer/${worker.id}`);
                        return {
                            ...worker,
                            employerFullName: employerResponse.data.fullName,  // Add employer's full name to worker data
                        };
                    } catch (error) {
                        console.error('Error fetching employer data:', error);
                        return worker;  // Return worker without employer data if error occurs
                    }
                }));

                setWorkerList(workerListWithEmployer);
                setShowEditWorkerRoleModal(true);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const deleteClassificator = async() => {
        try {
            await axios.delete(`${config.API_BASE_URL}/worker/classificator/${role.id}`);
            navigate('/settings/client-worker-roles');
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <Container className="mt-5">
            <h1>Edit Client Worker Role</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form>
                <Form.Group controlId="formRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="Enter role"
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" onClick={handleUpdateRole}>
                    Update Role
                </Button>
                <Button variant="danger" className="mt-3 ms-2" onClick={handleDeleteRole}>
                    Delete Role
                </Button>
                <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate('/settings/client-worker-roles')}>
                    Cancel
                </Button>
            </Form>
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
        </Container>
    );
}

export default EditClientWorkerRole;
