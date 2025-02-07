import React, { useState } from "react";
import { Modal, Card, Alert, Button } from "react-bootstrap";

function WikiDetails({ show, onClose, reFetch, wiki }) {
    const [error] = useState(null); // No delete or edit logic here now, so no error changes

    return (
        <Modal backdrop="static" show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton />
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Card.Text>
                    <h3 className="fw-bold mb-4">{wiki.problem}</h3>
                    <p style={{whiteSpace: "pre-wrap", wordWrap: "break-word"}}>
                        {wiki.solution}
                    </p>
                </Card.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-info" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default WikiDetails;
