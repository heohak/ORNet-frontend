import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import TrainingService from './TrainingService';
import axiosInstance from '../../config/axiosInstance';
import Select from 'react-select';
import ReactDatePicker from "react-datepicker";

const EditTrainingModal = ({ show, onHide, training, onSave }) => {
    const [editableTraining, setEditableTraining] = useState(training);
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const trainingTypes = ['ON_SITE', 'TEAMS'];

    useEffect(() => {
        if (training) {
            setEditableTraining(training);
            fetchClients();
            fetchTrainers();
        }
    }, [training]);

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

    const handleSave = async () => {
        await TrainingService.updateTraining(editableTraining.id, editableTraining);
        onSave(editableTraining);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Training</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" value={editableTraining.name} onChange={(e) => setEditableTraining({ ...editableTraining, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" value={editableTraining.description} onChange={(e) => setEditableTraining({ ...editableTraining, description: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <ReactDatePicker
                            selected={editableTraining.trainingDate ? new Date(editableTraining.trainingDate) : null}
                            onChange={(date) => setEditableTraining({ ...editableTraining, trainingDate: date ? date.toISOString().split('T')[0] : '' })}
                            dateFormat="dd.MM.yyyy"
                            className="form-control"
                            placeholderText="Select a date"
                            isClearable
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Client</Form.Label>
                        <Form.Control as="select" value={editableTraining.clientId} onChange={(e) => setEditableTraining({ ...editableTraining, clientId: e.target.value })} required>
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.fullName}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control as="select" value={editableTraining.locationId} onChange={(e) => setEditableTraining({ ...editableTraining, locationId: e.target.value })} disabled={!editableTraining.clientId}>
                            <option value="">{editableTraining.clientId ? "Select Location" : "Choose client first"}</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Trainers</Form.Label>
                        <Select
                            isMulti
                            options={trainers}
                            value={trainers.filter(t => editableTraining.trainersIds.includes(t.value))}
                            onChange={(selected) => setEditableTraining({ ...editableTraining, trainersIds: selected.map(s => s.value) })}
                            placeholder="Select Trainers"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Training Type</Form.Label>
                        <Form.Control as="select" value={editableTraining.trainingType} onChange={(e) => setEditableTraining({ ...editableTraining, trainingType: e.target.value })} required>
                            <option value="">Select Type</option>
                            {trainingTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditTrainingModal;
