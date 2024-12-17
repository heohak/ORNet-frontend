// AddWorkTypeModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../config/config";

const AddWorkTypeModal = ({ show, handleClose, onAdd }) => {
    const [workType, setWorkType] = useState('');

    const handleAddWorkType = async () => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/work-type/classificator/add`, {
                workType,
            });
            setWorkType('');
            onAdd(response.data); // Refresh work types list in parent component
            handleClose();
        } catch (error) {
            console.error('Error adding new work type:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Work Type</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="newWorkType">
                    <Form.Label>Work Type</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Work Type"
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleAddWorkType}>
                    Add Work Type
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddWorkTypeModal;
