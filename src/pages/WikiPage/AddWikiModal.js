import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../config/axiosInstance";
import config from "../../config/config";
import TextareaAutosize from 'react-textarea-autosize';

function AddWikiModal({ show, onClose, reFetch }) {
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.post(`${config.API_BASE_URL}/wiki/add`, {
                problem,
                solution,
            });
            reFetch();
            onClose();
            setProblem('');
            setSolution('');
        } catch (error) {
            console.error("Error adding or fetching wikis", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal backdrop="static" show={show} onHide={onClose} size="lg">
            <Form onSubmit={handleAdd}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Wiki</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formProblem">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Enter title"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formSolution" className="mt-3">
                        <Form.Label>Description</Form.Label>
                        {/* Use TextareaAutosize to auto-expand with more text */}
                        <TextareaAutosize
                            minRows={3}
                            style={{
                                width: '100%',
                                padding: '.375rem .75rem',
                                border: '1px solid #ced4da',
                                borderRadius: '.25rem'
                            }}
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            placeholder="Enter description"
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Wiki'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AddWikiModal;
