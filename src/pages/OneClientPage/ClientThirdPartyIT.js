import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Alert, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../../config/config";
import AddThirdPartyIT from "./AddThirdPartyIT";

function ClientThirdPartyIT({ clientId, client }) {
    const [thirdPartyITs, setThirdPartyITs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchThirdPartyITs = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/third-parties/${clientId}`);
                setThirdPartyITs(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThirdPartyITs();
    }, [clientId, refresh]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div className="mt-4">
            <h2>Third-Party ITs</h2>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Third-Party IT</Button>
            {thirdPartyITs.length > 0 ? (
                <ListGroup className="mt-3">
                    {thirdPartyITs.map((thirdParty) => (
                        <ListGroup.Item key={thirdParty.id}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{thirdParty.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Email: </strong>{thirdParty.email}<br />
                                        <strong>Phone: </strong>{thirdParty.phone}
                                    </Card.Text>
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate(`/settings/third-party-its/edit/${thirdParty.id}`, { state: { thirdParty } })}
                                    >
                                        Edit
                                    </Button>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert className="mt-3" variant="info">No third-party ITs available.</Alert>
            )}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Third-Party IT to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddThirdPartyIT clientId={clientId} onClose={() => setShowAddModal(false)} setRefresh={setRefresh} />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ClientThirdPartyIT;
