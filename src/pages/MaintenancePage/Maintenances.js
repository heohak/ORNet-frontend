import React, {useEffect, useState} from 'react';
import {Container, Button, Row, Col} from 'react-bootstrap';
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceList from "./MaintenanceList";
import axiosInstance from "../../config/axiosInstance";
import MaintenanceDetailsModal from "./MaintenanceDetailsModal";
import AddMaintenanceModal from "./AddMaintenanceModal";


const Maintenances = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [responsibleNames, setResponsibleNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [baitWorkers, setBaitWorkers] = useState([]);

    useEffect(() => {
        fetchMaintenances();
        fetchLocationNames();
        fetchResponsibleNames();
    },[refresh]);

    useEffect(() => {
        fetchCustomers();
        fetchBaitWorkers();
    },[])


    const fetchBaitWorkers = async() => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`)
            const workers = response.data.map(worker => ({value: worker.id, label: `${worker.firstName} ${worker.lastName}`}))
            setBaitWorkers(workers)
        } catch (error) {
            console.error("Error fetching Bait Workers", error);
        }
    }
    const fetchCustomers = async() => {
        try {
            const response = await axiosInstance.get(`/client/all`)
            setCustomers(response.data)
        } catch (error) {
            console.error("Error fetching customers", error)
        }
    }
    const fetchMaintenances = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/all`)
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error fetching maintenances', error);
        }
    }

    const fetchResponsibleNames = async() => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`)
            const workers = response.data.reduce((acc, worker) => {
                acc[worker.id] = worker.firstName;
                return acc;
            }, {});
            setResponsibleNames(workers);
        } catch (error) {
            console.error("Error fetching Bait Workers", error)
        }
    }

    const fetchLocationNames = async() => {
        try {
            const response = await axiosInstance.get(`/location/all`)
            const locations = response.data.reduce((acc, location) => {
                acc[location.id] = location.name;
                return acc;
            }, {});
            setLocationNames(locations);
        } catch (error) {
            console.error('Error fetching locations', error)
        }
    }

    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between mb-4">
                <Col className="col-md-auto">
                    <h1 className="mb-0">Maintenances</h1>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Maintenance</Button>
                </Col>
            </Row>

            <Row className="mt-4">
                <MaintenanceFilters
                    setMaintenances={setMaintenances}
                />
            </Row>

            <MaintenanceList
                maintenances={maintenances}
                locationNames={locationNames}
                setShowDetailsModal={setShowDetailsModal}
                setSelectedMaintenance={setSelectedMaintenance}
            />
            {selectedMaintenance &&
                <MaintenanceDetailsModal
                    show={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    maintenance={selectedMaintenance}
                    locationNames={locationNames}
                    setMaintenance={setSelectedMaintenance}
                    setRefresh={() => setRefresh(!refresh)}
                    responsibleNames={responsibleNames}
                />
            }
            <AddMaintenanceModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                clients={customers}
                workers={baitWorkers}
            />

        </Container>
    );
};

export default Maintenances;
