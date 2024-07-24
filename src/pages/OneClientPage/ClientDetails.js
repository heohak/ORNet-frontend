import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';

// Define specific fields to display
const specificFields = [
    'fullName', 'shortName', 'pathologyClient', 'surgeryClient', 'editorClient', 'otherMedicalInformation', 'lastMaintenance', 'nextMaintenance'
];

function ClientDetails({ client, navigate }) {
    const [showClientFieldModal, setShowClientFieldModal] = useState(false);
    const [visibleDeviceFields, setVisibleDeviceFields] = useState({});

    useEffect(() => {
        if (client) {
            initializeVisibleFields(client);
        }
    }, [client]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('deviceVisibilityState');
        if (savedVisibilityState) {
            setVisibleDeviceFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = specificFields.reduce((acc, key) => {
                if (key in data) {
                    acc[key] = true;
                }
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
        return specificFields.map(key => {
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
            <h1 className="mb-4" style={{display: "flex", justifyContent: "space-between"}}>
                <Button onClick={() => navigate(-1)}>Back</Button>
                {client ? `${client.shortName} Details` : 'Client Details'}
                <Button variant="link" className="float-end" onClick={() => setShowClientFieldModal(true)}>Edit Fields</Button>
            </h1>

            {client ? (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>{client.name}</Card.Title>
                        {renderFields(client)}
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">No client details available.</Alert>
            )}
            <Modal show={showClientFieldModal} onHide={() => setShowClientFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Fields for {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {specificFields.map(key => (
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
                    <Button variant="secondary" onClick={() => setShowClientFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientDetails;
