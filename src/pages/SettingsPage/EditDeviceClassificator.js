import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';
import EditDeviceModal from "../../modals/EditDeviceModal";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";

function EditDeviceClassificator() {
    const navigate = useNavigate();
    const location = useLocation();
    const { classificator } = location.state;  // Receiving the passed classificator data

    const [name, setName] = useState(classificator.name);
    const [error, setError] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

    const handleUpdateClassificator = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await axios.put(`${config.API_BASE_URL}/device/classificator/update/${classificator.id}`, {
                name,
            });
            navigate('/settings/device-classificators'); // Redirect to the classificators list after updating
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteClassificator = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    classificatorId: classificator.id
                }
            });
            setDeviceList(response.data);
            console.log(response.data);
            if (response.data.length < 1) {
                setShowDeleteConfirmationModal(true);
            } else {
                setShowEditDeviceModal(true);
            }
        } catch (error) {
            setError(error.message);
        }

    };

    const deleteClassificator = async() => {
        try {
            await axios.delete(`${config.API_BASE_URL}/device/classificator/${classificator.id}`);
            navigate('/settings/device-classificators'); // Redirect to the classificators list after deleting
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <Container className="mt-5">
            <h1>Edit Device Classificator</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form onSubmit={handleUpdateClassificator}>
                <Form.Group controlId="formName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Update Classificator
                </Button>
                <Button variant="danger" className="ms-2" onClick={handleDeleteClassificator}>
                    Delete Classificator
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/settings/device-classificators')}>
                    Cancel
                </Button>
            </Form>
            <EditDeviceModal
                show={showEditDeviceModal}
                handleClose={() => setShowEditDeviceModal(false)}
                deviceList={deviceList}
            />
            <DeleteConfirmationModal
            show={showDeleteConfirmationModal}
            handleClose={() => setShowDeleteConfirmationModal(false)}
            handleDelete={deleteClassificator}
            />
        </Container>

    );
}

export default EditDeviceClassificator;
