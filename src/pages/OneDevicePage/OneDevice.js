import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Col, Container, Row, Spinner, Accordion} from 'react-bootstrap';
import config from "../../config/config";
import DeviceDetails from "./DeviceDetails";
import MaintenanceInfo from "./MaintenanceInfo";
import LinkedDevices from "./LinkedDevices";
import CommentsModal from "../../modals/CommentsModal";
import '../../css/OneDevicePage/OneDevice.css';
import DeviceFileList from "./DeviceFileList";
import DeviceTickets from "./DeviceTickets";

function OneDevice() {
    const {deviceId} = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [maintenanceInfo, setMaintenanceInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showMaintenanceFieldModal, setShowMaintenanceFieldModal] = useState(false);
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const accordionRefs = useRef([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deviceRes, linkedDevicesRes, availableLinkedDevicesRes, maintenanceInfoRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/device/${deviceId}`),
                    axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`),
                    axios.get(`${config.API_BASE_URL}/linked/device/not-used`),
                    axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`)
                ]);

                const fetchedDevice = deviceRes.data;
                setLinkedDevices(linkedDevicesRes.data);
                setAvailableLinkedDevices(availableLinkedDevicesRes.data);
                setMaintenanceInfo(maintenanceInfoRes.data);
                const clientId = fetchedDevice.clientId;
                const locationId = fetchedDevice.locationId;
                const classificatorId = fetchedDevice.classificatorId;
                const [clientRes, locationRes, classificatorRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/client/${clientId}`),
                    axios.get(`${config.API_BASE_URL}/location/${locationId}`),
                    axios.get(`${config.API_BASE_URL}/device/classificator/${classificatorId}`)
                ]);
                const enhancedDeviceData = {
                    ...fetchedDevice,
                    clientName: clientRes.data.fullName,
                    locationName: locationRes.data.name,
                    classificatorName: classificatorRes.data.name
                };
                setDevice(enhancedDeviceData);
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
            navigate(`${location.state.fromPath}`, { state: {fromPath: location.state.fromPath, openAccordion: 'tickets' }});
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
                        <Button onClick={handleBackNavigation}>Back</Button>
                        <h1 className="device-title">
                            {device ? `${device.deviceName} Details` : 'Device Details'}
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
                            setShowCommentsModal={setShowCommentsModal}
                            setRefresh={handleRefresh}
                            onUploadSuccess={handleRefresh}
                        />
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
                                    <DeviceTickets deviceId={deviceId} />
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
                                        maintenanceInfo={maintenanceInfo}
                                        setMaintenanceInfo={setMaintenanceInfo}
                                        showMaintenanceModal={showMaintenanceModal}
                                        setShowMaintenanceModal={setShowMaintenanceModal}
                                        showMaintenanceFieldModal={showMaintenanceFieldModal}
                                        setShowMaintenanceFieldModal={setShowMaintenanceFieldModal}
                                        deviceId={deviceId}
                                        setRefresh={handleRefresh}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* Device Files */}
                            <Accordion.Item
                                eventKey="3"
                                className="AccordionDeviceFiles"
                                ref={(el) => (accordionRefs.current[3] = el)}
                            >
                                <Accordion.Header>Device Files</Accordion.Header>
                                <Accordion.Body>
                                    <DeviceFileList deviceId={deviceId} />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>

                {/* Comments Modal */}
                <CommentsModal
                    show={showCommentsModal}
                    handleClose={() => setShowCommentsModal(false)}
                    deviceId={deviceId}
                />
            </Container>
        </>
    );
}

export default OneDevice;
