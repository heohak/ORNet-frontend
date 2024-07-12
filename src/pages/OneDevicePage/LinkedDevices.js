import React, {useEffect, useState} from 'react';
import { Card, Button, Modal, Form, ListGroup, Alert } from 'react-bootstrap';

function LinkedDevices({
                           linkedDevices,
                           showModal,
                           setShowModal,
                           availableLinkedDevices,
                           selectedLinkedDeviceId,
                           setSelectedLinkedDeviceId,
                           handleLinkDevice
                       }) {
    const [visibleLinkedDeviceFields, setVisibleLinkedDeviceFields] = useState({});
    const [showLinkedDeviceFieldModal, setShowLinkedDeviceFieldModal] = useState(false);

    useEffect(() => {
        if (linkedDevices.length > 0) {
            initializeVisibleFields(linkedDevices[0]);
        }
    }, [linkedDevices]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('linkedDeviceVisibilityState');
        if (savedVisibilityState) {
            setVisibleLinkedDeviceFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = Object.keys(data).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleLinkedDeviceFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (field) => {
        setVisibleLinkedDeviceFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem('linkedDeviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        return Object.keys(data).map(key => {
            if (data[key] !== null && visibleLinkedDeviceFields[key]) {
                return (
                    <Card.Text key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {data[key]}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    return (
        <>
            <h2 className="mb-4">
                Linked Devices
                <Button variant="link" className="float-end mb-3" onClick={() => setShowLinkedDeviceFieldModal(true)}>Edit Fields</Button>
            </h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>Link Device</Button>
            {linkedDevices.length > 0 ? (
                <ListGroup className="mt-3">
                    {linkedDevices.map((linkedDevice) => (
                        <ListGroup.Item key={linkedDevice.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{linkedDevice.name}</Card.Title>
                                    {renderFields(linkedDevice)}
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No linked devices available.</Alert>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Link a Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectDevice">
                        <Form.Label>Select Device to Link</Form.Label>
                        <Form.Control as="select" value={selectedLinkedDeviceId} onChange={(e) => setSelectedLinkedDeviceId(e.target.value)}>
                            <option value="">Select a device...</option>
                            {availableLinkedDevices.map((linkedDevice) => (
                                <option key={linkedDevice.id} value={linkedDevice.id}>
                                    {linkedDevice.name} (Serial: {linkedDevice.serialNumber})
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleLinkDevice}>Link Device</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showLinkedDeviceFieldModal} onHide={() => setShowLinkedDeviceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Linked Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {linkedDevices[0] && Object.keys(linkedDevices[0]).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleLinkedDeviceFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLinkedDeviceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LinkedDevices;
