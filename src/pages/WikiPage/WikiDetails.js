import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {Container, Spinner, Alert, Card, Button, Modal, Form} from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa'; // Icons for delete and edit
import config from "../../config/config";

function WikiDetails({ show, onClose, reFetch, wiki }) {
    const [problem, setProblem] = useState(wiki.problem);
    const [solution, setSolution] = useState(wiki.solution);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const handleDelete = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/wiki/${wiki.id}`);
            reFetch();
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditToggle = (e) => {
        e.preventDefault()
        if (editMode) {
            // If in edit mode, save the changes to the server
            handleSaveChanges();
        }
        setEditMode(!editMode);
    }

    const handleSaveChanges = async() => {
        try {
            await axios.put(`${config.API_BASE_URL}/wiki/update/${wiki.id}`, {
                solution: solution,
                problem: problem
            });


        } catch (error) {
            console.error("Error saving wiki info", error)
        }
    }

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{problem}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card.Text>
                    <strong>Solution:</strong>
                    {editMode ? (
                        <Form.Control
                            type="text"
                            name="solution"
                            value={solution}
                            onChange={setSolution}
                            required
                        />
                    ) : solution}
                </Card.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    <FaTrash /> Delete
                </Button>
                <Button variant="warning" onClick={handleEditToggle}>
                    <FaEdit /> Edit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default WikiDetails;
