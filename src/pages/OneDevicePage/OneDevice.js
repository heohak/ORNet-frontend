import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Col, Container, Row, Spinner} from 'react-bootstrap';
import config from "../../config/config";
import DeviceDetails from "./DeviceDetails";
import MaintenanceInfo from "./MaintenanceInfo";
import LinkedDevices from "./LinkedDevices";
import CommentsModal from "../../modals/CommentsModal";
import '../../css/OneDevicePage/OneDevice.css';
import DeviceFileList from "./DeviceFileList";

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


    const handleUploadSuccess = () => {
        setRefresh(!refresh); // Toggle refresh state to trigger re-fetch
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
            <div className="device-header-background">
                <Container>
                    <div className="device-name">
                        <Button
                            onClick={() => {
                                if (location.state?.fromTicketId) {
                                    navigate(`/tickets/${location.state.fromTicketId}`);
                                } else if (location.state && location.state.from === 'all-devices') {
                                    navigate('/devices');
                                } else if (device && device.clientId) {
                                    navigate(`/customer/${device.clientId}`);
                                } else {
                                    navigate(-1);
                                }
                            }}
                        >
                            Back
                        </Button>
                        <h1 className="device-title">{device ? `${device.deviceName} Details` : 'Device Details'}</h1>
                    </div>
                </Container>
            </div>
            <Container className="mt-4 pt-5">

                <Row>
                    {device && device.writtenOffDate && (
                        <div>
                            <strong>Service Duration: </strong>
                            {Math.floor((new Date(device.writtenOffDate) - new Date(device.introducedDate)) / (1000 * 60 * 60 * 24))} days
                        </div>
                    )}
                </Row>

                <Row>
                    <Col md={6}>
                        <DeviceDetails
                            device={device}
                            navigate={navigate}
                            setShowCommentsModal={setShowCommentsModal}
                            setRefresh={setRefresh}
                            onUploadSuccess={handleUploadSuccess}
                        />
                        <LinkedDevices
                            linkedDevices={linkedDevices}
                            showModal={showModal}
                            setShowModal={setShowModal}
                            availableLinkedDevices={availableLinkedDevices}
                            deviceId={deviceId}
                            setLinkedDevices={setLinkedDevices}
                        />
                    </Col>
                    <Col md={6}>
                        <MaintenanceInfo
                            maintenanceInfo={maintenanceInfo}
                            setMaintenanceInfo={setMaintenanceInfo}
                            showMaintenanceModal={showMaintenanceModal}
                            setShowMaintenanceModal={setShowMaintenanceModal}
                            showMaintenanceFieldModal={showMaintenanceFieldModal}
                            setShowMaintenanceFieldModal={setShowMaintenanceFieldModal}
                            deviceId={deviceId}
                        />
                    </Col>
                </Row>
                <CommentsModal
                    show={showCommentsModal}
                    handleClose={() => setShowCommentsModal(false)}
                    deviceId={deviceId}
                />
                <DeviceFileList
                    deviceId={deviceId}
                />

            </Container>
        </>
    );
}

export default OneDevice;
