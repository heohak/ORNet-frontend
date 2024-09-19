import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Accordion, Row, Col } from 'react-bootstrap';
import config from "../../config/config";
import ClientDetails from "./ClientDetails";
import ClientDevices from "./ClientDevices";
import ClientWorker from "./ClientWorker";
import SoftwareDetails from "./SoftwareDetails";
import ClientTickets from "./ClientTickets";
import ClientThirdPartyIT from "./ClientThirdPartyIT";
import ClientMaintenances from "./ClientMaintenances";

function OneClient() {
    const { clientId } = useParams();
    const [client, setClient] = useState(null);
    const [devices, setDevices] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [softwareList, setSoftwareList] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false); // State to trigger refresh
    const [locations, setLocations] = useState([])
    const [locationsMap, setLocationsMap] = useState([])
    const [statusMap, setStatusMap] = useState({});

    const navigate = useNavigate();

    const fetchClientLocations = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`);
            setLocations(response.data); // Keep the original array for ClientDetails

            // Also create a location map for ClientDevices
            const locationMap = response.data.reduce((acc, loc) => {
                acc[loc.id] = loc.name;
                return acc;
            }, {});
            setLocationsMap(locationMap); // Use this for ClientDevices
        } catch (error) {
            setError('Error fetching client locations');
        }
    };



    useEffect(() => {
        const fetchData = async () => {

            try {
                const [clientRes, deviceRes, workerRes, softwareRes, ticketsRes, maintenanceRes, statusesRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/device/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/worker/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/software/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/ticket/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/client/maintenance/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`)
                ]);
                setClient(clientRes.data);
                setDevices(deviceRes.data);
                setWorkers(workerRes.data);
                setSoftwareList(softwareRes.data);
                setTickets(ticketsRes.data);
                setMaintenances(maintenanceRes.data);
                const fetchedStatuses = statusesRes.data;
                // Create a map for statuses for faster lookup
                const mappedStatuses = fetchedStatuses.reduce((acc, status) => {
                    acc[status.id] = status; // Map status.id to the status object
                    return acc;
                }, {});

                setStatusMap(mappedStatuses);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchClientLocations()
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
        <Container>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {client && (
                <>
                    <ClientDetails
                        client={client}
                        navigate={navigate}
                        locations={locations}
                    />
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Technical Information</Accordion.Header>
                            <Accordion.Body>
                                <SoftwareDetails
                                    softwareList={softwareList}
                                    clientId={clientId}
                                    setRefresh={setRefresh}
                                    client={client}
                                />
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Tickets</Accordion.Header>
                            <Accordion.Body>
                                <ClientTickets
                                    tickets={tickets}
                                    statusMap={statusMap}
                                />
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Workers</Accordion.Header>
                            <Accordion.Body>
                                <ClientWorker
                                    workers={workers}
                                    client={client}
                                    clientId={clientId}
                                    setRefresh={setRefresh}
                                />
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Devices</Accordion.Header>
                            <Accordion.Body>
                                <ClientDevices
                                    devices={devices}
                                    client={client}
                                    clientId={clientId}
                                    setRefresh={setRefresh}
                                    locations={locationsMap}
                                />
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="4">
                            <Accordion.Header>Third Party ITs</Accordion.Header>
                            <Accordion.Body>
                                <ClientThirdPartyIT
                                    clientId={clientId}
                                    client={client}
                                />
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="5">
                            <Accordion.Header>Maintenances</Accordion.Header>
                            <Accordion.Body>
                                <ClientMaintenances
                                    maintenances={maintenances}
                                    clientId={clientId}
                                    setRefresh={setRefresh}
                                    client={client}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </>
            )}
        </Container>
    );
}

export default OneClient;