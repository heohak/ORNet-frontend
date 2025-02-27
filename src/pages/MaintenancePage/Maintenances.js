import React, { useEffect, useState } from 'react';
import {Container, Button, Row, Col, Collapse, Spinner} from 'react-bootstrap';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceList from "./MaintenanceList";
import axiosInstance from "../../config/axiosInstance";
import MaintenanceDetailsModal from "./MaintenanceDetailsModal";
import AddMaintenanceModal from "./AddMaintenanceModal";

// Custom hook to get window width
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

const Maintenances = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [responsibleNames, setResponsibleNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Use our custom hook
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    useEffect(() => {
        fetchMaintenances();
        fetchLocationNames();
        fetchResponsibleNames();
    }, [refresh]);

    useEffect(() => {
        fetchCustomers();
        fetchBaitWorkers();
    }, []);

    const fetchBaitWorkers = async () => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`);
            const workers = response.data.map(worker => ({ value: worker.id, label: `${worker.firstName} ${worker.lastName}` }));
            setBaitWorkers(workers);
        } catch (error) {
            console.error("Error fetching Bait Workers", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get(`/client/all`);
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers", error);
        }
    };

    const fetchMaintenances = async () => {
        try {
            const response = await axiosInstance.get(`/maintenance/all`);
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error fetching maintenances', error);
        }
    };

    const fetchMaintenanceById = async (id) => {
        try {
            const response = await axiosInstance.get(`/maintenance/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching the maintenance", error);
        }
    };

    const selectAddedMaintenance = async (maintenanceId) => {
        const newMaintenance = await fetchMaintenanceById(maintenanceId);
        if (newMaintenance) {
            setSelectedMaintenance(newMaintenance);
            setShowDetailsModal(true);
        }
    };

    const fetchResponsibleNames = async () => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`);
            const workers = response.data.reduce((acc, worker) => {
                acc[worker.id] = worker.firstName;
                return acc;
            }, {});
            setResponsibleNames(workers);
        } catch (error) {
            console.error("Error fetching Bait Workers", error);
        }
    };

    const fetchLocationNames = async () => {
        try {
            const response = await axiosInstance.get(`/location/all`);
            const locations = response.data.reduce((acc, location) => {
                acc[location.id] = location.name;
                return acc;
            }, {});
            setLocationNames(locations);
        } catch (error) {
            console.error('Error fetching locations', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="align-items-center justify-content-between mb-4">
                <Col xs="auto">
                    <h1 className="mb-0">Maintenances</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        {isMobile ? 'Add New' : 'Add Maintenance'}
                    </Button>
                </Col>
            </Row>


            {isMobile ? (
                <>
                    <Row className="mb-3 align-items-center">
                        <Col className="align-items-center">
                            {/* Render the search bar only */}
                            <MaintenanceFilters collapsed setMaintenances={setMaintenances} />
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                            >
                                <FaFilter style={{ marginRight: '0.5rem' }} />
                                {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
                            </Button>
                        </Col>
                    </Row>
                    <Collapse in={showMobileFilters}>
                        <div className="mb-3" style={{ padding: '0 1rem' }}>
                            {/* Render the additional filters */}
                            <MaintenanceFilters advancedOnly setMaintenances={setMaintenances} />
                        </div>
                    </Collapse>
                </>
            ) : (
                <Row className="mt-4 mb-3">
                    <MaintenanceFilters setMaintenances={setMaintenances} />
                </Row>
            )}
            {loading ? (
                <Row className="justify-content-center mt-4">
                    <Col md={2} className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
                ) : (
                <MaintenanceList
                    maintenances={maintenances}
                    locationNames={locationNames}
                    setShowDetailsModal={setShowDetailsModal}
                    setSelectedMaintenance={setSelectedMaintenance}
                />
            )}
            {selectedMaintenance && (
                <MaintenanceDetailsModal
                    show={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    maintenance={selectedMaintenance}
                    locationNames={locationNames}
                    setMaintenance={setSelectedMaintenance}
                    setRefresh={() => setRefresh(!refresh)}
                    responsibleNames={responsibleNames}
                    isMobile={isMobile}
                />
            )}
            <AddMaintenanceModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                clients={customers}
                workers={baitWorkers}
                setRefresh={() => setRefresh(!refresh)}
                onAdd={(id) => selectAddedMaintenance(id)}
            />
        </Container>
    );
};

export default Maintenances;
