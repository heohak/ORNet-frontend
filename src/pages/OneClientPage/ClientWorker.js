import React, { useState } from 'react';
import { Card, Button, Modal, ListGroup, Alert } from 'react-bootstrap';
import AddWorker from '../../components/AddWorker'; // Update the import path as necessary

function ClientWorker({ workers,client, clientId, setRefresh }) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

    return (
        <>
            <h2 className="mb-4">
                {client ? `${client.shortName} Workers` : 'Client Workers'}
            </h2>
            <Button variant="primary" onClick={() => setShowAddWorkerModal(true)}>Add Worker</Button>
            {workers.length > 0 ? (
                <ListGroup className="mt-3">
                    {workers.map((worker) => (
                        <ListGroup.Item key={worker.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Title: {worker.title}</Card.Title>
                                    <Card.Text>
                                        <strong>Name: </strong>{worker.firstName + " " + worker.lastName}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No workers available.</Alert>
            )}

            <Modal show={showAddWorkerModal} onHide={() => setShowAddWorkerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Worker to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddWorker clientId={clientId} onClose={() => setShowAddWorkerModal(false)} setRefresh={setRefresh} /> {/* Pass clientId and setRefresh as props */}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientWorker;
