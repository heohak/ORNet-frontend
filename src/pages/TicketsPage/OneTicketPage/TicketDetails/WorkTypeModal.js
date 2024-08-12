import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../../config/config";

const WorkTypeModal = ({ show, handleClose, selectedWorkTypes, onSave, ticketId }) => {
    const [workTypes, setWorkTypes] = useState([]);
    const [selectedWorkTypeIds, setSelectedWorkTypeIds] = useState([]);
    const [newWorkType, setNewWorkType] = useState('');

    useEffect(() => {
        const fetchWorkTypes = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`);
                setWorkTypes(response.data);
            } catch (error) {
                console.error('Error fetching work types:', error);
            }
        };

        fetchWorkTypes();
    }, []);

    useEffect(() => {
        setSelectedWorkTypeIds(selectedWorkTypes || []);
    }, [selectedWorkTypes]);

    const handleSave = async(ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticketId}`, {
                workTypeIds: selectedWorkTypeIds
            });
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
        onSave(selectedWorkTypeIds);
        handleClose();
    };

    const handleWorkTypeToggle = (workTypeId) => {
        setSelectedWorkTypeIds(prev =>
            prev.includes(workTypeId) ? prev.filter(id => id !== workTypeId) : [...prev, workTypeId]
        );
    };

    const handleAddNewWorkType = async () => {
        if (newWorkType.trim() === "") {
            return;
        }
        try {
            await axios.post(`${config.API_BASE_URL}/work-type/classificator/add`, {
                workType: newWorkType,
            });
            setNewWorkType('');
            const response = await axios.get(`${config.API_BASE_URL}/work-type/classificator/all`);
            setWorkTypes(response.data);
        } catch (error) {
            console.error('Error adding new work type:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Work Types</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {workTypes.map(workType => (
                        <ListGroup.Item key={workType.id}>
                            <Form.Check
                                type="checkbox"
                                label={workType.workType}
                                checked={selectedWorkTypeIds.includes(workType.id)}
                                onChange={() => handleWorkTypeToggle(workType.id)}
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <Form className="mt-3">
                    <Form.Group controlId="newWorkType">
                        <Form.Label>Add a New Work Type</Form.Label>
                        <Form.Control
                            type="text"
                            value={newWorkType}
                            onChange={e => setNewWorkType(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddNewWorkType} className="mt-2">
                        Add Work Type
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={()=> handleSave(ticketId)}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default WorkTypeModal;
