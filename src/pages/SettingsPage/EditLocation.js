import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config/config";
import {validatePhoneAndPostalCode} from "../../utils/Validation";

function EditLocation() {
    const { locationId } = useParams();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');
    const [relatedClients, setRelatedClients] = useState([]); // State to hold related clients
    const [relatedWorkers, setRelatedWorkers] = useState([]); // State to hold related workers
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal for delete confirmation
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/location/${locationId}`);
                const locationData = response.data;
                setName(locationData.name);
                const address = locationData.address;
                const addressParts = address.split(',').map(part => part.trim());  // Split address into smaller parts

                setStreetAddress(addressParts[0]);
                setDistrict(addressParts[1]);
                setCity(addressParts[2]);
                setPostalCode(addressParts[3]);
                setCountry(addressParts[4]);

                setPhone(locationData.phone);
            } catch (error) {
                setError('Error fetching location data');
            } finally {
                setLoading(false);
            }
        };


        fetchLocation();
    }, [locationId]);


    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        const isValid = validatePhoneAndPostalCode(
            phone,
            postalCode,
            setPhoneNumberError,
            setPostalCodeError,
            setPhone,
            setPostalCode
        );
        if (isValid) {
            try {
                const combinedAddress = `${streetAddress}, ${district}, ${city}, ${postalCode}, ${country}`;
                await axios.put(`${config.API_BASE_URL}/location/update/${locationId}`, {
                    name,
                    address: combinedAddress,
                    phone
                });
                navigate('/settings/locations');
            } catch (error) {
                setError('Error updating location');
            }
        }
    };

    const handleDeleteLocation = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/location/${locationId}`);
            navigate('/settings/locations');
        } catch (error) {
            setError('Error deleting location');
        }
    };

    // Fetch related clients and workers based on locationId
    const fetchRelatedEntities = async () => {
        try {
            const clientResponse = await axios.get(`${config.API_BASE_URL}/client/search`, {
                params: { locationId }
            });
            setRelatedClients(clientResponse.data); // Set related clients

            // Fetch workers related to the clients found, filtering them by clientId
            const clientIds = clientResponse.data.map(client => client.id); // Get all clientIds related to the location
            const workerResponse = await Promise.all(clientIds.map(clientId =>
                axios.get(`${config.API_BASE_URL}/worker/search`, { params: { clientId } })
            ));

            const workers = workerResponse.flatMap(res => res.data); // Flatten the response array
            setRelatedWorkers(workers); // Set only the workers linked to the specific clients related to the location
        } catch (error) {
            setError('Error fetching related clients or workers');
        }
    };
    // Show the delete modal and fetch related entities
    const handleShowDeleteModal = async () => {
        await fetchRelatedEntities(); // Fetch related clients and workers before showing the modal
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
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


    return (
        <Container className="mt-5">
            <h1>Edit Location</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleUpdateLocation}>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formPhone" className="mt-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        isInvalid={!!phoneNumberError} // Display error styling if there's an error
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {phoneNumberError}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formCountry" className="mt-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter country"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formCity" className="mt-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter City"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formDistrict" className="mt-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter district"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formAddress" className="mt-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Enter Street Address"
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formPostal" className="mt-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Enter Postal Code"
                        required
                        isInvalid={!!postalCodeError} // Display error styling if there's an error
                    />
                    <Form.Control.Feedback type="invalid">
                        {postalCodeError}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" className="mt-3" type="submit" >
                    Update Location
                </Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleShowDeleteModal}>
                    Delete Location
                </Button>
                <Button variant="secondary" className="mt-3 ms-3" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Location Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this location?</p>
                    {relatedClients.length > 0 || relatedWorkers.length > 0 ? (
                        <>
                            <p>This location is linked to the following clients and workers and cannot be deleted:</p>
                            <ul>
                                {relatedClients.map((client) => (
                                    <li key={client.id}>Client: {client.shortName}</li>
                                ))}
                                {relatedWorkers.map((worker) => (
                                    <li key={worker.id}>Worker: {worker.firstName} {worker.lastName}</li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No related clients or workers found. You can proceed with deletion.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
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

export default EditLocation;
