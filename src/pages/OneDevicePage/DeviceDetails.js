import React, {useEffect, useState} from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';

function DeviceDetails({ device, navigate, setShowFileUploadModal }) {
    const [showDeviceFieldModal, setShowDeviceFieldModal] = useState(false);
    const [visibleDeviceFields, setVisibleDeviceFields] = useState({});

    useEffect(() => {
        if (device) {
            initializeVisibleFields(device);
        }
    }, [device]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('deviceVisibilityState');
        if (savedVisibilityState) {
            setVisibleDeviceFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = Object.keys(data).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleDeviceFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (field) => {
        setVisibleDeviceFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem('deviceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        return Object.keys(data).map(key => {
            if (data[key] !== null && visibleDeviceFields[key]) {
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
            <h1 className="mb-4">
                Device Details
                <Button variant="link" className="float-end" onClick={() => setShowDeviceFieldModal(true)}>Edit Fields</Button>
            </h1>
            {device ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{device.deviceName}</Card.Title>
                        {renderFields(device)}
                        <Button className="me-2" onClick={() => setShowFileUploadModal(true)}>Upload Files</Button>
                        <Button onClick={() => navigate(-1)}>Back</Button>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No device details available.</Alert>
            )}
            <Modal show={showDeviceFieldModal} onHide={() => setShowDeviceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Device Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {device && Object.keys(device).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleDeviceFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeviceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeviceDetails;
