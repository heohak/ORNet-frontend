import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Form, Row, Col, Accordion, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import { FaPaperclip } from 'react-icons/fa';  // Import the paperclip icon
import FileList from '../../modals/FileList'; // Assuming this is a reusable component for listing files
import MaintenanceComment from "./MaintenanceComment";
import AddMaintenanceModal from "./AddMaintenanceModal";
import '../../css/Customers.css';

function ClientMaintenances({ maintenances, clientId, setRefresh, client }) {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [files, setFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [activeKey, setActiveKey] = useState('0');
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (selectedMaintenance) {
            fetchMaintenanceFiles(selectedMaintenance.id);
        }
    }, [selectedMaintenance]);

    const fetchMaintenanceFiles = async (maintenanceId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/maintenance/files/${maintenanceId}`);
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching maintenance files:', error);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedMaintenance) {
            try {
                const formData = new FormData();
                formData.append("files", selectedFile);

                // Upload the selected file to the maintenance
                await axios.put(`${config.API_BASE_URL}/maintenance/upload/${selectedMaintenance.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Refetch files after upload
                fetchMaintenanceFiles(selectedMaintenance.id);
                setNewFiles([]);
            } catch (error) {
                setError('Error uploading file.');
                console.error('Error uploading file:', error);
            }
        }
    };

    const handleIconClick = (e) => {
        e.stopPropagation(); // Prevent accordion from collapsing
        fileInputRef.current.click(); // Trigger file input
    };

    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle accordion
    };

    // Inside ClientMaintenances component
    const handleMaintenanceCardClick = async (maintenanceId) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/maintenance/${maintenanceId}`);
            setSelectedMaintenance(response.data);
            setShowMaintenanceModal(true);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };


    return (
        <>
            <Row className="d-flex justify-content-between align-items-center">
                <Col>
                    <h2 className="mt-1">Maintenances</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowAddMaintenanceModal(true)}>
                        Add Maintenance
                    </Button>
                </Col>
            </Row>
            <Row className="mt-1">
                {maintenances.length > 0 ? (
                    maintenances.map((maintenance) => (
                        <Col md={4} key={maintenance.id} className="mb-4">
                            <Card className="h-100 position-relative customer-page-card" onClick={() => handleMaintenanceCardClick(maintenance.id)}>
                                <Card.Body className="all-page-cardBody">
                                    <Card.Title className='all-page-cardTitle'>{maintenance.maintenanceName}</Card.Title>
                                    <Card.Text className='all-page-cardText'>
                                        <strong>Date:</strong> {maintenance.maintenanceDate}<br />
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Alert className="mt-3" variant="info">No maintenances available.</Alert>
                )}
            </Row>
            {/* Add Maintenance Modal */}
            <AddMaintenanceModal
                show={showAddMaintenanceModal}
                handleClose={() => setShowAddMaintenanceModal(false)}
                clientId={clientId}
                setRefresh={setRefresh}
                client={client}
            />

            {/* Maintenance Modal */}
            <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Maintenance Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMaintenance && (
                        <Row>
                            {/* Left Side: Comment Section */}
                            <Col md={8}>
                                {/* Comment Section */}
                                <MaintenanceComment maintenance={selectedMaintenance} />
                            </Col>

                            {/* Right Side: Files Accordion Section */}
                            <Col md={4}>
                                <Accordion activeKey={activeKey}>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header onClick={() => handleAccordionToggle("1")}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                Files
                                                <Button
                                                    variant="link"
                                                    onClick={handleIconClick}  // Trigger file input on icon click
                                                    style={{ textDecoration: "none", padding: 0 }}
                                                    className="me-2 d-flex"
                                                >
                                                    <FaPaperclip />
                                                </Button>
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: "none" }} // Hide the file input
                                                onChange={handleFileChange} // Handle file selection
                                            />
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <FileList files={files} />
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Col>
                        </Row>

                    )}
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ClientMaintenances;
