import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from "axios";
import config from "../../config/config";

function DeleteConfirmModal({ show, onClose, wikiId, onConfirm }) {


    const handleDeleteWiki = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/wiki/${wikiId}`);
            onConfirm();
            onClose();
        } catch (error) {
            console.error("Error deleting wiki", error);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this wiki entry?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteWiki}>
                    Confirm Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmModal;
