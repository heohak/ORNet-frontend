import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { DateUtils } from "../../utils/DateUtils";
import axiosInstance from "../../config/axiosInstance";
import TextareaAutosize from "react-textarea-autosize";
import Linkify from "react-linkify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {FaEdit, FaPlus, FaSave} from "react-icons/fa";

const MaintenanceDetailsModal = ({ show, onHide, maintenance, locationNames, setMaintenance, setRefresh, responsibleNames }) => {
    const [devices, setDevices] = useState([]);
    const [softwares, setSoftwares] = useState([]);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [startDate, setStartDate] = useState(new Date(maintenance.maintenanceDate));
    const [endDate, setEndDate] = useState(new Date(maintenance.lastDate));
    const [description, setDescription] = useState(maintenance.comment || "");
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");

    useEffect(() => {
        fetchDevices();
    }, []);

    const reFetchMaintenance = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/${maintenance.id}`)
            setMaintenance(response.data);
        } catch (error) {
            console.error('Error fetching maintenance with', error)
        }
    }

    const fetchDevices = async () => {
        try {
            const response = await axiosInstance.get(`/maintenance/connections/${maintenance.id}`);
            if (response.data.Devices.length > 0) {
                setDevices(response.data.Devices);
            }
            if (response.data.LinkedDevices.length > 0) {
                setLinkedDevices(response.data.LinkedDevices);
            }
            if (response.data.Software.length > 0) {
                setSoftwares(response.data.Software);
            }
        } catch (error) {
            console.error("Error fetching devices", error);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Save the changes to maintenance object (You can add an API call here if needed)
            maintenance.maintenanceDate = startDate;
            maintenance.lastDate = endDate;
            maintenance.comment = description;
        }
        setIsEditing(!isEditing);
    };

    const formatDuration = (durationString) => {
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

    return (
        <Modal size="xl" show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Maintenance Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={4}>Date</Col>
                    <Col md={3}>Location</Col>
                    <Col md={3}>Time Spent - {formatDuration(maintenance.timeSpent)}</Col>
                    <Col className="text-end">
                        <Button variant="link" onClick={toggleEdit}>
                            {isEditing ? <FaSave /> : <FaEdit />}
                        </Button>
                    </Col>
                </Row>
                <Row >
                    <Col md={4}>
                        {isEditing ? (
                            <Row>
                                <Col>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select Start Date"
                                    />
                                </Col>
                                <Col>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Select End Date"
                                    />
                                </Col>
                            </Row>
                        ) : (
                            <h4>{DateUtils.formatDate(maintenance.maintenanceDate)} - {DateUtils.formatDate(maintenance.lastDate)}</h4>
                        )}
                    </Col>
                    <Col md={3}>
                        <h4>{locationNames[maintenance.locationId]}</h4>
                    </Col>
                    <Col md={3}>
                        <Row>
                            <Col className="col-md-auto" style={{paddingRight: "0"}}>
                                <input
                                    type="number"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    placeholder="h"
                                    className="form-control me-2"
                                    min="0"
                                    style={{ width: "50px", appearance: "textfield" }}
                                />
                            </Col>
                            <Col className="col-md-auto p-0">
                                <input
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    placeholder="m"
                                    className="form-control me-2"
                                    min="0"
                                    max="59"
                                    style={{ width: "50px", appearance: "textfield" }}
                                />
                            </Col>
                            <Col className="col-md-auto p-0">
                                <Button variant="link" onClick={handleTimeSubmit}>
                                    <FaPlus />
                                </Button>
                            </Col>
                        </Row>
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
                                {maintenance.comment &&
                                    maintenance.comment.split("\n").map((line, idx) => (
                                        <React.Fragment key={idx}>
                                            <Linkify>{line}</Linkify>
                                            <br />
                                        </React.Fragment>
                                    ))}
                            </div>
                        )}
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col>Device List</Col>
                    <Col>Icon</Col>
                    <Col>Status</Col>
                    <Col>Comment</Col>
                </Row>
                {/*Devices*/}
                {devices.map((device, index) => {
                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
                    return (
                        <Row
                            key={device.id}
                            className="align-items-center mt-2"
                            style={{ margin: "0", cursor: "pointer", backgroundColor: rowBgColor }}
                        >
                            <Col md={3} className="py-2">
                                {device.deviceName} {device.serialNumber}
                            </Col>
                            <Col md={3} className="py-2">Add file</Col>
                            <Col md={3} className="py-2">{device.status}</Col>
                            <Col md={2} className="py-2">{device.maintenanceStatus}</Col>
                        </Row>
                    );
                })}

                {/*Linked Devices*/}
                {linkedDevices.map((linkedDevice, index) => {
                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
                    return (
                        <Row
                            key={linkedDevice.id}
                            className="align-items-center mt-2"
                            style={{ margin: "0", cursor: "pointer", backgroundColor: rowBgColor }}
                        >
                            <Col md={3} className="py-2">
                                {linkedDevice.deviceName} {linkedDevice.serialNumber}
                            </Col>
                            <Col md={3} className="py-2">Add file</Col>
                            <Col md={3} className="py-2">{linkedDevice.status}</Col>
                            <Col md={2} className="py-2">{linkedDevice.maintenanceStatus}</Col>
                        </Row>
                    );
                })}

                {/*Softwares*/}
                {softwares.map((software, index) => {
                    const rowBgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
                    return (
                        <Row
                            key={software.id}
                            className="align-items-center mt-2"
                            style={{ margin: "0", cursor: "pointer", backgroundColor: rowBgColor }}
                        >
                            <Col md={3} className="py-2">
                                {software.name} {software.serialNumber}
                            </Col>
                            <Col md={3} className="py-2">Add file</Col>
                            <Col md={3} className="py-2">{software.status}</Col>
                            <Col md={2} className="py-2">{software.maintenanceStatus}</Col>
                        </Row>
                    );
                })}
                <Row className="mt-4 justify-content-between">
                    <Col>Service Provided by: {responsibleNames[maintenance.baitWorkerId]}</Col>
                    <Col className="col-md-auto">
                        {/*<Button className="me-2">Print Pdf</Button>*/}
                        <Button>Save</Button>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default MaintenanceDetailsModal;
