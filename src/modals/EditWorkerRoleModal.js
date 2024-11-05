import { Modal, ListGroup } from "react-bootstrap";
import React from "react";

function EditWorkerRoleModal({ show, handleClose, workerList }) {
    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Cannot delete classificator, because it is still connected with the following contacts:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {workerList.map(worker => (
                            <ListGroup.Item key={worker.id}>
                                <div>
                                    <strong>Contact: {worker.firstName + " " + worker.lastName}</strong>
                                    <br />
                                    <small className="text-muted">Customer: {worker.employerFullName}</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default EditWorkerRoleModal;