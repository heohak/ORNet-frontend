import React, { useEffect, useState, useMemo } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import TrainingFilters from './TrainingFilters';
import AddTrainingModal from './AddTrainingModal';
import TrainingService from './TrainingService';
import axiosInstance from '../../config/axiosInstance';
import { DateUtils } from "../../utils/DateUtils"; // Import DateUtils for date formatting
import TrainingDetailsModal from './TrainingDetailsModal';

const Trainings = () => {
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [trainerNames, setTrainerNames] = useState({});
    const [clientNames, setClientNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async (filters = {}) => {
        setLoading(true);
        try {
            let data = await TrainingService.getTrainings(filters);
            // Initially, the trainings were sorted by date descending.
            setTrainings(data);
            fetchTrainers(data);
            fetchClients(data);
            fetchLocations(data);
        } catch (error) {
            console.error('Error fetching trainings:', error);
        }
        setLoading(false);
    };

    const fetchTrainers = async (trainings) => {
        try {
            const trainerIds = [...new Set(trainings.flatMap(t => t.trainersIds))];
            const trainerRequests = trainerIds.map(id => axiosInstance.get(`/bait/worker/${id}`));
            const responses = await Promise.all(trainerRequests);
            const workers = responses.reduce((acc, response) => {
                acc[response.data.id] = response.data.firstName;
                return acc;
            }, {});
            setTrainerNames(workers);
        } catch (error) {
            console.error('Error fetching trainers:', error);
        }
    };

    const fetchClients = async (trainings) => {
        try {
            const clientIds = [...new Set(trainings.map(t => t.clientId))];
            const clientRequests = clientIds.map(id => axiosInstance.get(`/client/${id}`));
            const responses = await Promise.all(clientRequests);
            const clients = responses.reduce((acc, response) => {
                acc[response.data.id] = response.data.fullName;
                return acc;
            }, {});
            setClientNames(clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchLocations = async (trainings) => {
        try {
            const locationIds = [...new Set(trainings.map(t => t.locationId))];
            const locationRequests = locationIds.map(id => axiosInstance.get(`/location/${id}`));
            const responses = await Promise.all(locationRequests);
            const locations = responses.reduce((acc, response) => {
                acc[response.data.id] = response.data.name;
                return acc;
            }, {});
            setLocationNames(locations);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this training?')) {
            try {
                await TrainingService.deleteTraining(id);
                fetchTrainings();
                setShowDetailsModal(false);
            } catch (error) {
                console.error('Error deleting training:', error);
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const sortedTrainings = useMemo(() => {
        let sortableTrainings = [...trainings];
        if (sortConfig) {
            sortableTrainings.sort((a, b) => {
                let aValue, bValue;
                switch (sortConfig.key) {
                    case 'name':
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case 'client':
                        aValue = (clientNames[a.clientId] || a.clientId.toString()).toLowerCase();
                        bValue = (clientNames[b.clientId] || b.clientId.toString()).toLowerCase();
                        break;
                    case 'location':
                        // If a's location is null/undefined and b's is not, sort a after b.
                        if (a.locationId == null && b.locationId != null) {
                            return 1;
                        }
                        // If b's location is null/undefined and a's is not, sort b after a.
                        if (a.locationId != null && b.locationId == null) {
                            return -1;
                        }
                        // If both are null, consider them equal.
                        if (a.locationId == null && b.locationId == null) {
                            return 0;
                        }
                        aValue = (locationNames[a.locationId] || a.locationId.toString()).toLowerCase();
                        bValue = (locationNames[b.locationId] || b.locationId.toString()).toLowerCase();
                        break;
                    case 'type':
                        aValue = a.trainingType.toLowerCase();
                        bValue = b.trainingType.toLowerCase();
                        break;
                    case 'date':
                        aValue = new Date(a.trainingDate);
                        bValue = new Date(b.trainingDate);
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableTrainings;
    }, [trainings, sortConfig, clientNames, locationNames]);

    return (
        <Container className="mt-5">
            <Row className="d-flex justify-content-between mb-4">
                <Col className="col-md-auto">
                    <h1 className="mb-0">Trainings</h1>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Training</Button>
                </Col>
            </Row>

            <Row className="mt-4">
                <TrainingFilters onFilter={setTrainings} />
            </Row>

            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={3} onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name {renderSortArrow('name')}
                </Col>
                <Col md={3} onClick={() => handleSort('client')} style={{ cursor: 'pointer' }}>
                    Client {renderSortArrow('client')}
                </Col>
                <Col md={3} onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                    Location {renderSortArrow('location')}
                </Col>
                <Col md={2} onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                    Type {renderSortArrow('type')}
                </Col>
                <Col md={1} onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    Date {renderSortArrow('date')}
                </Col>
            </Row>
            <hr />

            {sortedTrainings.map((training, index) => {
                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                return (
                    <Row
                        key={training.id}
                        className="align-items-center"
                        style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                        onClick={() => { setSelectedTraining(training); setShowDetailsModal(true); }}
                    >
                        <Col md={3} className="py-2">
                            {training.name}
                        </Col>
                        <Col md={3} className="py-2">
                            {clientNames[training.clientId] || training.clientId}
                        </Col>
                        <Col md={3} className="py-2">
                            {locationNames[training.locationId] || training.locationId}
                        </Col>
                        <Col md={2} className="py-2">
                            {training.trainingType}
                        </Col>
                        <Col md={1} className="py-2">
                            {DateUtils.formatDate(training.trainingDate)}
                        </Col>
                    </Row>
                );
            })}

            {showAddModal && (
                <AddTrainingModal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    onSave={fetchTrainings}
                />
            )}
            {showDetailsModal && selectedTraining && (
                <TrainingDetailsModal
                    show={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    training={selectedTraining}
                    trainerNames={trainerNames}
                    clientNames={clientNames}
                    locationNames={locationNames}
                    onUpdate={(updatedTraining) => {
                        setSelectedTraining(updatedTraining);
                        fetchTrainings();
                    }}
                    onDelete={() => handleDelete(selectedTraining.id)}
                />
            )}
        </Container>
    );
};

export default Trainings;
