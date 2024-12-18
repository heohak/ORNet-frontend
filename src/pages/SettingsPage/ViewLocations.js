import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Form,
    Modal,
} from 'react-bootstrap';
import config from '../../config/config';
import AddLocationModal from '../OneClientPage/AddLocationModal';
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import { validatePhoneAndPostalCode } from '../../utils/Validation';
import axiosInstance from "../../config/axiosInstance";

function ViewLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPostalCode, setEditPostalCode] = useState('');
    const [editStreetAddress, setEditStreetAddress] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');
    const [relatedClients, setRelatedClients] = useState([]);
    const [relatedWorkers, setRelatedWorkers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Debounce the search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/search`, {
                    params: { q: debouncedQuery.length >= 3 ? debouncedQuery : '' },
                });
                setLocations(response.data);
                setError(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [debouncedQuery, showAddModal, showEditModal]);

    const handleAddLocation = (addedLocation) => {
        setLocations((prevLocations) => [...prevLocations, addedLocation]);
        setShowAddModal(false);
    };

    const handleEdit = (location) => {
        setSelectedLocation(location);
        setEditName(location.name);
        setEditCity(location.city);
        setEditCountry(location.country);
        setEditEmail(location.email);
        setEditPostalCode(location.postalCode);
        setEditStreetAddress(location.streetAddress);
        setEditPhone(location.phone);
        setShowEditModal(true);
    };

    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        const isValid = validatePhoneAndPostalCode(
            editPhone,
            editPostalCode,
            setPhoneNumberError,
            setPostalCodeError,
            setEditPhone,
            setEditPostalCode
        );
        if (isValid) {
            try {
                await axiosInstance.put(
                    `${config.API_BASE_URL}/location/update/${selectedLocation.id}`,
                    {
                        name: editName,
                        country: editCountry,
                        city: editCity,
                        streetAddress: editStreetAddress,
                        postalCode: editPostalCode,
                        phone: editPhone,
                        email: editEmail,
                    }
                );
                // Refresh the locations list
                const response = await axiosInstance.get(`${config.API_BASE_URL}/location/search`, {
                    params: { q: debouncedQuery.length >= 3 ? debouncedQuery : '' },
                });
                setLocations(response.data);
                setShowEditModal(false);
                setSelectedLocation(null);
            } catch (error) {
                setError('Error updating location');
            }
        }
    };

    const fetchRelatedEntities = async () => {
        try {
            const clientResponse = await axiosInstance.get(`${config.API_BASE_URL}/client/search`, {
                params: { locationId: selectedLocation.id },
            });
            setRelatedClients(clientResponse.data);

            const clientIds = clientResponse.data.map((client) => client.id);
            const workerResponse = await Promise.all(
                clientIds.map((clientId) =>
                    axiosInstance.get(`${config.API_BASE_URL}/worker/search`, { params: { clientId } })
                )
            );
            const workers = workerResponse.flatMap((res) => res.data);
            setRelatedWorkers(workers);
        } catch (error) {
            setError('Error fetching related clients or workers');
        }
    };

    const handleShowDeleteModal = async () => {
        await fetchRelatedEntities();
        setShowDeleteModal(true);
    };

    const handleDeleteLocation = async () => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/location/${selectedLocation.id}`);
            // Refresh the locations list
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/search`, {
                params: { q: debouncedQuery.length >= 3 ? debouncedQuery : '' },
            });
            setLocations(response.data);
            setShowDeleteModal(false);
            setShowEditModal(false);
            setSelectedLocation(null);
        } catch (error) {
            setError('Error deleting location');
        }
    };

    return (
        <Container className="mt-4">

            <Button
                variant="link"
                onClick={() => window.history.back()}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }} // Adjust styling as desired
            >
                <FaArrowLeft title="Go back" />
            </Button>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Locations</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Location
                </Button>
            </div>

            {/* Search Input */}
            <Form.Group controlId="search" className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Form.Group>

            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Container className="mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                </Container>
            ) : (
                <>
                    {locations.length === 0 ? (
                        <Alert variant="info">No Locations found.</Alert>
                    ) : (
                        <>
                            {/* Table header */}
                            <Row className="fw-bold mt-2">
                                <Col md={3}>Name</Col>
                                <Col md={5}>Address</Col>
                                <Col md={3}>Phone</Col>
                                <Col md={1}>Actions</Col>
                            </Row>
                            <hr />
                            {/* Location rows */}
                            {locations.map((location, index) => {
                                const rowBgColor =
                                    index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={location.id}
                                        className="align-items-center py-1"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col md={3}>{location.name}</Col>
                                        <Col md={5}>
                                            {location.streetAddress}, {location.city},{' '}
                                            {location.country}, {location.postalCode}
                                        </Col>
                                        <Col md={3}>{location.phone}</Col>
                                        <Col md={1}>
                                            <Button
                                                variant="link"
                                                className="d-flex p-0"
                                                onClick={() => handleEdit(location)}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    )}
                </>
            )}

            {/* Add Location Modal */}
            <AddLocationModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onAddLocation={handleAddLocation}
            />

            {/* Edit Location Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Location</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateLocation}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group controlId="editFormName">
                            <Form.Label>Location Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter name"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormCountry" className="mt-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                                type="text"
                                value={editCountry}
                                onChange={(e) => setEditCountry(e.target.value)}
                                placeholder="Enter country"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormCity" className="mt-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                value={editCity}
                                onChange={(e) => setEditCity(e.target.value)}
                                placeholder="Enter city"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormAddress" className="mt-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={editStreetAddress}
                                onChange={(e) => setEditStreetAddress(e.target.value)}
                                placeholder="Enter street address"
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editFormPostal" className="mt-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={editPostalCode}
                                onChange={(e) => setEditPostalCode(e.target.value)}
                                placeholder="Enter postal code"
                                required
                                isInvalid={!!postalCodeError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {postalCodeError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="editFormPhone" className="mt-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="Enter phone number"
                                isInvalid={!!phoneNumberError}

                            />
                            <Form.Control.Feedback type="invalid">
                                {phoneNumberError}
                            </Form.Control.Feedback>
                        </Form.Group>


                        <Form.Group controlId="editFormEmail" className="mt-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Enter email"
                            />
                        </Form.Group>


                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-info"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Location
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Location
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Location Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this location?</p>
                    {relatedClients.length > 0 || relatedWorkers.length > 0 ? (
                        <>
                            <p>
                                This location is linked to the following customers and contacts
                                and cannot be deleted:
                            </p>
                            <ul>
                                {relatedClients.map((client) => (
                                    <li key={client.id}>Customer: {client.shortName}</li>
                                ))}
                                {relatedWorkers.map((worker) => (
                                    <li key={worker.id}>
                                        Contact: {worker.firstName} {worker.lastName}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>
                            No related customers or contacts found. You can proceed with
                            deletion.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-info"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Close
                    </Button>
                    {relatedClients.length === 0 && relatedWorkers.length === 0 && (
                        <Button variant="danger" onClick={handleDeleteLocation}>
                            Delete Location
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ViewLocations;
