import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, ListGroup, Alert } from 'react-bootstrap';
import AddWorker from '../../components/AddWorker'; // Update the import path as necessary
import axios from 'axios';
import config from "../../config/config"; // Import axios for making HTTP requests

function ClientWorker({ workers,client, clientId, setRefresh }) {
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [expandedWorkerId, setExpandedWorkerId] = useState(null);
    const [workerLocations, setWorkerLocations] = useState({});

    useEffect(() => {
        // Fetch worker locations initially or whenever workers change
        fetchWorkerLocations();
    }, [workers]);

    const fetchWorkerLocations = async () => {
        try {
            const locationPromises = workers.map(worker =>
                axios.get(`${config.API_BASE_URL}/worker/location/${worker.id}`));
            const locationResponses = await Promise.all(locationPromises);
            const locations = {};
            locationResponses.forEach((response, index) => {
                const workerId = workers[index].id;
                locations[workerId] = response.data; // Assuming response.data is the location object
            });
            setWorkerLocations(locations);
        } catch (error) {
            console.error('Error fetching worker locations:', error);
        }
    };

    const toggleWorkerDetails = async (workerId) => {
        if (expandedWorkerId === workerId) {
            setExpandedWorkerId(null); // Collapse if already expanded
        } else {
            setExpandedWorkerId(workerId); // Expand the worker
            // Fetch location for the worker if not already fetched
            if (!workerLocations[workerId]) {
                try {
                    const response = await axios.get(`${config.API_BASE_URL}/worker/location/${workerId}`);
                    const location = response.data; // Assuming response.data is the location object
                    setWorkerLocations(prevLocations => ({
                        ...prevLocations,
                        [workerId]: location
                    }));
                } catch (error) {
                    console.error(`Error fetching location for worker ${workerId}:`, error);
                }
            }
        }
    };

    return (
        <>
            <h2 className="mb-4">
                {client ? `${client.shortName} Workers` : 'Client Workers'}
            </h2>
            <h2 className="mb-4 mt-4">Client Workers</h2>
            <Button variant="primary" onClick={() => setShowAddWorkerModal(true)}>Add Worker</Button>
            {workers.length > 0 ? (
                <ListGroup className="mt-3">
                    {workers.map((worker) => (
                        <ListGroup.Item key={worker.id}>
                            <Card>
                                <Card.Body>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Card.Title>Title: {worker.title}</Card.Title>
                                            <Card.Text>
                                                <strong>Name: </strong>{worker.firstName + " " + worker.lastName}
                                            </Card.Text>
                                        </div>
                                        <Button variant="link" onClick={() => toggleWorkerDetails(worker.id)}>
                                            {expandedWorkerId === worker.id ? '▲' : '▼'}
                                        </Button>
                                    </div>
                                    {/* Additional info toggleable section */}
                                    {expandedWorkerId === worker.id && workerLocations[worker.id] && (
                                        <div>
                                            <Card.Text><strong>Phone: </strong>{worker.phoneNumber}</Card.Text>
                                            <Card.Text><strong>Email: </strong>{worker.email}</Card.Text>
                                            <Card.Text><strong>Location: </strong>{workerLocations[worker.id].name}</Card.Text>
                                            {/* Display other location properties as needed */}
                                        </div>
                                    )}
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
