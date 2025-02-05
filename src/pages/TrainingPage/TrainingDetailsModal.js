import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TrainingDetailsModal = ({ show, onHide, training, trainerNames, clientNames, locationNames, onEdit, onDelete }) => {
    if (!training) return null;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Training Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Name:</strong> {training.name}</p>
                <p><strong>Description:</strong> {training.description}</p>
                <p><strong>Client:</strong> {clientNames[training.clientId] || training.clientId}</p>
                <p><strong>Location:</strong> {locationNames[training.locationId] || training.locationId}</p>
                <p><strong>Date:</strong> {training.trainingDate}</p>
                <p><strong>Type:</strong> {training.trainingType}</p>
                <p><strong>Trainers:</strong> {training.trainersIds.map(id => trainerNames[id] || id).join(", ")}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onEdit(training)}>Edit</Button>
                <Button variant="danger" onClick={onDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TrainingDetailsModal;
