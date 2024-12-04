import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from "axios";
import config from "../../config/config";

function AddWikiModal({ show, onClose, reFetch }) {
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleAdd = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axios.post(`${config.API_BASE_URL}/wiki/add`, {
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
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Wiki</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleAdd}>
                    <Form.Group controlId="formProblem">
                        <Form.Label>Problem</Form.Label>
                        <Form.Control
                            type="text"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Enter problem"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formSolution" className="mt-3">
                        <Form.Label>Solution</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            placeholder="Enter solution"
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={onClose}>Cancel</Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'Add Wiki'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddWikiModal;
