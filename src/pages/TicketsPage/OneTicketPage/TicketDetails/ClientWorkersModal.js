import React, { useEffect, useState } from 'react';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import config from "../../../../config/config";
import AddContactModal from "../../AddTicketPage/AddContactModal";

const ClientWorkersModal = ({ show, handleClose, clientId, selectedWorkers, onSave, ticketId, locations }) => {
    const [clientWorkers, setClientWorkers] = useState([]);
    const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
    const [showAddContactModal, setShowAddContactModal] = useState(false);

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
        handleClose(); // This will reset the selected workers
    };

    const handleCancel = () => {
        setSelectedWorkerIds(selectedWorkers); // Reset to initial selection
        handleClose(); // Close the modal
    };

    const handleAddContactClose = () => {
        setShowAddContactModal(false);
    };

    const handleAdd = () => {
        fetchClientWorkers(clientId); // Refresh the client workers list after adding a new contact
    };

    return (
        <Modal show={show} onHide={handleCancel}> {/* Use handleCancel instead of handleClose */}
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
            <Button variant="link" onClick={() => setShowAddContactModal(true)} style={{ marginRight: 'auto' }}>
                Add a new contact
            </Button>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}> {/* Use handleCancel */}
                    Cancel
                </Button>
                <Button variant="primary" onClick={()=> handleSave(ticketId)}>
                    Save
                </Button>
            </Modal.Footer>
            <AddContactModal
                show={showAddContactModal}
                handleClose={handleAddContactClose}
                clientId={clientId}
                locations={locations}
                onAdd={handleAdd}
            />
        </Modal>
    );
};

export default ClientWorkersModal;
