import React, { useState, useEffect, useRef } from 'react';
import {Modal, Row, Col, Accordion, Button, Spinner, Form} from 'react-bootstrap';
import axios from 'axios';
import config from '../../../config/config';
import { FaUpload } from 'react-icons/fa';
import FileList from '../../../modals/FileList';
import { format } from 'date-fns';
import axiosInstance from "../../../config/axiosInstance";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit} from "@fortawesome/free-solid-svg-icons";

function MaintenanceModal({ show, handleClose, maintenanceId, locationName, setRefresh }) {
    const [maintenance, setMaintenance] = useState(null);
    const [files, setFiles] = useState([]);
    const [activeKey, setActiveKey] = useState('0');
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);  // Edit mode state
    const [title, setTitle] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [comment, setComment] = useState('');


    useEffect(() => {
        if (maintenanceId && show) {
            setMaintenance(null);
            fetchMaintenanceDetails(maintenanceId);
        }
    }, [maintenanceId, show]);



    const handleSaveEditing = async () => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/maintenance/update/${maintenance.id}`, {
                comment: comment,
                maintenanceName: title,
            });
            setIsEditing(false); // Exit edit mode after saving
            setRefresh(prev => !prev);
        } catch (error) {
            console.error('Error saving the comment: ',error);
        }
    };
    const fetchMaintenanceDetails = async (id) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/maintenance/${id}`);
            const maintenanceData = response.data;

            // Extract maintenance name and date directly from the maintenance object
            const maintenanceName = maintenanceData.maintenanceName || 'Maintenance';
            const maintenanceDate = maintenanceData.maintenanceDate
                ? format(new Date(maintenanceData.maintenanceDate), 'dd.MM.yyyy')
                : '';
            setMaintenanceDate(maintenanceDate)
            setTitle(maintenanceName)
            setComment(maintenanceData.comment)

            setMaintenance(maintenanceData);
            fetchMaintenanceFiles(id);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };

    const fetchMaintenanceFiles = async (id) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/maintenance/files/${id}`);
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
                formData.append('files', selectedFile);

                await axiosInstance.put(`${config.API_BASE_URL}/maintenance/upload/${maintenance.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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
        setActiveKey((prevKey) => (prevKey === key ? null : key));
    };

    if (!maintenance) {
        return (
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Maintenance Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Spinner animation="border" />
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} backdrop="static" onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Maintenance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    {/* Display Maintenance Name and Date */}
                    <Row className="mb-3">
                        <Col>
                            {isEditing ? (
                                <Form.Control
                                    as="textarea"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    rows={1}
                                    style={{ width: '100%' }}
                                />
                            ) : (
                            <h5>{title} - {maintenanceDate}</h5>
                            )}
                            {locationName && <p>{locationName}</p>}
                        </Col>
                        <Col className="col-md-auto">
                            {!isEditing ? (
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        cursor: 'pointer',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s',
                                    }}
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    onClick={handleSaveEditing}
                                    style={{
                                        cursor: 'pointer',
                                        opacity: 0.8,
                                        transition: 'opacity 0.2s',
                                    }}
                                />
                            )}
                        </Col>
                    </Row>

                    <Row>
                    <Col md={8}>
                        </Col>
                        <Col md={4}>
                            {/* Files Accordion */}
                            <Accordion activeKey={activeKey}>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header onClick={() => handleAccordionToggle('1')}>
                                        <div
                                            style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                                        >
                                            Files
                                            <Button
                                                variant="link"
                                                onClick={handleIconClick}
                                                style={{ textDecoration: 'none', padding: 0 }}
                                                className="me-2 d-flex"
                                            >
                                                <FaUpload />
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
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
                </>
            </Modal.Body>
        </Modal>
    );
}

export default MaintenanceModal;
