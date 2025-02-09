import React, {useEffect, useState} from 'react';
import {Container, Button, Row, Col} from 'react-bootstrap';
import MaintenanceFilters from "./MaintenanceFilters";
import MaintenanceList from "./MaintenanceList";
import axiosInstance from "../../config/axiosInstance";
import MaintenanceDetailsModal from "./MaintenanceDetailsModal";


const Maintenances = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [trainerNames, setTrainerNames] = useState({});
    const [clientNames, setClientNames] = useState({});
    const [locationNames, setLocationNames] = useState({});

    useEffect(() => {
        fetchMaintenances();
        fetchLocationNames();
    },[]);

    const fetchMaintenances = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/all`)
            setMaintenances(response.data);
        } catch (error) {
            console.error('Error fetching maintenances', error);
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
                />

            }

        </Container>
    );
};

export default Maintenances;
