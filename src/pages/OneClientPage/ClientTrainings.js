import {Alert, Button, Col, Row} from "react-bootstrap";
import {DateUtils} from "../../utils/DateUtils";
import React, {useEffect, useState} from "react";
import AddTrainingModal from "../TrainingPage/AddTrainingModal";
import TrainingDetailsModal from "../TrainingPage/TrainingDetailsModal";
import axiosInstance from "../../config/axiosInstance";
import TrainingService from "../TrainingPage/TrainingService";


const ClientTrainings = ({trainings, locations, clientId, setTrainings, clientName}) => {
    const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [trainerNames, setTrainerNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [clientNames, setClientNames] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });


    useEffect(() => {
        fetchTrainers();
        const locationsMap = locations.reduce((acc, location) => {
            acc[location.id] = location.name;
            return acc;
        }, {});
        setLocationNames(locationsMap);
        const client = { [clientId]: clientName }
        setClientNames(client);
    },[]);

    const fetchTrainers = async() => {
        try {
            const response = await axiosInstance.get(`/bait/worker/all`)
            const workers = response.data.reduce((acc, worker) => {
                acc[worker.id] = worker.firstName;
                return acc;
            }, {});
            setTrainerNames(workers);
        } catch (error) {
            console.error('Error fetching Bait Workers:', error);
        }
    }

    const fetchTrainings = async() => {
        try {
            const response = await axiosInstance.get(`/training/client/${clientId}`)
            setTrainings(response.data);
        } catch (error) {
            console.error('Error fetching trainings', error);
        }
    }



    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTrainings = [...trainings].sort((a, b) => {
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];

        // Ensure case-insensitive sorting and handle location name lookup
        if (sortConfig.key === 'location') {
            valueA = locationNames[a.locationId]?.toLowerCase() || '';
            valueB = locationNames[b.locationId]?.toLowerCase() || '';
        } else if (sortConfig.key === 'date') {
            valueA = new Date(a.trainingDate);
            valueB = new Date(b.trainingDate);
        } else {
            valueA = valueA?.toString().toLowerCase() || '';
            valueB = valueB?.toString().toLowerCase() || '';
        }

        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });



    const renderSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕';
    };

    const handleTrainingClick = (training) => {
        setShowTrainingModal(true);
        setSelectedTraining(training);
    }
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this training?')) {
            try {
                await TrainingService.deleteTraining(id);
                fetchTrainings();
                setShowTrainingModal(false);
            } catch (error) {
                console.error('Error deleting training:', error);
            }
        }
    };



    return (
        <>
            <Row className="row-margin-0 d-flex justify-content-between align-items-center mb-2">
                <Col className="col-md-auto">
                    <h2 className="mb-0" style={{paddingBottom: "20px"}}>
                        Trainings
                    </h2>
                </Col>
                <Col className="col-md-auto">
                    <Button variant="primary" onClick={() => setShowAddTrainingModal(true)}>
                        Add Training
                    </Button>
                </Col>
            </Row>

            {/* Sortable Table Headers */}
            <Row className="row-margin-0 fw-bold">
                <Col md={4} onClick={() => handleSort('name')}>
                    Training Name {renderSortArrow('name')}
                </Col>
                <Col md={3} onClick={() => handleSort('trainingType')}>
                    Type {renderSortArrow('trainingType')}
                </Col>
                <Col md={3} onClick={() => handleSort('location')}>
                    Location {renderSortArrow('location')}
                </Col>
                <Col md={2} onClick={() => handleSort('date')}>
                    Date {renderSortArrow('date')}
                </Col>
            </Row>
            <hr />

            {/* Maintenance List */}
            {sortedTrainings.length > 0 ? (
                sortedTrainings.map((training, index) => {
                    const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    const locationName = locations.find(loc => (loc.id === training.locationId))?.name;
                    return (
                        <Row
                            key={training.id}
                            className="align-items-center"
                            style={{ margin: '0 0', cursor: 'pointer' }}
                            onClick={() => handleTrainingClick(training)}
                        >
                            <Col className="py-2" style={{ backgroundColor: rowBgColor}}>
                                <Row className="align-items-center">
                                    <Col md={4}>{training.name}</Col>
                                    <Col md={3}>{training.trainingType}</Col>
                                    <Col md={3}>{locationName}</Col>
                                    <Col md={2}>{DateUtils.formatDate(training.trainingDate)}</Col>
                                </Row>
                            </Col>
                        </Row>
                    );
                })
            ) : (
                <Alert className="mt-3" variant="info">No trainings available.</Alert>
            )}

            {/* Add Maintenance Modal */}
            <AddTrainingModal
                show={showAddTrainingModal}
                onHide={() => setShowAddTrainingModal(false)}
                onSave={fetchTrainings}
                clientId={clientId}
            />

            {/* Maintenance Details Modal */}
            {selectedTraining &&
                <TrainingDetailsModal
                    show={showTrainingModal}
                    onHide={() => setShowTrainingModal(false)}
                    training={selectedTraining}
                    trainerNames={trainerNames}
                    clientNames={clientNames}
                    locationNames={locationNames}
                    onEdit={() => setShowEditModal(true)}
                    onDelete={() => handleDelete(selectedTraining.id)}
                    onUpdate={(updatedTraining) => {
                        setSelectedTraining(updatedTraining);
                        fetchTrainings();
                    }}
                />
            }
        </>
    );

}

export default ClientTrainings;