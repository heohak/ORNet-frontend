import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import config from "../../config/config";
import AddDeviceModal from './AddDeviceModal';
import DeviceSearchFilter from './DeviceSearchFilter';
import SummaryModal from './SummaryModal';

function Devices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [refresh, setRefresh] = useState(false); // State to trigger refresh
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [classificators, setClassificators] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/all`);
                setDevices(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchClassificators = async() => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/classificator/all`)

                const classificators = {};
                response.data.forEach(classificator => {
                    classificators[classificator.id] = classificator.name;
                });
                setClassificators(classificators)
            } catch (error) {
                console.error("Couldn't fetch device classificators", error);
            }
        }

        fetchDevices();
        fetchClassificators();
    }, [refresh]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Devices</h1>
                <div>
                    <Button variant="info" className="mb-4 me-2" onClick={() => setShowSummaryModal(true)}>
                        Show Summary
                    </Button>
                    <Button variant="primary" className="mb-4" onClick={() => setShowAddDeviceModal(true)}>
                        Add Device
                    </Button>
                </div>
            </div>
            <DeviceSearchFilter setDevices={setDevices} />
            <Row>
                {devices.map((device) => (
                    <Col md={4} key={device.id} className="mb-4">
                        <Card style={{cursor: 'pointer'}} onClick={() => navigate(`/device/${device.id}`)}>
                            <Card.Body>
                                <Card.Title><strong>Device Name: </strong>{device.deviceName}</Card.Title>
                                <Card.Text>
                                    <strong>Serial Number: </strong>{device.serialNumber}<br />
                                    <strong>Type: </strong>{classificators[device.classificatorId] || "Unknown type"}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <AddDeviceModal
                show={showAddDeviceModal}
                onHide={() => setShowAddDeviceModal(false)}
                setRefresh={setRefresh}
            />
            <SummaryModal
                show={showSummaryModal}
                handleClose={() => setShowSummaryModal(false)}
            />
        </Container>
    );
}

export default Devices;
