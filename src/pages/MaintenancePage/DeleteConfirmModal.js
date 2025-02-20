import axiosInstance from "../../config/axiosInstance";
import {Alert, Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";


const DeleteConfirmModal = ({show, onHide, onDelete, maintenanceId, maintenanceName}) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const confirmDelete = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            // Send delete request to the server
            const response = await axiosInstance.delete(`/admin/maintenance/${maintenanceId}`);

            if (response.status === 200) {
                // Successfully deleted the maintenance
                onDelete()  // Close the modal
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Handle unauthorized error (401)
                setError("You are not authorized to delete this maintenance. Only admins can delete files.");
            } else {
                setError("An error occurred while trying to delete the maintenance.");
            }
        } finally {
            setLoading(false);
            setError(null);
            onHide();
        }
    };



    return(
        <Modal backdrop="static" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Maintenance Delete</Modal.Title>
            </Modal.Header>
            <Form onSubmit={confirmDelete}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <p>Are you sure you want to delete this maintenance: {maintenanceName}?</p>
                    <p className="fw-bold">This change is permanent!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default DeleteConfirmModal