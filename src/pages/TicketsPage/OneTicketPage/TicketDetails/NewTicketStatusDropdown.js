import { useEffect, useState } from "react";
import { DropdownButton, InputGroup, Dropdown, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";

const NewTicketStatusDropdown = ({ ticket, statuses, setIsClosed, reFetch }) => {
    const [statusName, setStatusName] = useState("");
    const [statusColor, setStatusColor] = useState("");
    const [showModal, setShowModal] = useState(false); // For handling modal visibility
    const [rootCause, setRootCause] = useState(""); // For root cause input

    useEffect(() => {
        const status = statuses.find(status => status.id === ticket.statusId);
        setStatusName(status.status);
        setStatusColor(status.color);
    }, [ticket.id]);

    const handleStatusChange = async (status) => {
        if (status.status === "Closed") {
            setShowModal(true);  // Show the modal if "Closed" status is selected
        } else {
            await updateTicketStatus(status);
            setIsClosed(false);
        }
    };

    const handleRootCauseSubmit = async () => {
        try {
            let now = new Date();
            now.setHours(now.getUTCHours() + 6);  // Adjust to your UTC offset if needed
            const newStatus = statuses.find(status => status.status === "Closed")


            // Update the ticket with the closed status and endDateTime
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                statusId: newStatus.id,
                endDateTime: now,
                rootCause: rootCause // Send the root cause to the backend
            });

            setIsClosed(true);
            reFetch();
            setStatusName(newStatus.status);
            setStatusColor(newStatus.color);
            setShowModal(false); // Hide the modal after submission
        } catch (error) {
            console.error("Error updating the ticket status", error);
        }
    };

    const updateTicketStatus = async (status) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                statusId: status.id
            });

            const newStatus = statuses.find(oneStatus => oneStatus.id === status.id);
            setStatusName(newStatus.status);
            setStatusColor(newStatus.color);
        } catch (error) {
            console.error("Error updating the ticket status", error);
        }
    };

    return (
        <>
            <InputGroup>
                <DropdownButton
                    as={InputGroup.Append}
                    variant="outline-secondary"
                    title={statusName || 'Select Status'}
                    id="input-group-dropdown-status"
                    style={{ backgroundColor: statusColor || "#007bff", borderColor: statusColor || "#007bff" }}
                >
                    {statuses.map(status => (
                        <Dropdown.Item key={status.id} onClick={() => handleStatusChange(status)}>
                            {status.status}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </InputGroup>

            {/* Modal for entering root cause */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Root Cause Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="rootCause">
                        <Form.Label>Please provide the root cause for closing the ticket:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={rootCause}
                            onChange={(e) => setRootCause(e.target.value)}
                            placeholder="Enter the root cause..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleRootCauseSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NewTicketStatusDropdown;
