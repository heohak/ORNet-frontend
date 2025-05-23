import {Alert, Button, Col, Form, Modal, Row, Spinner, Dropdown, Card} from "react-bootstrap";
import React, { useEffect, useState } from "react";
import {DateUtils, formatLocalDate} from "../../utils/DateUtils";
import axiosInstance from "../../config/axiosInstance";
import TextareaAutosize from "react-textarea-autosize";
import Linkify from "react-linkify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {FaEdit, FaFileUpload, FaPlus, FaSave, FaCheckCircle, FaExclamationCircle, FaTrash} from "react-icons/fa";
import ShowFilesModal from "./ShowFilesModal";
import DeleteConfirmModal from "./DeleteConfirmModal";


const MaintenanceDetailsModal = ({ show, onHide, maintenance, locationNames, setMaintenance, setRefresh, responsibleNames, isMobile }) => {
    const [devices, setDevices] = useState([]);
    const [softwares, setSoftwares] = useState([]);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [firstDate, setFirstDate] = useState(null);
    const [lastDate, setLastDate] = useState(null);
    const [plannedDate, setPlannedDate] = useState(null);
    const [description, setDescription] = useState("");
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [status, setStatus] = useState("");
    const [comments, setComments] = useState([]); // device, soft or link device objects with its attributes
    const [editableComments, setEditableComments] = useState([]);
    const [responsibleId, setResponsibleId] = useState();
    const [selectedCommentId, setSelectedCommentId] = useState("");
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [internalComment, setInternalComment] = useState('');




    useEffect(() => {
        if (show && maintenance.id) {
            setDescription(maintenance.description || "");
            setInternalComment(maintenance.internalComment || "");
            setFirstDate(maintenance.firstDate ? new Date(maintenance.firstDate) : null);
            setLastDate(maintenance.lastDate ? new Date(maintenance.lastDate) : null);
            setPlannedDate(maintenance.maintenanceDate ? new Date(maintenance.maintenanceDate) : null);
            setStatus(maintenance.maintenanceStatus || "OPEN")
            setResponsibleId(maintenance.baitWorkerId || "")
            setEditableComments([]); // Reset editableComments when a new maintenance is loaded
            fetchDevices();
            fetchComments();
        }
    }, [show, maintenance.id]);


    const onClose = () => {
        onHide();
        setDevices([]);
        setLinkedDevices([]);
        setSoftwares([]);
        if (isEditing) {
            toggleEdit();
        }
    }

    const reFetchMaintenance = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/${maintenance.id}`)
            setMaintenance(response.data);
        } catch (error) {
            console.error('Error fetching maintenance with', error)
        }
    }

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/maintenance/connections/${maintenance.id}`);
            if (response.data.Devices.length > 0) {
                setDevices(response.data.Devices.sort((a, b) => a.deviceName.localeCompare(b.deviceName)));
            }
            if (response.data.LinkedDevices.length > 0) {
                setLinkedDevices(response.data.LinkedDevices.sort((a, b) => a.name.localeCompare(b.name)));
            }
            if (response.data.Software.length > 0) {
                setSoftwares(response.data.Software.sort((a, b) => a.name.localeCompare(b.name)));
            }
        } catch (error) {
            console.error("Error fetching devices", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axiosInstance.get(`/maintenance-comment/maintenance/${maintenance.id}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            setMaintenance((prev) => ({
                ...prev,
                maintenanceDate: plannedDate,
                firstDate: firstDate || lastDate, // If firstDate is null, set it to lastDate
                lastDate: lastDate || firstDate,
                description: description,
                internalComment: internalComment,
                maintenanceStatus: status,
                baitWorkerId: responsibleId
            }));
            if (!lastDate && firstDate) {
                setLastDate(firstDate);
            } else if (lastDate && !firstDate) {
                setFirstDate(lastDate);
            }
            // Save edited comments back to the state when exiting edit mode
            setComments(editableComments);
            handleSave();
        } else {
            // Initialize editable comments when entering edit mode
            setEditableComments(comments.map(comment => ({...comment})));
        }
        setIsEditing(!isEditing);
    };

    useEffect(() => {
        if (status === "DONE") {
            setEditableComments(prevComments =>
                prevComments.map(comment => ({
                    ...comment,
                    maintenanceStatus: "DONE"
                }))
            );
        }
    }, [status]);


    const formatDuration = (durationString) => {
        if (!durationString) return "0h 0min";
        const match = durationString.match(/PT(\d+H)?(\d+M)?/);
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        return `${hours}h ${minutes}min`;
    };

    const handleTimeSubmit = async () => {
        const newHours = parseInt(hours) || 0;
        const newMinutes = parseInt(minutes) || 0;
        try {
            await axiosInstance.put(`/maintenance/time/${maintenance.id}`,null,
                {
                    params: {
                        hours: newHours,
                        minutes: newMinutes
                    }
                }
            );
            reFetchMaintenance();
            setRefresh()
        } catch (error) {
            console.error("Error updating time", error);
        } finally {
            setHours("")
            setMinutes("")
        }
    };

    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        console.log(responsibleId);
        try {
            await axiosInstance.put(`/maintenance/update/${maintenance.id}`, {
                maintenanceDate: plannedDate,
                firstDate: firstDate,
                lastDate: lastDate,
                description,
                internalComment,
                maintenanceStatus: status,
                baitWorkerId: responsibleId
            })

            // Loop through each edited comment and send it to the backend
            for (const comment of editableComments) {
                await axiosInstance.put(`/maintenance-comment/update/${comment.id}`, {
                    maintenanceStatus: comment.maintenanceStatus,
                    comment: comment.comment
                });
            }

            // Refresh the maintenance data
            await reFetchMaintenance();
            setRefresh();

        } catch (error) {
            console.error("Error saving comments:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    //Returns the right icon depending on the status
    const getStatusIcon = (status) => {
        return status === "DONE" ? <FaCheckCircle style={{ color: "green" }} /> : <FaExclamationCircle style={{ color: "goldenrod" }} />;
    };


    return (
        <>
            <Modal
                size="xl"
                backdrop="static"
                show={show}
                onHide={onClose}
                dialogClassName={fileModalOpen || showDeleteModal ? "dimmed" : ""}
            >
                <Modal.Header closeButton>
                    <div>
                        <Modal.Title>Maintenance Details </Modal.Title>
                        <p className="text-muted mb-0">Location: {locationNames[maintenance.locationId]}</p>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={6} md={2}>
                            <Row>
                                <Col>Planned Date</Col>
                            </Row>
                            <Row>
                                {isEditing ? (
                                    <Col>
                                        <DatePicker
                                            selected={plannedDate}
                                            onChange={(date) => setPlannedDate(formatLocalDate(date))}
                                            dateFormat="dd.MM.yyyy"
                                            className="form-control dark-placeholder"
                                            placeholderText="Select Start Date"
                                        />
                                    </Col>
                                    ) : (
                                        <h4>{DateUtils.formatDate(maintenance.maintenanceDate)}</h4>
                                    )}
                            </Row>
                        </Col>
                        <Col xs={6} md={4}>
                            <Row>
                                <Col>Execute Date</Col>
                            </Row>
                            <Row>
                                {isEditing ? (
                                    <>
                                    <Col>
                                        <DatePicker
                                            selected={firstDate}
                                            onChange={(date) => setFirstDate(formatLocalDate(date))}
                                            dateFormat="dd.MM.yyyy"
                                            className="form-control dark-placeholder"
                                            placeholderText="Select First Date"
                                            disabled={status === "OPEN"}

                                        />
                                    </Col>
                                        <Col>
                                            <DatePicker
                                                selected={lastDate}
                                                onChange={(date) => setLastDate(formatLocalDate(date))}
                                                dateFormat="dd.MM.yyyy"
                                                className="form-control dark-placeholder"
                                                placeholderText="Select Last Date"
                                                disabled={status === "OPEN"}
                                            />
                                        </Col>
                                    </>

                                ) : (
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        {maintenance.firstDate && maintenance.lastDate && maintenance.firstDate !== maintenance.lastDate ? (
                                            <h4>{DateUtils.formatDate(maintenance.firstDate)} - {DateUtils.formatDate(maintenance.lastDate)}</h4>
                                        ) : (
                                            <h4>{DateUtils.formatDate(maintenance.firstDate || maintenance.lastDate)}</h4>
                                        )}
                                    </div>
                                )}
                            </Row>
                        </Col>

                        <Col md={1}></Col>
                        <Col xs={7} md={2}>
                            <Row>
                                <Col>Time Spent - {formatDuration(maintenance.timeSpent)}</Col>
                            </Row>
                            <Row>
                                <Col className="col-md-auto" style={{paddingRight: "0"}}>
                                    <input
                                        type="text"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="h"
                                        className="form-control me-2"
                                        min="0"
                                        style={{ width: "50px"}}
                                    />
                                </Col>
                                <Col className="col-md-auto p-0">
                                    <input
                                        type="text"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        placeholder="m"
                                        className="form-control me-2"
                                        min="0"
                                        max="59"
                                        style={{ width: "50px"}}
                                    />
                                </Col>
                                <Col className="col-md-auto p-0">
                                    <Button variant="link" onClick={handleTimeSubmit}>
                                        <FaPlus />
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={4} md={2}>
                            <Row>
                                <Col style={{paddingLeft: 0}}>
                                    Status
                                </Col>
                            </Row>
                            <Row>
                                <Col className="align-content-center" style={{height: "38px", paddingLeft: 0}}>
                                    {isEditing ? (
                                        <Form.Select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="OPEN">OPEN</option>
                                            <option value="DONE">DONE</option>
                                        </Form.Select>
                                    ) : (
                                        maintenance.maintenanceStatus
                                    )}
                                </Col>
                            </Row>
                        </Col>
                        <Col xs="auto" className="align-content-center text-end px-0">
                            <Button className="px-0" style={{paddingTop: "20px", paddingBottom: 0}} variant="link" onClick={toggleEdit}>
                                {isEditing ? <FaSave  style={{ fontSize: '1.5rem' }} /> : <FaEdit  style={{ fontSize: '1.5rem' }} />}
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col>Description</Col>
                    </Row>
                    <Row>
                        <Col>
                            {isEditing ? (
                                <TextareaAutosize
                                    minRows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-2"
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    {maintenance.description &&
                                        maintenance.description.split("\n").map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                <Linkify>{line}</Linkify>
                                                <br />
                                            </React.Fragment>
                                        ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                    {loading ? (
                        <div className="text-center mt-1">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                        {isMobile ? (
                            // Mobile view with Cards
                            <>
                                <Row className="mt-4">
                                    {/* Display the first available section header */}
                                    {devices.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Device List:</Col>
                                    ) : linkedDevices.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Linked Device List:</Col>
                                    ) : softwares.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Software List:</Col>
                                    ) : (
                                        <Col className="fw-bold">Device List:</Col>
                                    )}
                                </Row>
                                {devices.length === 0 && linkedDevices.length === 0 && softwares.length === 0 && (
                                    <div className="mt-2">
                                        <Alert variant="info">No devices found.</Alert>
                                    </div>
                                )}
                                {/* Devices */}
                                {devices.map((device) => {
                                    const relatedComment = comments.find((comment) => comment.deviceId === device.id);
                                    return (
                                        <Card key={device.id} className="mb-3">
                                            <Card.Body>
                                                <Card.Title>{device.deviceName}</Card.Title>
                                                <Card.Text>
                                                    <strong>Serial No:</strong> {device.serialNumber}<br />
                                                    <strong>Status:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="light">
                                                                {getStatusIcon(editableComments.find(c => c.deviceId === device.id)?.maintenanceStatus || "OPEN")}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.deviceId === device.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                                ))}>
                                                                    <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.deviceId === device.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                                ))}>
                                                                    <FaCheckCircle style={{ color: "green" }} /> DONE
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    ) : (
                                                        relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )
                                                    )
                                                }<br />
                                                    <strong>Comment:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Form.Control
                                                            as="textarea"
                                                            value={editableComments.find(c => c.deviceId === device.id)?.comment || ""}
                                                            onChange={(e) => {
                                                                setEditableComments(editableComments.map(comment =>
                                                                    comment.deviceId === device.id ? { ...comment, comment: e.target.value } : comment
                                                                ));
                                                            }}
                                                        />
                                                    ) : (
                                                        relatedComment?.comment || "N/A"
                                                    )
                                                }<br />
                                                    <Button className="px-0" variant="light" onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}>
                                                        <strong>Files: </strong><FaFileUpload />
                                                    </Button>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}

                                {linkedDevices.length > 0 && devices.length > 0 && (
                                    <Row>
                                        <Col className="fw-bold">Linked Device List:</Col>
                                    </Row>
                                )}
                                {/* Linked Devices */}
                                {linkedDevices.map((linkedDevice, index) => {
                                    const relatedComment = comments.find((comment) => comment.linkedDeviceId === linkedDevice.id);
                                    return (
                                        <Card key={linkedDevice.id} className="mb-3">
                                            <Card.Body>
                                                <Card.Title>{linkedDevice.name}</Card.Title>
                                                <Card.Text>
                                                    <strong>Serial No:</strong> {linkedDevice.serialNumber}<br />
                                                    <strong>Status:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="light">
                                                                {getStatusIcon(editableComments.find(c => c.linkedDeviceId === linkedDevice.id)?.maintenanceStatus || "OPEN")}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.linkedDeviceId === linkedDevice.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                                ))}>
                                                                    <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.linkedDeviceId === linkedDevice.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                                ))}>
                                                                    <FaCheckCircle style={{ color: "green" }} /> DONE
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    ) : (
                                                        relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )
                                                    )
                                                }<br />
                                                    <strong>Comment:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Form.Control
                                                            as="textarea"
                                                            value={editableComments.find(c => c.linkedDeviceId === linkedDevice.id)?.comment || ""}
                                                            onChange={(e) => {
                                                                setEditableComments(editableComments.map(comment =>
                                                                    comment.linkedDeviceId === linkedDevice.id ? { ...comment, comment: e.target.value } : comment
                                                                ));
                                                            }}
                                                        />
                                                    ) : (
                                                        relatedComment?.comment || "N/A"
                                                    )
                                                }<br />
                                                    <Button className="px-0" variant="light" onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}>
                                                        <strong>Files: </strong><FaFileUpload />
                                                    </Button>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}

                                {softwares.length > 0 && (linkedDevices.length > 0 || devices.length > 0) && (
                                    <Row>
                                        <Col className="fw-bold">Software List:</Col>
                                    </Row>
                                )}

                                {/* Software list */}
                                {softwares.map((software) => {
                                    const relatedComment = comments.find((comment) => comment.softwareId === software.id);
                                    return (
                                        <Card key={software.id} className="mb-3">
                                            <Card.Body>
                                                <Card.Title>{software.name}</Card.Title>
                                                <Card.Text>
                                                    <strong>Status:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="light">
                                                                {getStatusIcon(editableComments.find(c => c.softwareId === software.id)?.maintenanceStatus || "OPEN")}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.softwareId === software.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                                ))}>
                                                                    <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                    comment.softwareId === software.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                                ))}>
                                                                    <FaCheckCircle style={{ color: "green" }} /> DONE
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    ) : (
                                                        relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )
                                                    )
                                                    }<br />
                                                    <strong>Comment:</strong> {
                                                    isEditing && editableComments ? (
                                                        <Form.Control
                                                            as="textarea"
                                                            value={editableComments.find(c => c.softwareId === software.id)?.comment || ""}
                                                            onChange={(e) => {
                                                                setEditableComments(editableComments.map(comment =>
                                                                    comment.softwareId === software.id ? { ...comment, comment: e.target.value } : comment
                                                                ));
                                                            }}
                                                        />
                                                    ) : (
                                                        relatedComment?.comment || "N/A"
                                                    )
                                                }<br />
                                                    <Button className="px-0" variant="light" onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}>
                                                        <strong>Files: </strong><FaFileUpload />
                                                    </Button>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </>
                        ) : (
                            // Desktop view with Rows and Cols
                            <>
                                <Row style={{margin: "0"}} className="mt-4">
                                    {/* Display the first available section header */}
                                    {devices.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Device List:</Col>
                                    ) : linkedDevices.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Linked Device List:</Col>
                                    ) : softwares.length > 0 ? (
                                        <Col className="fw-bold" md={3}>Softwares List:</Col>
                                    ) : (
                                        <Col className="fw-bold">Device List:</Col>
                                    )}
                                    <Col md={2}>Serial No</Col>
                                    <Col md={1}>Files</Col>
                                    <Col md={1}>Status</Col>
                                    <Col md={5}>Comment</Col>
                                </Row>
                                {devices.length === 0 && linkedDevices.length === 0 && softwares.length === 0 &&
                                    <div className="mt-2">
                                        <Alert variant="info">No devices found.</Alert>
                                    </div>
                                }
                                {/*Devices*/}
                                {devices.map((device, index) => {
                                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";

                                    // Find the comment related to this device
                                    const relatedComment = comments.find((comment) => comment.deviceId === device.id);

                                    return (
                                        <Row
                                            key={device.id}
                                            className="align-items-center mt-2"
                                            style={{ margin: "0", backgroundColor: rowBgColor }}
                                        >
                                            <Col md={3} className="py-2">
                                                {device.deviceName}
                                            </Col>
                                            <Col md={2}>{device.serialNumber}</Col>
                                            <Col md={1} className="py-2">
                                                <FaFileUpload
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}
                                                />
                                            </Col>
                                            <Col md={1} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="light">
                                                            {getStatusIcon(editableComments.find(c => c.deviceId === device.id)?.maintenanceStatus || "OPEN")}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.deviceId === device.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                            ))}>
                                                                <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.deviceId === device.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                            ))}>
                                                                <FaCheckCircle style={{ color: "green" }} /> DONE
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>

                                                ) : (
                                                    <span>
                                                        {relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )}
                                                     </span>
                                                )}
                                            </Col>
                                            <Col md={5} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Form.Control
                                                        as="textarea"
                                                        value={editableComments.find(c => c.deviceId === device.id)?.comment || ""}
                                                        onChange={(e) => {
                                                            setEditableComments(editableComments.map(comment =>
                                                                comment.deviceId === device.id ? { ...comment, comment: e.target.value } : comment
                                                            ));
                                                        }}
                                                    />
                                                ) : (
                                                    relatedComment?.comment || "N/A"
                                                )}
                                            </Col>
                                        </Row>
                                    );
                                })}
                                {linkedDevices.length > 0 && devices.length > 0 && (
                                <Row style={{margin: "0"}}>
                                    <Col className="fw-bold">
                                        Linked Device list:
                                    </Col>
                                </Row>
                                )}
                                {/*Linked Devices*/}
                                {linkedDevices.map((linkedDevice, index) => {
                                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";

                                    // Find the comment related to this device
                                    const relatedComment = comments.find((comment) => comment.linkedDeviceId === linkedDevice.id);

                                    return (
                                        <Row
                                            key={linkedDevice.id}
                                            className="align-items-center mt-2"
                                            style={{ margin: "0", backgroundColor: rowBgColor }}
                                        >
                                            <Col md={3} className="py-2">
                                                {linkedDevice.name}
                                            </Col>
                                            <Col md={2}>{linkedDevice.serialNumber}</Col>
                                            <Col md={1} className="py-2">
                                                <FaFileUpload
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}
                                                />
                                            </Col>
                                            <Col md={1} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="light">
                                                            {getStatusIcon(editableComments.find(c => c.linkedDeviceId === linkedDevice.id)?.maintenanceStatus || "OPEN")}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.linkedDeviceId === linkedDevice.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                            ))}>
                                                                <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.linkedDeviceId === linkedDevice.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                            ))}>
                                                                <FaCheckCircle style={{ color: "green" }} /> DONE
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                ) : (
                                                    <span>
                                                        {relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )}
                                                     </span>
                                                )}
                                            </Col>
                                            <Col md={5} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Form.Control
                                                        as="textarea"
                                                        value={editableComments.find(c => c.linkedDeviceId === linkedDevice.id)?.comment || ""}
                                                        onChange={(e) => {
                                                            setEditableComments(editableComments.map(comment =>
                                                                comment.linkedDeviceId === linkedDevice.id ? { ...comment, comment: e.target.value } : comment
                                                            ));
                                                        }}
                                                    />
                                                ) : (
                                                    relatedComment?.comment || "N/A"
                                                )}
                                            </Col>
                                        </Row>
                                    );
                                })}
                                {softwares.length > 0 && (linkedDevices.length > 0 || devices.length) > 0 && (
                                <Row style={{margin: "0"}}>
                                    <Col className="fw-bold">
                                        Software list:
                                    </Col>
                                </Row>
                                )}
                                {/*Softwares*/}
                                {softwares.map((software, index) => {
                                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";

                                    // Find the comment related to this device
                                    const relatedComment = comments.find((comment) => comment.softwareId === software.id);
                                    return (
                                        <Row
                                            key={software.id}
                                            className="align-items-center mt-2"
                                            style={{ margin: "0", cursor: "pointer", backgroundColor: rowBgColor }}
                                        >
                                            <Col md={3} className="py-2">
                                                {software.name}
                                            </Col>
                                            <Col md={2}></Col>
                                            <Col md={1} className="py-2">
                                                <FaFileUpload
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setSelectedCommentId(relatedComment?.id || null);
                                                        setFileModalOpen(true);
                                                    }}
                                                />
                                            </Col>
                                            <Col md={1} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="light">
                                                            {getStatusIcon(editableComments.find(c => c.softwareId === software.id)?.maintenanceStatus || "OPEN")}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.softwareId === software.id ? { ...comment, maintenanceStatus: "OPEN" } : comment
                                                            ))}>
                                                                <FaExclamationCircle style={{ color: "goldenrod" }} /> OPEN
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => setEditableComments(editableComments.map(comment =>
                                                                comment.softwareId === software.id ? { ...comment, maintenanceStatus: "DONE" } : comment
                                                            ))}>
                                                                <FaCheckCircle style={{ color: "green" }} /> DONE
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                ) : (
                                                    <span>
                                                        {relatedComment?.maintenanceStatus === "DONE" ? (
                                                            <FaCheckCircle style={{ color: "green" }} />
                                                        ) : (
                                                            <FaExclamationCircle style={{ color: "goldenrod" }} />
                                                        )}
                                                     </span>
                                                )}
                                            </Col>
                                            <Col md={5} className="py-2">
                                                {isEditing && editableComments ? (
                                                    <Form.Control
                                                        as="textarea"
                                                        value={editableComments.find(c => c.softwareId === software.id)?.comment || ""}
                                                        onChange={(e) => {
                                                            setEditableComments(editableComments.map(comment =>
                                                                comment.softwareId === software.id ? { ...comment, comment: e.target.value } : comment
                                                            ));
                                                        }}
                                                    />
                                                ) : (
                                                    relatedComment?.comment || "N/A"
                                                )}
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </>
                        )}
                        </>
                    )}
                    <Row className="mt-4">
                        <Col>Internal Comment</Col>
                    </Row>
                    <Row>
                        <Col>
                            {isEditing ? (
                                <TextareaAutosize
                                    minRows={2}
                                    value={internalComment}
                                    onChange={(e) => setInternalComment(e.target.value)}
                                    className="mt-2"
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                    }}
                                >
                                    {maintenance.internalComment &&
                                        maintenance.internalComment.split("\n").map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                <Linkify>{line}</Linkify>
                                                <br />
                                            </React.Fragment>
                                        ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="mt-4 justify-content-between">
                        <Col md={2}>
                            {isEditing ? (
                                <>
                                    <span>Assignee:</span>
                                    <Form.Select className="mt-2" value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
                                        {Object.entries(responsibleNames).map(([id, name]) => (
                                            <option key={id} value={id}>{name}</option>
                                        ))}
                                    </Form.Select>
                                </>
                            ) : (
                                <>
                                    <span>Service Provided by: </span>
                                    <span className="mt-2">{responsibleNames[maintenance.baitWorkerId]}</span>
                                </>
                            )}
                        </Col>


                        <Col className="col-md-auto">
                            {/*<Button className="me-2">Print Pdf</Button>*/}
                            <FaTrash
                                size={25}
                                style={{ cursor: "pointer"}}
                                onClick={() => setShowDeleteModal(true)} // Add your delete function here
                                title="Delete Ticket"
                                className="text-danger me-4" // Optional: add a color class
                            />
                            {/*<Button onClick={handleSave} disabled={isSubmitting}>*/}
                            {/*    {isSubmitting ? 'Saving...' : 'Save'}*/}
                            {/*</Button>*/}
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
            {fileModalOpen && selectedCommentId && (
                <ShowFilesModal
                    maintenanceCommentId={selectedCommentId}
                    onClose={() => setFileModalOpen(false)}
                />
            )}
            <DeleteConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onDelete={() => {setRefresh(); onClose(); setShowDeleteModal(false);}}
                maintenanceId={maintenance.id}
                maintenanceName={maintenance.maintenanceName}
            />
        </>
    );
};

export default MaintenanceDetailsModal;
