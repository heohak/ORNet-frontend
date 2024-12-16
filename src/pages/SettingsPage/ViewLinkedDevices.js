import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
} from 'react-bootstrap';
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import config from '../../config/config';
import EditLinkedDeviceModal from "./EditLinkedDeviceModal";

function ViewLinkedDevices() {
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [productCode, setProductCode] = useState('');
    const [serialNumber, setSerialNumber] = useState('');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLinkedDevice, setSelectedLinkedDevice] = useState(null);

    useEffect(() => {
        fetchLinkedDevices();
    }, []);

    const fetchLinkedDevices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/linked/device/all`);
            setLinkedDevices(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching linked devices');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLinkedDevice = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/linked/device/add`, {
                name,
                manufacturer,
                productCode,
                serialNumber,
            });
            fetchLinkedDevices();
            setShowAddModal(false);
            setName('');
            setManufacturer('');
            setProductCode('');
            setSerialNumber('');
        } catch (error) {
            setError('Error adding linked device');
        }
    };

    const handleEdit = (linkedDevice) => {
        setSelectedLinkedDevice(linkedDevice);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedLinkedDevice(null);
        setShowEditModal(false);
    };

    const defaultFields = [
        { key: 'name', label: 'Name' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'productCode', label: 'Product Code' },
        { key: 'serialNumber', label: 'Serial Number' },
    ];

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
            ) : (
                <>
                    {linkedDevices.length === 0 ? (
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
                                        className="align-items-center"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        {defaultFields.map((field) => (
                                            <Col key={field.key}>{device[field.key]}</Col>
                                        ))}
                                        <Col>
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={() => handleEdit(device)}
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

            {/* Add Linked Device Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
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
        </Container>
    );
}

export default ViewLinkedDevices;
