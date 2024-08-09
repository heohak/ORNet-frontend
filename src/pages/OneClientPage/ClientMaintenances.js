import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";

function ClientMaintenances({ maintenances, clientId, setRefresh, client }) {
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [showAddFilesModal, setShowAddFilesModal] = useState(false);
    const [showViewFilesModal, setShowViewFilesModal] = useState(false);
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [error, setError] = useState(null);
    const [maintenanceFiles, setMaintenanceFiles] = useState({});

    useEffect(() => {
        fetchMaintenanceFiles();
    }, [maintenances]);

    const fetchMaintenanceFiles = async () => {
        try {
            const filePromises = maintenances.map(maintenance =>
                axios.get(`${config.API_BASE_URL}/maintenance/files/${maintenance.id}`)
            );
            const fileResponses = await Promise.all(filePromises);
            const filesMap = {};
            fileResponses.forEach((response, index) => {
                filesMap[maintenances[index].id] = response.data;
            });
            setMaintenanceFiles(filesMap);
        } catch (error) {
            console.error('Error fetching maintenance files:', error);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleAddMaintenance = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment
            });

            if (maintenanceResponse.data && maintenanceResponse.data.token) {
                const maintenanceId = maintenanceResponse.data.token;
                await axios.put(`${config.API_BASE_URL}/client/maintenance/${clientId}/${maintenanceId}`);

                if (files.length > 0) {
                    await uploadFiles(maintenanceId);
                }

                setMaintenanceName('');
                setMaintenanceDate('');
                setComment('');
                setFiles([]);

                setRefresh(prev => !prev); // Trigger refresh by toggling state
                setShowAddMaintenanceModal(false); // Close the modal after adding the maintenance
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const uploadFiles = async (maintenanceId) => {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        try {
            await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchMaintenanceFiles(); // Refresh the files list
        } catch (error) {
            setError('Error uploading files.');
            console.error('Error uploading files:', error);
        }
    };

    const handleAddFiles = async (e) => {
        e.preventDefault();
        setError(null);

        if (selectedMaintenanceId && files.length > 0) {
            await uploadFiles(selectedMaintenanceId);
            setFiles([]);
            setShowAddFilesModal(false);
        }
    };

    return (
        <>
            <h2 className="mt-4">Maintenances</h2>
            <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>Add Maintenance</Button>
            {maintenances.length > 0 ? (
                <ListGroup className="mt-3">
                    {maintenances.map((maintenance) => (
                        <ListGroup.Item key={maintenance.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{maintenance.maintenanceName}</Card.Title>
                                    <Card.Text>
                                        <strong>Date:</strong> {maintenance.maintenanceDate}<br />
                                        <strong>Comment:</strong> {maintenance.comment}<br />
                                    </Card.Text>
                                    <Button
                                        variant="info"
                                        onClick={() => {
                                            setSelectedMaintenanceId(maintenance.id);
                                            setShowViewFilesModal(true);
                                        }}
                                        className="me-2"
                                    >
                                        View Files
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedMaintenanceId(maintenance.id);
                                            setShowAddFilesModal(true);
                                        }}
                                    >
                                        Add Files
                                    </Button>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No maintenances available.</Alert>
            )}

            <Modal show={showAddMaintenanceModal} onHide={() => setShowAddMaintenanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Maintenance to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Form onSubmit={handleAddMaintenance}>
                        <Form.Group className="mb-3">
                            <Form.Label>Maintenance Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={maintenanceName}
                                onChange={(e) => setMaintenanceName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Maintenance Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={maintenanceDate}
                                onChange={(e) => setMaintenanceDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Files</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit">
                            Add Maintenance
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddMaintenanceModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddFilesModal} onHide={() => setShowAddFilesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Files to Maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Form onSubmit={handleAddFiles}>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Files</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit">
                            Add Files
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddFilesModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showViewFilesModal} onHide={() => setShowViewFilesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>View Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {maintenanceFiles[selectedMaintenanceId] && maintenanceFiles[selectedMaintenanceId].length > 0 ? (
                        <div>
                            {maintenanceFiles[selectedMaintenanceId].map(file => (
                                <div key={file.id} className="mb-2">
                                    <a href={`${config.API_BASE_URL}/file/download/${file.id}`} download>
                                        <img
                                            src={`${config.API_BASE_URL}/file/thumbnail/${file.id}`}
                                            alt={file.fileName}
                                            style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '10px' }}
                                        />
                                        {file.fileName}
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Alert variant="info">No files available for this maintenance.</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewFilesModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientMaintenances;
