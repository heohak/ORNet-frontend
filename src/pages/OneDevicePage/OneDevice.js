import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import config from "../../config/config";
import DeviceDetails from "./DeviceDetails";
import MaintenanceInfo from "./MaintenanceInfo";
import LinkedDevices from "./LinkedDevices";
import FileUploadModal from "../../modals/FileUploadModal";
import CommentsModal from "../../modals/CommentsModal";

function OneDevice() {
    const { deviceId } = useParams();
    const [device, setDevice] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [maintenanceInfo, setMaintenanceInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [availableLinkedDevices, setAvailableLinkedDevices] = useState([]);
    const [selectedLinkedDeviceId, setSelectedLinkedDeviceId] = useState("");
    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [maintenanceComment, setMaintenanceComment] = useState("");
    const [files, setFiles] = useState([]);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deviceRes, linkedDevicesRes, availableLinkedDevicesRes, maintenanceInfoRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/device/${deviceId}`),
                    axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`),
                    axios.get(`${config.API_BASE_URL}/linked/device/all`),
                    axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`)
                ]);

                setDevice(deviceRes.data);
                setLinkedDevices(linkedDevicesRes.data);
                setAvailableLinkedDevices(availableLinkedDevicesRes.data);
                setMaintenanceInfo(maintenanceInfoRes.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deviceId, refresh]);

    const handleLinkDevice = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/linked/device/link/${selectedLinkedDeviceId}/${deviceId}`);
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/${deviceId}`);
            setLinkedDevices(response.data);
            setShowModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddMaintenance = async () => {
        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment: maintenanceComment,
            });
            const maintenanceId = maintenanceResponse.data.token;

            await axios.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`);

            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenanceId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            const response = await axios.get(`${config.API_BASE_URL}/device/maintenances/${deviceId}`);
            setMaintenanceInfo(response.data);
            setShowMaintenanceModal(false);
            setFiles([]); // Clear files after upload
        } catch (error) {
            console.error('Error adding maintenance:', error);
            setError(error.message);
        }
    };

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
        <Container className="mt-5">
            <DeviceDetails
                device={device}
                navigate={navigate}
                setShowFileUploadModal={setShowFileUploadModal}
                setShowCommentsModal={setShowCommentsModal}
                setRefresh={setRefresh}
                onUploadSuccess={handleUploadSuccess}
            />
            <MaintenanceInfo
                maintenanceInfo={maintenanceInfo}
                showMaintenanceModal={showMaintenanceModal}
                setShowMaintenanceModal={setShowMaintenanceModal}
                handleAddMaintenance={handleAddMaintenance}
                setMaintenanceName={setMaintenanceName}
                setMaintenanceDate={setMaintenanceDate}
                setMaintenanceComment={setMaintenanceComment}
                setFiles={setFiles} // Pass setFiles to MaintenanceInfo
            />
            <LinkedDevices
                linkedDevices={linkedDevices}
                showModal={showModal}
                setShowModal={setShowModal}
                availableLinkedDevices={availableLinkedDevices}
                selectedLinkedDeviceId={selectedLinkedDeviceId}
                setSelectedLinkedDeviceId={setSelectedLinkedDeviceId}
                handleLinkDevice={handleLinkDevice}
                deviceId={deviceId} // Pass deviceId as a prop
                setLinkedDevices={setLinkedDevices} // Pass setLinkedDevices as a prop
            />
            <FileUploadModal
                show={showFileUploadModal}
                handleClose={() => setShowFileUploadModal(false)}
                deviceId={deviceId}
                uploadEndpoint={`${config.API_BASE_URL}/device/upload/${deviceId}`}
                onUploadSuccess={handleUploadSuccess} // Pass callback to trigger refresh
            />
            <CommentsModal
                show={showCommentsModal}
                handleClose={() => setShowCommentsModal(false)}
                deviceId={deviceId} // Pass deviceId to CommentsModal
            />
        </Container>
    );
}

export default OneDevice;
