import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Row, Col } from 'react-bootstrap';
import config from "../../config/config";
import ClientDetails from "./ClientDetails";
import ClientDevices from "./ClientDevices";
import ClientWorker from "./ClientWorker";
import SoftwareDetails from "./SoftwareDetails";
import ClientTickets from "./ClientTickets";
import ClientThirdPartyIT from "./ClientThirdPartyIT";

function OneClient() {
    const { clientId } = useParams();
    const [client, setClient] = useState(null);
    const [devices, setDevices] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [softwareList, setSoftwareList] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false); // State to trigger refresh

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientRes, deviceRes, workerRes, softwareRes, ticketsRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/device/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/worker/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/software/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/ticket/client/${clientId}`)
                ]);
                setClient(clientRes.data);
                setDevices(deviceRes.data);
                setWorkers(workerRes.data);
                setSoftwareList(softwareRes.data);
                setTickets(ticketsRes.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId, refresh]); // Add refresh as a dependency

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
            <ClientDetails client={client} navigate={navigate} />
            <Row>
                <Col md={6}>
                    <ClientDevices
                        devices={devices}
                        client={client}
                        clientId={clientId}
                        setRefresh={setRefresh}
                    />
                </Col>
                <Col md={6}>
                    <ClientWorker
                        workers={workers}
                        client={client}
                        clientId={clientId}
                        setRefresh={setRefresh}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <ClientThirdPartyIT clientId={clientId} />
                </Col>
                <Col md={6}>
                    <SoftwareDetails softwareList={softwareList} />
                </Col>
            </Row>
            <ClientTickets tickets={tickets} />
        </Container>
    );
}

export default OneClient;
