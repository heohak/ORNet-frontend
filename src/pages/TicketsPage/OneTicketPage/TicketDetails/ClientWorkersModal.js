import React, { useEffect, useState } from 'react';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../../config/config";

const ClientWorkersModal = ({ show, handleClose, clientId, selectedWorkers, onSave, ticketId }) => {
    const [clientWorkers, setClientWorkers] = useState([]);
    const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

    useEffect(() => {
        if (show && clientId) {
            fetchClientWorkers(clientId);
        }
    }, [show, clientId]);

    useEffect(() => {
        setSelectedWorkerIds(selectedWorkers);
    }, [selectedWorkers]);

    const fetchClientWorkers = async (clientId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/${clientId}`);
            setClientWorkers(response.data);
        } catch (error) {
            console.error('Error fetching client workers:', error);
        }
    };

    const handleWorkerToggle = (workerId) => {
        setSelectedWorkerIds(prev =>
            prev.includes(workerId) ? prev.filter(id => id !== workerId) : [...prev, workerId]
        );
    };

    const handleSave = async(ticketId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticketId}`, {
                contactIds: selectedWorkerIds,
            });
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
        onSave(selectedWorkerIds);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Client Workers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {clientWorkers.map(worker => (
                        <ListGroup.Item key={worker.id}>
                            <Form.Check
                                type="checkbox"
                                label={
                                    <>
                                        {worker.firstName + " " + worker.lastName}
                                        <br />
                                        <small className="text-muted">{worker.title}</small>
                                    </>
                                }
                                checked={selectedWorkerIds.includes(worker.id)}
                                onChange={() => handleWorkerToggle(worker.id)}
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={()=> handleSave(ticketId)}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ClientWorkersModal;
