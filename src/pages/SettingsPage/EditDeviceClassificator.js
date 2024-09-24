import React, { useState } from 'react';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';

function EditDeviceClassificator() {
    const navigate = useNavigate();
    const location = useLocation();
    const { classificator } = location.state;

    const [name, setName] = useState(classificator.name);
    const [error, setError] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [locationNames, setLocationNames] = useState({});  // To store location names for each locationId
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal for delete confirmation

    const fetchRelatedDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {
                    classificatorId: classificator.id
                }
            });
            const devices = response.data;
            setDeviceList(devices);

            // Fetch location names based on locationId for each device
            const locationIds = devices.map(device => device.locationId).filter(Boolean); // Get unique locationIds
            const locationPromises = locationIds.map(locationId =>
                axios.get(`${config.API_BASE_URL}/location/${locationId}`)
            );

            const locationResponses = await Promise.all(locationPromises);
            const locations = locationResponses.reduce((acc, res) => {
                acc[res.data.id] = res.data.name;  // Store locationId to locationName mapping
                return acc;
            }, {});
            setLocationNames(locations);  // Save the location names in state
        } catch (error) {
            setError('Error fetching related devices or locations');
        }
    };

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
    const handleShowDeleteModal = async () => {
        await fetchRelatedDevices();
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };


    const handleDeleteClassificator = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/device/classificator/${classificator.id}`);
            navigate('/settings/device-classificators'); // Redirect after deletion
        } catch (error) {
            setError('Error deleting classificator');
        }
    };

    const handleNavigate = () => {
        if (classificator && classificator.id) {
            navigate('/history', { state: { endpoint: `device/classificator/history/${classificator.id}`}})
        } else {
            console.error("Classificator or its id is undefined");
        }
    }

    return (
        <Container className="mt-5">
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h1>Edit Device Classificator</h1>
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
                <Button variant="danger" className="ms-2" onClick={handleShowDeleteModal}>
                    Delete Classificator
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => navigate('/settings/device-classificators')}>
                    Cancel
                </Button>
            </Form>
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Classificator Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deviceList.length > 0 ? (
                        <>
                            <p>This classificator is associated with the following devices and cannot be deleted:</p>
                            <ul>
                                {deviceList.map((device) => (
                                    <li key={device.id}>
                                        <strong>Device Name:</strong> {device.deviceName} <br />
                                        <strong>Serial Number:</strong> {device.serialNumber} <br />
                                        <strong>Location:</strong> {locationNames[device.locationId] || 'Unknown Location'} <br />
                                        <strong>License Number:</strong> {device.licenseNumber || 'N/A'}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No devices are linked to this classificator. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    {/* Conditionally render the Delete button only if no devices are linked */}
                    {deviceList.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteClassificator}>
                            Delete Classificator
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

        </Container>

    );
}

export default EditDeviceClassificator;
