import React, {useEffect, useState} from "react";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";
import Select from "react-select/async";

const MaintenanceModal = ({ show, handleClose, clientId }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [comment, setComment] = useState('');
    const [selectedDevices, setSelectedDevices] = useState([]);


    useEffect(() => {
        if (show) {
            fetchDevices();
        }
    });

    const fetchDevices = async (inputValue) => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/device/search`, {
                params: {query: inputValue, clientId: clientId}
            });
            console.log(response.data)
            return response.data.map(device => ({
                label: device.deviceName,
                value: device.id
            }));
        } catch (error) {
            console.log('Error fetching devices', error);
            return [];
        }
    };


    const handleSave = async () => {
        try {
            const maintenanceResponse = await axios.post(`${config.API_BASE_URL}/maintenance/add`, {
                name,
                date,
                comment
            });

            const maintenanceId = maintenanceResponse.data.id;

            for (const device of selectedDevices) {
                await axios.post(`${config.API_BASE_URL}/maintenance/assign`, {
                    maintenanceId,
                    deviceId: device.value
                });
            }

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
            <Modal.Body>
                <Form.Group controlId="newContact">
                    <Form.Label>Maintenance Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Form.Label>Maintenance Date</Form.Label>
                    <Form.Control
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Form.Label>Devices</Form.Label>
                    <Select
                        isMulti
                        cacheOptions
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
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MaintenanceModal;
