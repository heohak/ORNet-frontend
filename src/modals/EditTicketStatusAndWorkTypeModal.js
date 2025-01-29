import { Modal, ListGroup } from "react-bootstrap";
import React from "react";

function EditTicketStatusAndWorkTypeModal({ show, handleClose, ticketList }) {
    return (
        <>
            <Modal backdrop="static" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Cannot delete classificator, because it is still connected with the following tickets:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {ticketList.map(ticket => (
                            <ListGroup.Item key={ticket.id}>
                                <div>
                                    <strong>{ticket.title}</strong>
                                    <br />
                                    <small className="text-muted">Numeration: {ticket.baitNumeration}</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default EditTicketStatusAndWorkTypeModal;