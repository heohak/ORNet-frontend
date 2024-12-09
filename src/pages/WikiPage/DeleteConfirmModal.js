import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteConfirmModal({ show, handleClose, handleDelete }) {
    const confirmDelete = async () => {
        await handleDelete(); // This calls the parent's delete logic, which also closes the EditWikiModal
        handleClose(); // Now close the DeleteConfirmModal itself
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this wiki entry?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                    Confirm Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmModal;
