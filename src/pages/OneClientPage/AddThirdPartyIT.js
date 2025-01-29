import React, { useState, useEffect } from 'react';
import axiosInstance from "../../config/axiosInstance";
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import config from "../../config/config";
import '../../css/DarkenedModal.css';

// Import the separate AddThirdPartyITModal
import AddThirdPartyITModal from "./AddThirdPartyITModal";

function AddThirdPartyIT({
                             clientId,
                             show,
                             onClose,
                             setRefresh,
                             clientThirdParties
                         }) {
    const [availableThirdParties, setAvailableThirdParties] = useState([]);
    const [selectedThirdParty, setSelectedThirdParty] = useState(null);
    const [error, setError] = useState(null);

    // For the separate "Add New Third Party" modal
    const [showAddNewModal, setShowAddNewModal] = useState(false);

    // For controlling submission of the main form
    const [isSubmittingMainForm, setIsSubmittingMainForm] = useState(false);

    // 1. Fetch third parties not yet assigned to this client
    useEffect(() => {
        const fetchThirdParties = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/third-party/all`);

                // Build a set of IDs for already-used third parties
                const clientThirdPartySet = new Set(clientThirdParties.map(item => item.id));

                // Exclude items in the parent's "already assigned" list
                const filteredList = response.data.filter(
                    item => !clientThirdPartySet.has(item.id)
                );

                setAvailableThirdParties(
                    filteredList.map(thirdParty => ({
                        value: thirdParty.id,
                        label: thirdParty.name
                    }))
                );
            } catch (err) {
                setError(err.message);
            }
        };

        fetchThirdParties();
    }, [clientThirdParties]);

    // 2. When the user submits the main form to associate a third party with this client
    const handleSubmit = async e => {
        e.preventDefault();
        if (isSubmittingMainForm) return;
        setIsSubmittingMainForm(true);
        setError(null);

        if (!selectedThirdParty) {
            setError("Please select a third-party IT.");
            setIsSubmittingMainForm(false);
            return;
        }

        try {
            // PUT or POST to link the chosen thirdParty to the client
            await axiosInstance.put(
                `${config.API_BASE_URL}/client/third-party/${clientId}/${selectedThirdParty.value}`
            );

            // Refresh the parent's data, if needed
            setRefresh(prev => !prev);

            // Close the modal
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmittingMainForm(false);
            // Optionally clear the selection
            setSelectedThirdParty(null);
        }
    };

    // 3. Callback once a brand-new third party is created in AddThirdPartyITModal
    const handleNewThirdPartyIT = newThirdPartyObject => {
        // 3a. Convert the newly created item to the same format your "Select" needs
        const newOption = {
            value: newThirdPartyObject.id,
            label: newThirdPartyObject.name
        };

        // 3b. Add it to the dropdown list
        setAvailableThirdParties(prev => [...prev, newOption]);

        // 3c. (Optionally) auto-select it
        setSelectedThirdParty(newOption);

        // 3d. Close the "Add new third party" modal
        setShowAddNewModal(false);
    };

    return (
        <Modal backdrop="static" show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Third-Party IT</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}

                {/* "Choose Existing" form */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Third-Party IT</Form.Label>{" "}
                        {/* Add New link => open AddThirdPartyITModal */}
                        <Button
                            variant="link"
                            onClick={() => setShowAddNewModal(true)}
                            className="px-0 py-0"
                        >
                            Add New
                        </Button>
                        <Select
                            options={availableThirdParties}
                            value={selectedThirdParty}
                            onChange={setSelectedThirdParty}
                            placeholder="Select a third-party IT"
                        />
                    </Form.Group>

                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmittingMainForm}
                        >
                            {isSubmittingMainForm ? "Assigning..." : "Add Third-Party IT"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>

            {/* 4. "Add New Third-Party" Modal => Reusable Child */}
            <AddThirdPartyITModal
                show={showAddNewModal}
                onHide={() => setShowAddNewModal(false)}
                onNewThirdPartyIT={handleNewThirdPartyIT}
            />
        </Modal>
    );
}

export default AddThirdPartyIT;
