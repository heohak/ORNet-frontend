import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import { validatePhoneAndPostalCode } from '../../utils/Validation';
import axiosInstance from "../../config/axiosInstance";

function AddLocationModal({ show, onHide, onAddLocation }) {
    const [newLocation, setNewLocation] = useState({
        name: '',
        city: '',
        country: '',
        email: '',
        postalCode: '',
        streetAddress: '',
        phone: ''
    });
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [postalCodeError, setPostalCodeError] = useState('');
    const [error, setError] = useState(null);
    const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (isSubmittingLocation) return;
        setIsSubmittingLocation(true);

        let { name, city, country, email, postalCode, streetAddress, phone } = newLocation;

        // Validate phone number and postal code
        const isValid = validatePhoneAndPostalCode(
            phone,
            postalCode,
            setPhoneNumberError,
            setPostalCodeError,
            () => setNewLocation({ ...newLocation, phone }),
            () => setNewLocation({ ...newLocation, postalCode })
        );
        if (phone === '') {
            phone = null;
        }

        if (!isValid) {
            setIsSubmittingLocation(false);
            return;
        }

        try {
            const response = await axiosInstance.post(`${config.API_BASE_URL}/location/add`, {
                name,
                country,
                city,
                streetAddress,
                postalCode,
                phone,
                email
            });

            const addedLocation = response.data;

            // Pass the new location back to the parent component
            if (onAddLocation) {
                onAddLocation(addedLocation);
            }

            // Reset form fields
            setNewLocation({
                name: '',
                city: '',
                country: '',
                email: '',
                postalCode: '',
                streetAddress: '',
                phone: ''
            });
            setPhoneNumberError('');
            setPostalCodeError('');
            setError(null);
            onHide();
        } catch (error) {
            console.error('Error adding location:', error);
            setError('Error adding location.');
        } finally {
            setIsSubmittingLocation(false);
        }
    };

    return (
        <Modal backdrop="static" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Location</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddLocation}>
                <Modal.Body>
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}
                    {/* Location Name */}
                    <Form.Group controlId="formName">
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            placeholder="Enter location name"
                            required
                        />
                    </Form.Group>
                    {/* Country */}
                    <Form.Group controlId="formCountry" className="mt-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.country}
                            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                            placeholder="Enter country"
                            required
                        />
                    </Form.Group>
                    {/* City */}
                    <Form.Group controlId="formCity" className="mt-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.city}
                            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                            placeholder="Enter city"
                            required
                        />
                    </Form.Group>
                    {/* Street Address */}
                    <Form.Group controlId="formStreetAddress" className="mt-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.streetAddress}
                            onChange={(e) => setNewLocation({ ...newLocation, streetAddress: e.target.value })}
                            placeholder="Enter street address"
                            required
                        />
                    </Form.Group>
                    {/* Postal Code */}
                    <Form.Group controlId="formPostalCode" className="mt-3">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.postalCode}
                            onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                            placeholder="Enter postal code"
                            required
                            isInvalid={!!postalCodeError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {postalCodeError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {/* Phone */}
                    <Form.Group controlId="formPhone" className="mt-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={newLocation.phone}
                            onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                            placeholder="Enter phone number"
                            isInvalid={!!phoneNumberError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {phoneNumberError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {/* Email */}
                    <Form.Group controlId="formEmail" className="mt-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={newLocation.email}
                            onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                            placeholder="Enter email"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmittingLocation}>
                        {isSubmittingLocation ? 'Adding...' : 'Add Location'}
                    </Button>
                </Modal.Footer>
            </Form>

        </Modal>
    );
}

export default AddLocationModal;
