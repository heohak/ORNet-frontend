import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
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
                <Button variant="primary" className="mt-3" type='submit'>
                    Update Location
                </Button>
                <Button variant="danger" className="mt-3 ms-3" onClick={handleDeleteLocation}>
                    Delete Location
                </Button>
                <Button variant="secondary" className="mt-3 ms-3" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </Form>
        </Container>
    );
}

export default EditLocation;
