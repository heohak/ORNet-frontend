import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import DeleteConfirmModal from "./DeleteConfirmModal";
import axiosInstance from "../../config/axiosInstance";

function EditWikiModal({ show, onHide, wiki, reFetch }) {
    const [problem, setProblem] = useState(wiki?.problem || '');
    const [solution, setSolution] = useState(wiki?.solution || '');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/wiki/update/${wiki.id}`, {
                problem,
                solution
            });
            reFetch();
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirmed = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/wiki/${wiki.id}`);
            reFetch();
            onHide(); // Close the EditWikiModal
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Wiki</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSave}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="problem">
                            <Form.Label>Problem</Form.Label>
                            <Form.Control
                                type="text"
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="solution">
                            <Form.Label>Solution</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowDeleteConfirm(true);
                            }}
                            className="me-2"
                        >
                            Delete
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <DeleteConfirmModal
                show={showDeleteConfirm}
                handleClose={() => setShowDeleteConfirm(false)}
                handleDelete={handleDeleteConfirmed} // This calls the parent's delete logic
            />
        </>
    );
}

export default EditWikiModal;
