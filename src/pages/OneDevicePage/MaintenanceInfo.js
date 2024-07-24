import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Alert, ListGroup } from 'react-bootstrap';

function MaintenanceInfo({
                             maintenanceInfo,
                             showMaintenanceModal,
                             setShowMaintenanceModal,
                             handleAddMaintenance,
                             setMaintenanceName,
                             setMaintenanceDate,
                             setMaintenanceComment,
                             setFiles // Add setFiles prop
                         }) {
    const [visibleMaintenanceFields, setVisibleMaintenanceFields] = useState({});
    const [showMaintenanceFieldModal, setShowMaintenanceFieldModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        if (maintenanceInfo.length > 0) {
            initializeVisibleFields(maintenanceInfo[0]);
        }
    }, [maintenanceInfo]);

    const initializeVisibleFields = (data) => {
        const savedVisibilityState = localStorage.getItem('maintenanceVisibilityState');
        if (savedVisibilityState) {
            setVisibleMaintenanceFields(JSON.parse(savedVisibilityState));
        } else {
            const initialVisibleFields = Object.keys(data).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setVisibleMaintenanceFields(initialVisibleFields);
        }
    };

    const handleFieldToggle = (field) => {
        setVisibleMaintenanceFields(prevVisibleFields => {
            const newVisibleFields = {
                ...prevVisibleFields,
                [field]: !prevVisibleFields[field]
            };
            localStorage.setItem('maintenanceVisibilityState', JSON.stringify(newVisibleFields));
            return newVisibleFields;
        });
    };

    const renderFields = (data) => {
        return Object.keys(data).map(key => {
            if (data[key] !== null && visibleMaintenanceFields[key]) {
                return (
                    <Card.Text key={key} className="mb-1">
                        <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong> {data[key]}
                    </Card.Text>
                );
            }
            return null;
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
        setFiles([...selectedFiles, ...files]);
    };

    const handleFileRemove = (fileName) => {
        const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
        setSelectedFiles(updatedFiles);
        setFiles(updatedFiles);
    };

    return (
        <>
            <h2 className="mb-4">
                Maintenance Information
                <Button variant="link" className="float-end mb-3" onClick={() => setShowMaintenanceFieldModal(true)}>Edit Fields</Button>
            </h2>
            <Button variant="primary" onClick={() => setShowMaintenanceModal(true)} className="mb-3">Add Maintenance</Button>
            {maintenanceInfo.length > 0 ? (
                maintenanceInfo.map((maintenance, index) => (
                    <Card key={index} className="mb-4">
                        <Card.Body>
                            <Card.Title>Maintenance Details</Card.Title>
                            {renderFields(maintenance)}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <Alert variant="info">No maintenance information available.</Alert>
            )}
            <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="maintenanceName">
                        <Form.Label>Maintenance Name</Form.Label>
                        <Form.Control
                            type="text"
                            onChange={(e) => setMaintenanceName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceDate">
                        <Form.Label>Maintenance Date</Form.Label>
                        <Form.Control
                            type="date"
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceComment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(e) => setMaintenanceComment(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="maintenanceFiles">
                        <Form.Label>Upload Files</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </Form.Group>
                    <ListGroup className="mt-3">
                        {selectedFiles.map(file => (
                            <ListGroup.Item style={{ display: "flex", justifyContent: "space-between" }} key={file.name}>
                                {file.name}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="ms-3"
                                    onClick={() => handleFileRemove(file.name)}
                                >
                                    &times;
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddMaintenance}>Add Maintenance</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMaintenanceFieldModal} onHide={() => setShowMaintenanceFieldModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visible Maintenance Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {maintenanceInfo[0] && Object.keys(maintenanceInfo[0]).map(key => (
                            <Form.Check
                                key={key}
                                type="checkbox"
                                label={key.replace(/([A-Z])/g, ' $1')}
                                checked={visibleMaintenanceFields[key]}
                                onChange={() => handleFieldToggle(key)}
                            />
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMaintenanceFieldModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MaintenanceInfo;
