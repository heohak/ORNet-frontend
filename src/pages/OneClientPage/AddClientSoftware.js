// AddClientSoftware.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Container } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import Select from 'react-select';
import AddTechnicalInfoModal from './AddTechnicalInfoModal'; // Import the new component
import '../../css/DarkenedModal.css';
import axiosInstance from "../../config/axiosInstance";

function AddClientSoftware({ clientId, show, handleClose, setRefresh, client }) {
    const [softwareList, setSoftwareList] = useState([]);
    const [selectedSoftware, setSelectedSoftware] = useState(null);
    const [error, setError] = useState(null);
    const [showAddNewSoftwareModal, setShowAddNewSoftwareModal] = useState(false);
    const [isSubmittingMainForm, setIsSubmittingMainForm] = useState(false);

    useEffect(() => {
        fetchSoftware();
    }, []);

    const fetchSoftware = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/software/not-used`);
            const sortedSofts = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setSoftwareList(sortedSofts.map(software => ({ value: software.id, label: software.name })));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddExistingSoftware = async () => {
        if (isSubmittingMainForm) return;
        setIsSubmittingMainForm(true);
        if (selectedSoftware) {
            try {
                await axiosInstance.put(`${config.API_BASE_URL}/software/add/client/${selectedSoftware.value}/${clientId}`);
                setRefresh(prev => !prev); // Trigger refresh by toggling state
                fetchSoftware();
                handleClose();
                setSelectedSoftware(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsSubmittingMainForm(false);
            }
        } else {
            setError('Please select a software');
            setIsSubmittingMainForm(false);
        }
    };

    return (
        <>
            <Modal
                backdrop="static"
                show={show}
                onHide={handleClose}
                dialogClassName={showAddNewSoftwareModal ? 'dimmed' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Technical Information to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Select Existing Tech Info</Form.Label>
                            <Button variant="link" onClick={() => setShowAddNewSoftwareModal(true)}>
                                Add New
                            </Button>
                            <Select
                                options={softwareList}
                                value={selectedSoftware}
                                onChange={setSelectedSoftware}
                                placeholder="Select existing Tech Info"
                            />
                        </Form.Group>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddExistingSoftware} disabled={isSubmittingMainForm}>
                        {isSubmittingMainForm ? 'Adding...' : 'Add Selected Tech Info'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Use AddTechnicalInfoModal */}
            <AddTechnicalInfoModal
                backdrop="static"
                show={showAddNewSoftwareModal}
                onHide={() => setShowAddNewSoftwareModal(false)}
                onAddTechnicalInfo={() => {
                    setRefresh(prev => !prev);
                    setShowAddNewSoftwareModal(false);
                    handleClose();
                }}
                clientId={clientId}
            />
        </>
    );
}

export default AddClientSoftware;
