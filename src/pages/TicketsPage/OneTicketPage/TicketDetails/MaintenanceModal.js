import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";
import Select from "react-select/async";

const MaintenanceModal = ({ show, handleClose, clientId, ticketId, onSave }) => {
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceDate, setMaintenanceDate] = useState('');
    const [comment, setComment] = useState('');
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [allDevices, setAllDevices] = useState([]); // Store all devices initially fetched

    useEffect(() => {
        if (show) {
            fetchAllDevices();
        }
    }, [show]); // Only fetch when the modal is shown

    const fetchAllDevices = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: { clientId: clientId }
            });
            const devices = response.data.map(device => ({
                label: device.deviceName,
                value: device.id
            }));
            setAllDevices(devices); // Store the fetched devices
        } catch (error) {
            console.log('Error fetching devices', error);
        }
    };

    const fetchDevices = async (inputValue) => {
        if (!inputValue) {
            // Return all devices if input is empty
            return allDevices;
        }
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: { q: inputValue, clientId: clientId }
            });
            return response.data.map(device => ({
                label: device.deviceName,
                value: device.id
            }));
        } catch (error) {
            console.log('Error fetching devices', error);
            return [];
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                maintenanceName,
                maintenanceDate,
                comment
            });
            const maintenanceId = maintenanceResponse.data.token;

            await axios.put(`${config.API_BASE_URL}/ticket/maintenance/${ticketId}/${maintenanceId}`)
            //assigns the maintenance to the respective ticket
            for (const device of selectedDevices) {
                const deviceId = device.value
                await axios.put(`${config.API_BASE_URL}/device/maintenance/${deviceId}/${maintenanceId}`)
            }
            onSave();
            handleClose();
        } catch (error) {
            console.error('Error submitting maintenance', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Maintenance</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSave}>
                <Modal.Body>
                    <Form.Group controlId="newContact">
                        <Form.Label>Maintenance Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={maintenanceName}
                            onChange={(e) => setMaintenanceName(e.target.value)}
                            required
                        />
                        <Form.Label>Maintenance Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            required
                        />
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Form.Label>Related Devices</Form.Label>
                        <Select
                            isMulti
                            cacheOptions
                            defaultOptions={allDevices} // Set the default options as all devices
                            loadOptions={fetchDevices}
                            onChange={setSelectedDevices}
                            value={selectedDevices}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default MaintenanceModal;
