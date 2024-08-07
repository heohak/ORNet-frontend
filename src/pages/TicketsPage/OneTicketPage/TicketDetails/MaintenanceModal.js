import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";


const MaintenanceModal = ({ show, handleClose, clientId}) => {


    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [comment, setComment] = useState('');
    const [devices, setDevices] = useState([]);

    useEffect(() => {

        const fetchDevices = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/device/client/${clientId}`)
                setDevices(response.data);
            } catch (error) {
                console.log('Error fetching devices', error);
            }
        }
        fetchDevices();
    });

    const handleSave = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}/maintenance/add`,{
                name,
                date,
                comment
                });
        } catch (error) {
            console.error('Error submitting maintenance ')
        }

    }

    return (
        <>
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
        </>
    );
};

export default MaintenanceModal;