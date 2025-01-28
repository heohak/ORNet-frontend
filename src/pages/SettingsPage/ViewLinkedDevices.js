import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form
} from 'react-bootstrap';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa'; // for comment icon
import config from '../../config/config';
import EditLinkedDeviceModal from './EditLinkedDeviceModal';
import axiosInstance from '../../config/axiosInstance';
import { useLocation } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// Import the same CommentsModal you use for devices
import CommentsModal from '../../modals/CommentsModal';

function ViewLinkedDevices() {
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for adding a new Linked Device
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [productCode, setProductCode] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [description, setDescription] = useState('');
    const [introducedDate, setIntroducedDate] = useState(null);
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]); // for dropdown

    // Edit Linked Device
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLinkedDevice, setSelectedLinkedDevice] = useState(null);

    // Comments
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [commentLinkedDeviceId, setCommentLinkedDeviceId] = useState(null);

    const location = useLocation();

    // If the pathname starts with "/settings", show a back button
    const showBackButton = location.pathname.startsWith('/settings');

    useEffect(() => {
        fetchLinkedDevices();
        fetchAllLocations();
    }, []);

    const fetchLinkedDevices = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `${config.API_BASE_URL}/linked/device/all`
            );
            setLinkedDevices(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching linked devices');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllLocations = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/location/all`);
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    // Create a new Linked Device (without comments)
    const handleAddLinkedDevice = async (e) => {
        e.preventDefault();

        try {
            let introducedDateFormatted = null;
            if (introducedDate) {
                introducedDateFormatted = format(introducedDate, 'yyyy-MM-dd');
            }

            const devicePayload = {
                name,
                manufacturer,
                productCode,
                serialNumber,
                description,
                introducedDate: introducedDateFormatted,
                locationId: locationId ? parseInt(locationId, 10) : null,
            };

            await axiosInstance.post(
                `${config.API_BASE_URL}/linked/device/add`,
                devicePayload
            );

            fetchLinkedDevices();
            setShowAddModal(false);

            // Clear fields
            setName('');
            setManufacturer('');
            setProductCode('');
            setSerialNumber('');
            setDescription('');
            setIntroducedDate(null);
            setLocationId('');
        } catch (err) {
            setError('Error adding linked device');
        }
    };

    // Editing
    const handleEdit = (linkedDevice) => {
        setSelectedLinkedDevice(linkedDevice);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedLinkedDevice(null);
        setShowEditModal(false);
    };

    // Opening Comments Modal
    const handleOpenComments = (deviceId) => {
        setCommentLinkedDeviceId(deviceId);
        setShowCommentsModal(true);
    };

    const handleCloseCommentsModal = () => {
        setCommentLinkedDeviceId(null);
        setShowCommentsModal(false);
    };

    // Basic fields to show in the table
    const defaultFields = [
        { key: 'name', label: 'Name' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'productCode', label: 'Product Code' },
        { key: 'serialNumber', label: 'Serial Number' },
    ];

    return (
        <Container className="mt-4">
            {showBackButton && (
                <Button
                    variant="link"
                    onClick={() => window.history.back()}
                    className="mb-4 p-0"
                    style={{ fontSize: '1.5rem', color: '#0d6efd' }}
                >
                    <FaArrowLeft title="Go back" />
                </Button>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Linked Devices</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Linked Device
                </Button>
            </div>

            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : linkedDevices.length === 0 ? (
                <Alert variant="info">No linked devices found.</Alert>
            ) : (
                <>
                    {/* Table Header */}
                    <Row className="fw-bold mt-2">
                        {defaultFields.map((field) => (
                            <Col key={field.key}>{field.label}</Col>
                        ))}
                        <Col>Actions</Col>
                    </Row>
                    <hr />
                    {/* Linked Devices Rows */}
                    {linkedDevices.map((device, index) => {
                        const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        return (
                            <Row
                                key={device.id}
                                className="align-items-center py-1"
                                style={{ backgroundColor: rowBgColor }}
                            >
                                {defaultFields.map((field) => (
                                    <Col key={field.key}>{device[field.key]}</Col>
                                ))}
                                <Col>
                                    {/* Edit button */}
                                    <Button
                                        variant="link"
                                        className="p-0 me-2"
                                        onClick={() => handleEdit(device)}
                                        title="Edit Linked Device"
                                    >
                                        <FaEdit />
                                    </Button>
                                    {/* Comment button */}
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        onClick={() => handleOpenComments(device.id)}
                                        title="View/Add Comments"
                                    >
                                        <FaComments />
                                    </Button>
                                </Col>
                            </Row>
                        );
                    })}
                </>
            )}

            {/* Add Linked Device Modal */}
            <Modal backdrop="static" show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Linked Device</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLinkedDevice}>
                    <Modal.Body>
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

                        <Form.Group controlId="formManufacturer" className="mt-3">
                            <Form.Label>Manufacturer</Form.Label>
                            <Form.Control
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                placeholder="Enter manufacturer"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formProductCode" className="mt-3">
                            <Form.Label>Product Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="Enter product code"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formSerialNumber" className="mt-3">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                placeholder="Enter serial number"
                                required
                            />
                        </Form.Group>

                        {/* Location */}
                        <Form.Group controlId="formLocation" className="mt-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                as="select"
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                            >
                                <option value="">Select Location</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        {/* Introduced Date */}
                        <Form.Group controlId="formIntroducedDate" className="mt-3">
                            <Form.Label>Introduced Date</Form.Label>
                            <div>
                            <ReactDatePicker
                                selected={introducedDate}
                                onChange={(date) => setIntroducedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="form-control"
                                placeholderText="Select introduced date"
                                isClearable
                            />
                            </div>
                        </Form.Group>

                        {/* Description */}
                        <Form.Group controlId="formDescription" className="mt-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-info"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Linked Device
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Linked Device Modal */}
            {selectedLinkedDevice && (
                <EditLinkedDeviceModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    linkedDevice={selectedLinkedDevice}
                    onUpdate={fetchLinkedDevices}
                />
            )}

            {/* Comments Modal (for Linked Device) */}
            {commentLinkedDeviceId && (
                <CommentsModal
                    show={showCommentsModal}
                    handleClose={handleCloseCommentsModal}
                    deviceId={commentLinkedDeviceId}
                    isLinkedDevice={true} // So the modal calls /linked/device/comment/ID
                />
            )}
        </Container>
    );
}

export default ViewLinkedDevices;
