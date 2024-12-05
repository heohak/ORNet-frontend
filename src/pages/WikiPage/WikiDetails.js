import React, { useState } from "react";
import axios from "axios";
import { Modal, Form, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import config from "../../config/config";
import DeleteConfirmModal from "./DeleteConfirmModal";

function WikiDetails({ show, onClose, reFetch, wiki }) {
    const [problem, setProblem] = useState(wiki.problem);
    const [solution, setSolution] = useState(wiki.solution);
    const [isEditingProblem, setIsEditingProblem] = useState(false);
    const [isEditingSolution, setIsEditingSolution] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    const handleDelete = () => {
        reFetch();
        onClose();
    };

    const handleSaveProblem = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/wiki/update/${wiki.id}`, {
                problem,
                solution, // Include solution to ensure both fields are updated
            });
            setIsEditingProblem(false);
            reFetch();
        } catch (error) {
            console.error("Error updating the problem:", error);
        }
    };

    const handleSaveSolution = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/wiki/update/${wiki.id}`, {
                problem, // Include problem to ensure both fields are updated
                solution,
            });
            setIsEditingSolution(false);
            reFetch();
        } catch (error) {
            console.error("Error updating the solution:", error);
        }
    };

    return (
        <>
        <Modal show={show} onHide={onClose} size="xl">
            <Modal.Header closeButton />
            <Modal.Body>
                <Card.Text>
                    {/* Problem Section */}
                    <div className="mb-5" style={{ position: "relative"}}>
                        {isEditingProblem ? (
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                            />
                        ) : (
                            <h3 className="fw-bold">{problem}</h3>
                        )}
                        <FontAwesomeIcon
                            icon={isEditingProblem ? faCheck : faEdit}
                            onClick={isEditingProblem ? handleSaveProblem : () => setIsEditingProblem(true)}
                            style={{
                                position: "absolute",
                                top: "5px",
                                right: "10px",
                                cursor: "pointer",
                                opacity: 0.7,
                            }}
                        />
                    </div>

                    {/* Solution Section */}
                    <div style={{ position: "relative" }}>
                        {isEditingSolution ? (
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                            />
                        ) : (
                            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                {solution}
                            </pre>
                        )}
                        <FontAwesomeIcon
                            icon={isEditingSolution ? faCheck : faEdit}
                            onClick={isEditingSolution ? handleSaveSolution : () => setIsEditingSolution(true)}
                            style={{
                                position: "absolute",
                                top: "5px",
                                right: "10px",
                                cursor: "pointer",
                                opacity: 0.7,
                            }}
                        />
                    </div>
                </Card.Text>
            </Modal.Body>
            <Modal.Footer>
                {/* Delete icon */}
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            wikiId={wiki.id}
            onConfirm={handleDelete}
        />
        </>
    );
}

export default WikiDetails;
