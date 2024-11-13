import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import FileList from "../../modals/FileList";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";

function MaintenanceInfo({
                             maintenanceInfo,
                             setMaintenanceInfo,
                             showMaintenanceModal,
                             setShowMaintenanceModal,
                             showMaintenanceFieldModal,
                             setShowMaintenanceFieldModal,
    deviceId
                         }) {
    const [visibleFields, setVisibleFields] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [maintenanceFiles, setMaintenanceFiles] = useState({});
    const [isSubmittingFileUpload, setIsSubmittingFileUpload] = useState(false);

    // Add the following state variables at the beginning of the MaintenanceInfo component

    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [maintenanceComment, setMaintenanceComment] = useState("");
    const [files, setFiles] = useState([]);
    const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);
    const [error, setError] = useState(null); // To handle errors within MaintenanceInfo



    const defaultFields = [
        'maintenanceName',
        'maintenanceDate',
        'comment'
    ];

    useEffect(() => {
        if (maintenanceInfo.length > 0) {
            initializeVisibleFields(maintenanceInfo[0]);
            fetchAllMaintenanceFiles();
        }
    }, [maintenanceInfo]);

    const initializeVisibleFields = (data) => {
        const initialVisibleFields = defaultFields.reduce((acc, key) => {
            if (key in data) {
                acc[key] = true;
            }
            return acc;
        }, {});

        const savedVisibilityState = localStorage.getItem('maintenanceVisibilityState');
        if (savedVisibilityState) {
            const savedFields = JSON.parse(savedVisibilityState);
            setVisibleFields({ ...initialVisibleFields, ...savedFields });
        } else {
            setVisibleFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (field) => {
        setVisibleFields(prevVisibleFields => {
            const newVisibleFields = { ...prevVisibleFields, [field]: !prevVisibleFields[field] };
            localStorage.setItem('maintenanceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const fetchAllMaintenanceFiles = async () => {
        try {
            const filesData = {};
            for (let maintenance of maintenanceInfo) {
                const response = await axios.get(`${config.API_BASE_URL}/maintenance/files/${maintenance.id}`);
                filesData[maintenance.id] = response.data;
            }
            setMaintenanceFiles(filesData);
        } catch (error) {
            console.error('Error fetching maintenance files:', error);
        }
    };

    const renderFields = (data) => {
        return Object.keys(data).map(key => {
            if (visibleFields[key] && data[key] !== null) {
                return (
                    <Card.Text key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: </strong> {data[key]}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    const renderFiles = (maintenanceId) => {
        const files = maintenanceFiles[maintenanceId] || [];
        return (
            <>
                <Card.Text>
                    <strong>Files:</strong>
                </Card.Text>
                <FileList files={files}/>
            </>
        );
    };



    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
        setFiles([...selectedFiles, ...files]);
    };

    const handleFileRemove = (fileName) => {
        const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
        setSelectedFiles(updatedFiles);
        setFiles(updatedFiles);
    };

    const handleFileUpload = async () => {
        if (isSubmittingFileUpload) return;
        setIsSubmittingFileUpload(true);


        if (selectedFiles.length === 0 || !selectedMaintenanceId) {
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));

        try {
            await axios.put(`${config.API_BASE_URL}/maintenance/upload/${selectedMaintenanceId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSelectedFiles([]);
            setShowFileUploadModal(false);
            fetchAllMaintenanceFiles(); // Refresh file list after upload
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setIsSubmittingFileUpload(false);
        }
    };

    // Add the handleAddMaintenance function inside MaintenanceInfo.js

    const handleAddMaintenance = async () => {
        if (isSubmittingMaintenance) return;
        setIsSubmittingMaintenance(true);

        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment: maintenanceComment,
            });
            const maintenanceId = maintenanceResponse.data.token;
            await axios.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`);

            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            const response = await axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`);
            setMaintenanceInfo(response.data);
            setShowMaintenanceModal(false);
            setFiles([]); // Clear files after upload
        } catch (error) {
            console.error('Error adding maintenance:', error);
            setError(error.message);
        } finally {
            setIsSubmittingMaintenance(false);
        }
    };


    return (

        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Maintenance Information</h2>
                <Button variant="link" onClick={() => setShowMaintenanceFieldModal(true)}>
                    <FontAwesomeIcon icon={faCog}
                                     title="Edit visible fields"/>
                </Button>
                <Button variant="primary" onClick={() => setShowMaintenanceModal(true)}>
                    Add Maintenance
                </Button>

            </div>
            {maintenanceInfo.length > 0 ? (
                maintenanceInfo.map((maintenance, index) => (
                    <Card key={index} className="mb-4">
                        <Card.Body>
                            <Card.Title>Maintenance Details</Card.Title>
                            {renderFields(maintenance)}
                            {renderFiles(maintenance.id)}
                            <Button variant="secondary" onClick={() => {
                                setSelectedMaintenanceId(maintenance.id);
                                setShowFileUploadModal(true);
                            }}>Add Files</Button>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <Alert variant="info">No maintenance information available.</Alert>
            )}
            <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}
                    <Form.Group controlId="maintenanceName">
                        <Form.Label>Maintenance Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={maintenanceName}
                            onChange={(e) => setMaintenanceName(e.target.value)}
                            placeholder="Enter maintenance name"
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceDate">
                        <Form.Label>Maintenance Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceComment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={maintenanceComment}
                            onChange={(e) => setMaintenanceComment(e.target.value)}
                            placeholder="Enter comment"
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceFiles">
                        <Form.Label>Upload Files</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </Form.Group>
                    <ListGroup className="mt-3">
                        {files.map(file => (
                            <ListGroup.Item style={{ display: "flex", justifyContent: "space-between" }} key={file.name}>
                                {file.name}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="ms-3"
                                    onClick={() => handleFileRemove(file.name)}
                                >
                                    &times;
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleAddMaintenance}
                        disabled={isSubmittingMaintenance}
                    >
                        {isSubmittingMaintenance ? 'Adding...' : 'Add Maintenance'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMaintenanceFieldModal} onHide={() => setShowMaintenanceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Maintenance Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {Object.keys(visibleFields).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showFileUploadModal} onHide={() => setShowFileUploadModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formFile">
                        <Form.Control
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </Form.Group>
                    <ListGroup className="mt-3">
                        {selectedFiles.map(file => (
                            <ListGroup.Item style={{ display: "flex", justifyContent: "space-between" }} key={file.name}>
                                {file.name}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="ms-3"
                                    onClick={() => handleFileRemove(file.name)}
                                >
                                    &times;
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFileUploadModal(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleFileUpload}
                        disabled={isSubmittingFileUpload}
                    >
                        {isSubmittingFileUpload ? 'Uploading...' : 'Upload'}
                    </Button>

                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MaintenanceInfo;
