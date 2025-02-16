import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import axiosInstance from '../../config/axiosInstance';
import Select from 'react-select';
import TrainingService from './TrainingService';
import FileUploadModal from '../../modals/FileUploadModal';
import ReactDatePicker from "react-datepicker";
import {DateUtils} from "../../utils/DateUtils";

const TrainingDetailsModal = ({ show, onHide, training, trainerNames, clientNames, locationNames, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTraining, setEditableTraining] = useState(training);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [files, setFiles] = useState([]);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const trainingTypes = ['ON_SITE', 'TEAMS'];

    // When the training prop changes, update the editableTraining and fetch related data.
    useEffect(() => {
        if (training) {
            setEditableTraining(training);
            fetchClients();
            fetchTrainers();
            fetchFiles();
        }
    }, [training]);

    // When the client is changed, update locations accordingly.
    useEffect(() => {
        if (editableTraining.clientId) {
            fetchLocations(editableTraining.clientId);
        } else {
            setLocations([]);
            setEditableTraining(prev => ({ ...prev, locationId: "" }));
        }
    }, [editableTraining.clientId]);

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get('/client/all');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchLocations = async (clientId) => {
        try {
            const response = await axiosInstance.get(`/client/locations/${clientId}`);
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchTrainers = async () => {
        try {
            const response = await axiosInstance.get('/bait/worker/all');
            setTrainers(response.data.map(trainer => ({ value: trainer.id, label: trainer.firstName })));
        } catch (error) {
            console.error('Error fetching trainers:', error);
        }
    };

    const fetchFiles = async () => {
        if (!training || !training.id) return;
        try {
            const response = await axiosInstance.get(`/training/files/${training.id}`);
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching training files:', error);
        }
    };

    const handleSave = async () => {
        try {
            await TrainingService.updateTraining(editableTraining.id, editableTraining);
            const response = await axiosInstance.get(`/training/${editableTraining.id}`);
            const updatedTraining = response.data;
            onUpdate(updatedTraining);
        } catch (error) {
            console.error('Error updating training:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleFileOpen = async (fileId) => {
        try {
            const response = await axiosInstance.get(`/file/open/${fileId}`, { responseType: "blob" });
            const fileType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: fileType });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error opening the file:", error);
        }
    };

    // Downloads the file using file-saver.
    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await axiosInstance.get(`/file/download/${fileId}`, { responseType: 'blob' });
            const contentDisposition = response.headers['content-disposition'];
            const extractedFileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : fileName;
            const blob = new Blob([response.data]);
            saveAs(blob, extractedFileName);
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="lg"
                backdrop="static"
                dialogClassName={showFileUploadModal ? "dimmed" : ""}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Training" : "Training Details"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Name */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Name</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    type="text"
                                    value={editableTraining.name}
                                    onChange={(e) => setEditableTraining({ ...editableTraining, name: e.target.value })}
                                    required
                                />
                            ) : (
                                <p className="border rounded p-2 bg-light">{training.name}</p>
                            )}
                        </Form.Group>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-dark">Description</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    as="textarea"
                                    value={editableTraining.description}
                                    onChange={(e) => {
                                        setEditableTraining({ ...editableTraining, description: e.target.value });
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    style={{ minHeight: 'auto', overflow: 'hidden' }}
                                    ref={(textarea) => {
                                        if (textarea) {
                                            textarea.style.height = 'auto';
                                            textarea.style.height = textarea.scrollHeight + 'px';
                                        }
                                    }}
                                />
                            ) : (
                                <p className="border rounded p-2 bg-light">
                                    {training.description || "No description provided"}
                                </p>
                            )}
                        </Form.Group>

                        {/* Date */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Date</Form.Label>
                            {isEditing ? (
                                <ReactDatePicker
                                    selected={editableTraining.trainingDate}
                                    onChange={(date) => setEditableTraining({ ...editableTraining, trainingDate: date })}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select Update Date"
                                    isClearable
                                />
                            ) : (
                                <p className="border rounded p-2 bg-light">{DateUtils.formatDate(training.trainingDate)}</p>
                            )}
                        </Form.Group>

                        {/* Client */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Client</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    as="select"
                                    value={editableTraining.clientId}
                                    onChange={(e) => setEditableTraining({ ...editableTraining, clientId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.fullName}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <p className="border rounded p-2 bg-light">
                                    {clientNames[training.clientId] || training.clientId}
                                </p>
                            )}
                        </Form.Group>

                        {/* Location */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Location</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    as="select"
                                    value={editableTraining.locationId}
                                    onChange={(e) => setEditableTraining({ ...editableTraining, locationId: e.target.value })}
                                    disabled={!editableTraining.clientId}
                                >
                                    <option value="">{editableTraining.clientId ? "Select Location" : "Choose client first"}</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <p className="border rounded p-2 bg-light">
                                    {locationNames[training.locationId] || training.locationId}
                                </p>
                            )}
                        </Form.Group>

                        {/* Trainers */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Trainers</Form.Label>
                            {isEditing ? (
                                <Select
                                    isMulti
                                    options={trainers}
                                    value={trainers.filter(t => editableTraining.trainersIds.includes(t.value))}
                                    onChange={(selected) => setEditableTraining({ ...editableTraining, trainersIds: selected.map(s => s.value) })}
                                    placeholder="Select Trainers"
                                    required
                                />
                            ) : (
                                <p className="border rounded p-2 bg-light">
                                    {training.trainersIds.length > 0
                                        ? training.trainersIds.map(id => trainerNames[id] || id).join(", ")
                                        : "No trainers assigned"}
                                </p>
                            )}
                        </Form.Group>

                        {/* Training Type */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Training Type</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    as="select"
                                    value={editableTraining.trainingType}
                                    onChange={(e) => setEditableTraining({ ...editableTraining, trainingType: e.target.value })}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {trainingTypes.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </Form.Control>
                            ) : (
                                <p className="border rounded p-2 bg-light">{training.trainingType}</p>
                            )}
                        </Form.Group>

                        {/* Files Section */}
                        {/* Files Section */}
                        <Form.Group className="mb-3">
                            <Row className="align-items-center">
                                <Col xs="auto">
                                    <Form.Label className="fw-bold mb-0">Files</Form.Label>
                                </Col>
                                <Col xs="auto">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setShowFileUploadModal(true)}
                                    >
                                        Upload Files
                                    </Button>
                                </Col>
                            </Row>
                            <div className="mt-2">
                                {files && files.length > 0 ? (
                                    <>
                                        {files.map((file, index) => {
                                            const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                            return (
                                                <Row
                                                    key={file.id}
                                                    className="align-items-center"
                                                    style={{ backgroundColor: rowBgColor, padding: '0.5rem 0' }}
                                                >
                                                    <Col>
                                                        <a
                                                            onClick={() => handleFileOpen(file.id)}
                                                            style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            {file.fileName}
                                                        </a>
                                                    </Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="link"
                                                            onClick={() => handleFileDownload(file.id, file.fileName)}
                                                            className="p-0"
                                                        >
                                                            <FaDownload />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p className="mt-2">No files uploaded.</p>
                                )}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {isEditing ? (
                        <>
                            <Button variant="primary" onClick={handleSave}>Save</Button>
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                            <Button variant="danger" onClick={() => onDelete(training.id)}>Delete</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
            <FileUploadModal
                show={showFileUploadModal}
                handleClose={() => setShowFileUploadModal(false)}
                uploadEndpoint={`/training/upload/${training.id}`}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default TrainingDetailsModal;
