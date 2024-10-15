// MaintenanceModal.js
import React, { useState, useEffect, useRef } from 'react';
import {Modal, Row, Col, Accordion, Button, Spinner} from 'react-bootstrap';
import axios from 'axios';
import config from "../../config/config";
import { FaPaperclip } from 'react-icons/fa';
import FileList from '../../modals/FileList';
import MaintenanceComment from "./MaintenanceComment";

function MaintenanceModal({ show, handleClose, maintenanceId }) {
    const [maintenance, setMaintenance] = useState(null);
    const [files, setFiles] = useState([]);
    const [activeKey, setActiveKey] = useState('0');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (maintenanceId && show) {
            setMaintenance(null);
            fetchMaintenanceDetails(maintenanceId);
        }
    }, [maintenanceId, show]);

    const fetchMaintenanceDetails = async (id) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/maintenance/${id}`);
            setMaintenance(response.data);
            fetchMaintenanceFiles(id);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };

    const fetchMaintenanceFiles = async (id) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/maintenance/files/${id}`);
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching maintenance files:', error);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && maintenance) {
            try {
                const formData = new FormData();
                formData.append("files", selectedFile);

                await axios.put(`${config.API_BASE_URL}/maintenance/upload/${maintenance.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                fetchMaintenanceFiles(maintenance.id);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    const handleIconClick = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Maintenance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {maintenance ? (
                    <Row>
                        <Col md={8}>
                            <MaintenanceComment maintenance={maintenance} />
                        </Col>
                        <Col md={4}>
                            <Accordion activeKey={activeKey}>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header onClick={() => handleAccordionToggle("1")}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            Files
                                            <Button
                                                variant="link"
                                                onClick={handleIconClick}
                                                style={{ textDecoration: "none", padding: 0 }}
                                                className="me-2 d-flex"
                                            >
                                                <FaPaperclip />
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleFileChange}
                                        />
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <FileList files={files} />
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Col>
                    </Row>
                ) : (
                    <Spinner animation="border" />
                )}
            </Modal.Body>
        </Modal>
    );
}

export default MaintenanceModal;
