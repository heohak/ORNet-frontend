import React, { useEffect, useState, useRef } from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {Container, Spinner, Alert, Accordion, Button} from 'react-bootstrap';
import config from "../../config/config";
import ClientDetails from "./ClientDetails";
import ClientDevices from "./ClientDevices/ClientDevices";
import ClientWorker from "./ClientWorker";
import SoftwareDetails from "./SoftwareDetails";
import ClientTickets from "./ClientTickets";
import ClientThirdPartyIT from "./ClientThirdPartyIT";
import ClientMaintenances from "./ClientMaintenances/ClientMaintenances";
import ClientLocations from "./ClientLocations";
import ClientTrainings from "./ClientTrainings";
import '../../css/Customers.css';
import '../../css/OneClientPage/OneClient.css';
import CustomerActivity from "./Activity/CustomerActivity";
import {FaArrowLeft} from "react-icons/fa";
import axiosInstance from "../../config/axiosInstance";

// Custom hook to get current window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};


function OneClient() {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // for responsive layout

    const { clientId } = useParams();
    const location = useLocation();
    const [client, setClient] = useState(null);
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
    const [statuses, setStatuses] = useState([]);
    const [activities, setActivities] = useState([]);
    const accordionRefs = useRef([]); // Array of refs for each Accordion.Item
    const [activeAccordionKeys, setActiveAccordionKeys] = useState([]);
    const [openStatusId, setOpenStatusId] = useState('');
    const [roles, setRoles] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [baitWorkersMap, setBaitWorkersMap] = useState({});


    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {

            try {
                const [clientRes, workerRes, softwareRes, ticketsRes, maintenanceRes, statusesRes,
                    locationsRes, activityRes, trainingsRes, baitWorkersRes] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/worker/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/software/client/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/ticket/client/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/client/maintenance/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axiosInstance.get(`${config.API_BASE_URL}/client/locations/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/client/activities/${clientId}`),
                    axiosInstance.get(`/training/client/${clientId}`),
                    axiosInstance.get(`/bait/worker/all`)
                ]);

                setClient(clientRes.data);
                setWorkers(
                    workerRes.data.sort((a, b) =>
                        (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName)
                    )
                );
                setSoftwareList(softwareRes.data.sort((a, b) => a.name.localeCompare(b.name)));
                setTickets(ticketsRes.data);
                setMaintenances(maintenanceRes.data);
                setActivities(activityRes.data);
                setStatuses(statusesRes.data);
                setTrainings(trainingsRes.data);

                setOpenStatusId(statusesRes.data.find(status => status.status === "Open").id)

                const fetchedStatuses = statusesRes.data;
                // Create a map for statuses for faster lookup
                const mappedStatuses = fetchedStatuses.reduce((acc, status) => {
                    acc[status.id] = status; // Map status.id to the status object
                    return acc;
                }, {});
                setStatusMap(mappedStatuses);

                // Set locations and location map
                setLocations(locationsRes.data.sort((a, b) => a.name.localeCompare(b.name)));
                const locationMap = locationsRes.data.reduce((acc, loc) => {
                    acc[loc.id] = loc.name;
                    return acc;
                }, {});
                setLocationsMap(locationMap);

                const baitWorkers = baitWorkersRes.data.reduce((acc, worker) => {
                    acc[worker.id] = worker.firstName;
                    return acc;
                }, {});
                setBaitWorkersMap(baitWorkers)

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId, refresh]); // Add refresh as a dependency


    useEffect(() => {
        if (location.state?.openAccordion === 'contacts') {
            setActiveAccordionKeys(['1']); // Open the Contacts accordion
            handleAccordionScroll('1');    // Scroll to the Contacts accordion
        } else if (location.state?.openAccordion === 'activity') {
            setActiveAccordionKeys(['3']); // Open the Activity accordion
            handleAccordionScroll('3');    // Scroll to the Activity accordion
        } else if (location.state?.openAccordion === 'tickets') {
            setActiveAccordionKeys(['4']); // Open the Tickets accordion
            handleAccordionScroll('4');    // Scroll to the Tickets accordion
        }
    }, [location]);


    const handleAccordionScroll = (eventKey) => {
        const index = parseInt(eventKey, 10);
        if (accordionRefs.current[index]) {
            setTimeout(() => {
                const elementPosition = accordionRefs.current[index].getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - 100;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/worker/classificator/all`);
            const rolesMap = response.data.map(role => ({value: role.id, label: role.role}))
            const sortedRoles = rolesMap.sort((a, b) => a.label.localeCompare(b.label))
            setRoles(sortedRoles);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };


    const handleAccordionToggle = (eventKey) => {
        if (!eventKey) return;
        if (activeAccordionKeys.includes(eventKey)) {
            // Close the accordion item
            setActiveAccordionKeys(activeAccordionKeys.filter((key) => key !== eventKey));
        } else {
            // Open the accordion item
            setActiveAccordionKeys([...activeAccordionKeys, eventKey]);
            handleAccordionScroll(eventKey);
        }
    };

    const handleBackNavigation = () => {
        // If we came from e.g. "/customers"
        if (location.state?.fromPath) {
            navigate(location.state.fromPath, {
                state: {
                    // pass back the same filters to restore them
                    filters: location.state.filters
                }
            });
        } else {
            // fallback if no fromPath
            navigate(-1);
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
            <div className="client-header-background">
                <Container>
                    <div className="client-name">
                        <Button
                            variant="link"
                            onClick={handleBackNavigation}
                            className="p-0 me-2"
                            style={{ fontSize: '1.5rem', color: '#0d6efd' }}
                            aria-label="Go back"
                        >
                            <FaArrowLeft title="Go back" />
                        </Button>
                        <h1 className="client-title">{client ? `${client.shortName} Details` : 'Client Details'}</h1>
                    </div>
                </Container>
            </div>

            <Container className="mt-5 pt-5">
                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}
                {client && (
                    <>
                        <ClientDetails
                            clientId={clientId}
                            navigate={navigate}
                            setRefresh={setRefresh}
                            reFetchRoles={fetchRoles}
                            setRoles={setRoles}
                        />
                        <Accordion
                            activeKey={activeAccordionKeys}
                            alwaysOpen
                        >

                            <Accordion.Item eventKey="1" className="AccordionWorkers" ref={(el) => accordionRefs.current[1] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('1')}>Contacts</Accordion.Header>
                                <Accordion.Body className="custom-accordion-body">
                                    <ClientWorker
                                        workers={workers}
                                        client={client}
                                        clientId={clientId}
                                        setRefresh={setRefresh}
                                        refresh={refresh}
                                        reFetchRoles={fetchRoles}
                                        roles={roles}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2" className="AccordionLocations" ref={(el) => accordionRefs.current[2] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('2')}>Locations</Accordion.Header>
                                <Accordion.Body>
                                    <ClientLocations
                                        locations={locations}
                                        setRefresh={setRefresh}
                                        clientId={clientId}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3" ref={(el) => accordionRefs.current[3] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('3')}>Activity</Accordion.Header>
                                <Accordion.Body>
                                    <CustomerActivity
                                        activities={activities}
                                        setActivities={setActivities}
                                        clientId={clientId}
                                        clientName={client.fullName}
                                        locations={locations}
                                        contacts={workers}
                                        statuses={statuses}
                                        openStatusId={openStatusId}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>


                            </Accordion.Item>

                            <Accordion.Item eventKey="4" className="AccordionTickets" ref={(el) => accordionRefs.current[4] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('4')}>Tickets</Accordion.Header>
                                <Accordion.Body>
                                    <ClientTickets
                                        tickets={tickets}
                                        statusMap={statusMap}
                                        clientId={clientId}
                                        setTickets={setTickets}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5" className="AccordionDevices" ref={(el) => accordionRefs.current[5] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('5')}>Devices</Accordion.Header>
                                <Accordion.Body>
                                    <ClientDevices
                                        client={client}
                                        clientId={clientId}
                                        locations={locationsMap}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6" className="AccordionMaintenance" ref={(el) => accordionRefs.current[6] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('6')}>Maintenances</Accordion.Header>
                                <Accordion.Body>
                                    <ClientMaintenances
                                        maintenances={maintenances}
                                        clientId={clientId}
                                        setRefresh={() => setRefresh(!refresh)}
                                        client={client}
                                        locationNames={locationsMap}
                                        responsibleNames={baitWorkersMap}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7" className="AccordionTrainings" ref={(el) => accordionRefs.current[7] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('7')}>Trainings</Accordion.Header>
                                <Accordion.Body>
                                    <ClientTrainings
                                        trainings={trainings}
                                        setTrainings={setTrainings}
                                        locations={locations}
                                        clientId={client.id}
                                        clientName={client.fullName}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8" className="AccordionTechnicalInfo" ref={(el) => accordionRefs.current[8] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('8')}>Technical Information</Accordion.Header>
                                <Accordion.Body className="custom-accordion-body">
                                    <SoftwareDetails
                                        softwareList={softwareList}
                                        clientId={clientId}
                                        setRefresh={setRefresh}
                                        client={client}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9" className="AccordionThirdPartyITs" ref={(el) => accordionRefs.current[9] = el}>
                                <Accordion.Header onClick={() => handleAccordionToggle('9')}>Third Party ITs</Accordion.Header>
                                <Accordion.Body className="custom-accordion-body">
                                    <ClientThirdPartyIT
                                        clientId={clientId}
                                        client={client}
                                        refresh={refresh}
                                        setRefresh={setRefresh}
                                        isMobile={isMobile}
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