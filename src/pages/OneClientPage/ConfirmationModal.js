// src/components/ConfirmationModal.js

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ConfirmationModal({ show, onHide, title, message, onConfirm }) {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;
