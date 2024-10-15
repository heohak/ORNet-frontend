import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Container, Spinner, Alert, Accordion, Card, Button, Row, Col} from 'react-bootstrap';
import config from "../../config/config";
import ClientDetails from "./ClientDetails";
import ClientDevices from "./ClientDevices";
import ClientWorker from "./ClientWorker";
import SoftwareDetails from "./SoftwareDetails";
import ClientTickets from "./ClientTickets";
import ClientThirdPartyIT from "./ClientThirdPartyIT";
import ClientMaintenances from "./ClientMaintenances";
import ClientLocations from "./ClientLocations";
import '../../css/Customers.css';
import '../../css/OneClientPage/OneClient.css';

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
    const accordionRefs = useRef([]); // Array of refs for each Accordion.Item

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {

            try {
                const [clientRes, deviceRes, workerRes, softwareRes, ticketsRes, maintenanceRes, statusesRes, locationsRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/device/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/worker/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/software/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/ticket/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/client/maintenance/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/client/locations/${clientId}`)
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

                // Set locations and location map
                setLocations(locationsRes.data);
                const locationMap = locationsRes.data.reduce((acc, loc) => {
                    acc[loc.id] = loc.name;
                    return acc;
                }, {});
                setLocationsMap(locationMap);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId, refresh]); // Add refresh as a dependency

    const handleAccordionToggle = (eventKey) => {
        const index = parseInt(eventKey, 10);
        if (accordionRefs.current[index]) {
            setTimeout(() => {
                const elementPosition = accordionRefs.current[index].getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - 100; // Adjust -100 for more aggressive scrolling

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100); // Delay for 100 milliseconds
        }
    };



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
        <>
            <div className='client-name'>
                <Button className='mt-2 mb-2 ms-2' onClick={() => navigate('/customers')}>Back</Button>
                <h1 className="text-center flex-grow-1 me-2" >{client ? `${client.shortName} Details` : 'Client Details'}</h1>
            </div>
            <Container className="mt-5 pt-5">
                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}
                {client && (
                    <>
                        <ClientDetails
                            client={client}
                            navigate={navigate}
                        />
                        <Accordion defaultActiveKey="0" alwaysOpen onToggle={handleAccordionToggle}>
                            <Accordion.Item eventKey="1" className="AccordionLocations" ref={(el) => accordionRefs.current[1] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(1)}>Locations</Accordion.Header>
                                <Accordion.Body>
                                    <ClientLocations locations={locations}
                                    setRefresh={setRefresh}/>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2" className="AccordionTechnicalInfo" ref={(el) => accordionRefs.current[2] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(2)}>Technical Information</Accordion.Header>
                                <Accordion.Body>
                                    <SoftwareDetails
                                        softwareList={softwareList}
                                        clientId={clientId}
                                        setRefresh={setRefresh}
                                        client={client}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3" className="AccordionTickets" ref={(el) => accordionRefs.current[3] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(3)}>Tickets</Accordion.Header>
                                <Accordion.Body>
                                    <ClientTickets
                                        tickets={tickets}
                                        statusMap={statusMap}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4" className="AccordionWorkers" ref={(el) => accordionRefs.current[4] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(4)}>Contacts</Accordion.Header>
                                <Accordion.Body>
                                    <ClientWorker
                                        workers={workers}
                                        client={client}
                                        clientId={clientId}
                                        setRefresh={setRefresh}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5" className="AccordionDevices" ref={(el) => accordionRefs.current[5] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(5)}>Devices</Accordion.Header>
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

                            <Accordion.Item eventKey="6" className="AccordionThirdPartyITs" ref={(el) => accordionRefs.current[6] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(6)}>Third Party ITs</Accordion.Header>
                                <Accordion.Body>
                                    <ClientThirdPartyIT
                                        clientId={clientId}
                                        client={client}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7" className="AccordionMaintenences" ref={(el) => accordionRefs.current[7] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle(7)}>Maintenances</Accordion.Header>
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
        </>
    );
}

export default OneClient;