import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row } from 'react-bootstrap';
import TrainingService from './TrainingService';
import axiosInstance from '../../config/axiosInstance';
import Select from 'react-select';
import ReactDatePicker from "react-datepicker";
import { parseLocalDate, formatLocalDate } from "../../utils/DateUtils";

const AddTrainingModal = ({ show, onHide, onSave, clientId }) => {
    const [training, setTraining] = useState({
        name: "",
        description: "",
        trainingDate: "",
        clientId: clientId || "",
        locationId: "",
        trainersIds: [],
        trainingType: ""
    });
    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const trainingTypes = ['ON_SITE', 'TEAMS'];

    useEffect(() => {
        fetchClients();
        fetchTrainers();
    }, []);

    useEffect(() => {
        if (training.clientId) {
            fetchLocations(training.clientId);
        } else {
            setLocations([]);
            setTraining(prev => ({ ...prev, locationId: "" }));
        }
    }, [training.clientId]);

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

    const handleSave = async (e) => {
        e.preventDefault();
        await TrainingService.addTraining(training);
        onSave();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Form onSubmit={handleSave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Training</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" value={training.name} onChange={(e) => setTraining({ ...training, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" value={training.description} onChange={(e) => setTraining({ ...training, description: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <ReactDatePicker
                            selected={parseLocalDate(training.trainingDate)}
                            onChange={(date) => setTraining({ ...training, trainingDate: date ? formatLocalDate(date) : '' })}
                            dateFormat="dd.MM.yyyy"
                            className="form-control"
                            placeholderText="Select a date"
                            isClearable
                            required
                        />
                    </Form.Group>
                    {!clientId && (
                        <Form.Group className="mb-3">
                            <Form.Label>Client</Form.Label>
                            <Form.Control as="select" value={training.clientId} onChange={(e) => setTraining({ ...training, clientId: e.target.value })} required >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.fullName}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control as="select" value={training.locationId} onChange={(e) => setTraining({ ...training, locationId: e.target.value })} disabled={!training.clientId}>
                            <option value="">{training.clientId ? "Select Location" : "Choose client first"}</option>
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
                            value={trainers.filter(t => training.trainersIds.includes(t.value))}
                            onChange={(selected) => setTraining({ ...training, trainersIds: selected.map(s => s.value) })}
                            placeholder="Select Trainers"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Training Type</Form.Label>
                        <Form.Control as="select" value={training.trainingType} onChange={(e) => setTraining({ ...training, trainingType: e.target.value })} required >
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

export default AddTrainingModal;
