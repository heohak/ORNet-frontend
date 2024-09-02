import { Modal, ListGroup } from "react-bootstrap";
import React from "react";

function EditDeviceModal({ show, handleClose, deviceList }) {
    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Cannot delete classificator, because it is still connected with the following devices:
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {deviceList.map(device => (
                            <ListGroup.Item key={device.id}>
                                <div>
                                    <strong>{device.deviceName}</strong>
                                    <br />
                                    <small className="text-muted">{device.serialNumber}</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default EditDeviceModal;