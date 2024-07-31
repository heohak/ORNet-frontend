// WorkTypeModal.js
import React, { useState, useEffect } from 'react';
import {Modal, Button, Form, ListGroup} from 'react-bootstrap';
import axios from 'axios';
import config from "../config/config";

const WorkTypeModal = ({ show, handleClose, selectedWorkTypes, onSave }) => {
    const [workTypes, setWorkTypes] = useState([]);
    const [selectedWorkTypeIds, setSelectedWorkTypeIds] = useState([]);

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

    const handleSave = () => {
        onSave(selectedWorkTypeIds);
        handleClose();
    };

    const handleWorkTypeToggle = (workTypeId) => {
        setSelectedWorkTypeIds(prev =>
            prev.includes(workTypeId) ? prev.filter(id => id !== workTypeId) : [...prev, workTypeId]
        );
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default WorkTypeModal;
