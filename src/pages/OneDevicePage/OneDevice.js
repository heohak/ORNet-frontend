import React, {useEffect, useState, useRef} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Col, Container, Row, Spinner, Accordion} from 'react-bootstrap';
import config from "../../config/config";
import DeviceDetails from "./DeviceDetails";
import MaintenanceInfo from "./MaintenanceInfo";
import LinkedDevices from "./LinkedDevices";
import '../../css/OneDevicePage/OneDevice.css';
import DeviceTickets from "./DeviceTickets";
import DeviceExtras from "./DeviceExtras";
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

function OneDevice() {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768; // for responsive layout

    const {deviceId} = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [responsibleNames, setResponsibleNames] = useState([]);
    const [locationNames, setLocationNames] = useState([]);
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const accordionRefs = useRef([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deviceRes, linkedDevicesRes, availableLinkedDevicesRes, baitWorkersRes, maintenancesRes] = await Promise.all([
                    //maintenanceInfoRes
                    axiosInstance.get(`${config.API_BASE_URL}/device/${deviceId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/linked/device/${deviceId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/linked/device/not-used`),
                    axiosInstance.get(`/bait/worker/all`),
                    axiosInstance.get(`/device/maintenances/${deviceId}`)
                ]);

                const fetchedDevice = deviceRes.data;
                setLinkedDevices(linkedDevicesRes.data);
                setAvailableLinkedDevices(availableLinkedDevicesRes.data);
                setMaintenances(maintenancesRes.data);
                const clientId = fetchedDevice.clientId;
                const locationId = fetchedDevice.locationId;
                const classificatorId = fetchedDevice.classificatorId;
                const [clientRes, locationRes, classificatorRes] = await Promise.all([
                    axiosInstance.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/location/${locationId}`),
                    axiosInstance.get(`${config.API_BASE_URL}/device/classificator/${classificatorId}`)
                ]);
                const enhancedDeviceData = {
                    ...fetchedDevice,
                    clientName: clientRes.data.fullName,
                    locationName: locationRes.data.name,
                    classificatorName: classificatorRes.data.name
                };
                setDevice(enhancedDeviceData);
                const workers = baitWorkersRes.data.reduce((acc, worker) => {
                    acc[worker.id] = worker.firstName;
                    return acc;
                }, {});
                setResponsibleNames(workers);
                const locId = locationRes.data.id;
                const locName = locationRes.data.name;
                const locationName = { [locId]: locName };
                setLocationNames((prev) => ({ ...prev, ...locationName }));

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [deviceId, refresh]);

    const handleAccordionToggle = (eventKey) => {
        const index = parseInt(eventKey, 10);
        if (accordionRefs.current[index]) {
            setTimeout(() => {
                const elementPosition = accordionRefs.current[index].getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - 100; // Adjust offset as needed

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }, 100); // Delay for smooth scrolling
        }
    };
    // Function to handle refreshing data
    const handleRefresh = () => {
        setRefresh(!refresh);
    };

    const handleBackNavigation = () => {
        if (location.state?.fromPath) {
            // Pass through any filters we might have in location.state
            navigate(location.state.fromPath, {
                state: {
                    fromPath: location.state.fromPath,
                    openAccordion: 'tickets',
                    filters: location.state?.filters // <- add this line
                },
            });
        } else if (device && device.clientId) {
            navigate(`/customer/${device.clientId}`);
        } else {
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
            {/* Header Section */}
            <div className="device-header-background">
                <Container>
                    <div className="device-name d-flex align-items-center justify-content-between">
                        <Button
                            variant="link"
                            onClick={handleBackNavigation}
                            className="p-0 me-2"
                            style={{ fontSize: '1.5rem', color: '#0d6efd' }}
                            aria-label="Go back"
                        >
                            <FaArrowLeft title="Go back" />
                        </Button>
                        <h1 className="device-title">
                            {device ? `${device.deviceName} s/n ${device.serialNumber}` : 'Device Details'}
                        </h1>
                        {/* Placeholder for possible future header items */}
                        <div></div>
                    </div>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="mt-4 pt-5">
                {/* Service Duration */}
                <Row className="mb-4">
                    {device && device.writtenOffDate && (
                        <Col>
                            <strong>Service Duration: </strong>
                            {Math.floor(
                                (new Date(device.writtenOffDate) - new Date(device.introducedDate)) /
                                (1000 * 60 * 60 * 24)
                            )} days
                        </Col>
                    )}
                </Row>

                {/* Device Details */}
                <Row className="mb-4">
                    <Col>
                        <DeviceDetails
                            device={device}
                            navigate={navigate}
                            setRefresh={handleRefresh}
                            onUploadSuccess={handleRefresh}
                        />
                    </Col>
                </Row>

                {/* Files & Comments Section */}
                <Row className="mt-4">
                    <Col>
                        <DeviceExtras deviceId={deviceId} />
                    </Col>
                </Row>


                {/* Accordion Sections */}
                <Row>
                    <Col>
                        <Accordion defaultActiveKey="0" alwaysOpen onToggle={handleAccordionToggle}>
                            {/* Linked Devices */}
                            <Accordion.Item
                                eventKey="1"
                                className="AccordionLinkedDevices"
                                ref={(el) => (accordionRefs.current[1] = el)}
                            >
                                <Accordion.Header>Linked Devices</Accordion.Header>
                                <Accordion.Body>
                                    <LinkedDevices
                                        linkedDevices={linkedDevices}
                                        showModal={showModal}
                                        setShowModal={setShowModal}
                                        availableLinkedDevices={availableLinkedDevices}
                                        deviceId={deviceId}
                                        setLinkedDevices={setLinkedDevices}
                                        refreshData={handleRefresh}
                                        clientId={device?.clientId}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item
                                eventKey="4"
                                className="AccordionDeviceTickets"
                                ref={(el) => (accordionRefs.current[4] = el)}
                            >
                                <Accordion.Header onClick={() => handleAccordionToggle('4')}>Tickets</Accordion.Header>
                                <Accordion.Body>
                                    <DeviceTickets
                                        deviceId={deviceId}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>


                            {/* Maintenance Info */}
                            <Accordion.Item
                                eventKey="2"
                                className="AccordionMaintenanceInfo"
                                ref={(el) => (accordionRefs.current[2] = el)}
                            >
                                <Accordion.Header>Maintenance Information</Accordion.Header>
                                <Accordion.Body>
                                    <MaintenanceInfo
                                        maintenances={maintenances}
                                        clientId={device.clientId}
                                        setRefresh={handleRefresh}
                                        locationNames={locationNames}
                                        responsibleNames={responsibleNames}
                                        isMobile={isMobile}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>


                        </Accordion>
                    </Col>
                </Row>

            </Container>
        </>
    );
}

export default OneDevice;
