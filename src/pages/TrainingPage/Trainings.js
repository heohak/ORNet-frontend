import React, { useEffect, useState } from 'react';
import {Container, Table, Button, Modal, Spinner, Row, Col} from 'react-bootstrap';
import TrainingFilters from './TrainingFilters';
import AddTrainingModal from './AddTrainingModal';
import EditTrainingModal from './EditTrainingModal';
import TrainingService from './TrainingService';
import axiosInstance from '../../config/axiosInstance';
import {DateUtils} from "../../utils/DateUtils";
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

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async (filters = {}) => {
        setLoading(true);
        try {
            let data = await TrainingService.getTrainings(filters);
            data = data.sort((a, b) => new Date(b.trainingDate) - new Date(a.trainingDate));

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
                <Col md={3}>Name</Col>
                <Col md={3}>Client</Col>
                <Col md={3}>Location</Col>
                <Col md={2}>Type</Col>
                <Col md={1}>Date</Col>
            </Row>
            <hr />

            {trainings.map((training, index) => {
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

            {showAddModal && <AddTrainingModal show={showAddModal} onHide={() => setShowAddModal(false)} onSave={fetchTrainings} />}
            {showEditModal && (
                <EditTrainingModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    training={selectedTraining}
                    onSave={(updatedTraining) => {
                        setSelectedTraining(updatedTraining); // Update details modal
                        fetchTrainings();
                    }}
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
                    onEdit={() => setShowEditModal(true)}
                    onUpdate={(updatedTraining) => setSelectedTraining(updatedTraining)} // Refresh details modal
                    onDelete={() => handleDelete(selectedTraining.id)}
                />
            )}
        </Container>
    );
};

export default Trainings;
