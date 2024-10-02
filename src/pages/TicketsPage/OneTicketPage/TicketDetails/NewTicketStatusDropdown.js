import {useEffect, useState} from "react";
import {DropdownButton, InputGroup, Dropdown} from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketStatusDropdown = ({ ticket, statuses }) => {
    const [statusName, setStatusName] = useState("");
    const [statusColor, setStatusColor] = useState("");

    useEffect(() => {
        const status = statuses.find(status => status.id === ticket.statusId);
        setStatusName(status.status);
        setStatusColor(status.color);
    }, [ticket.id])


    const handleStatusChange = async (statusId) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                statusId: statusId
            });

            // Find the status name from the ID and update the local state
            const newStatus = statuses.find(status => status.id === statusId);
            setStatusName(newStatus.status);

        } catch (error) {
            console.error("Error updating the ticket status", error);
        }
    };


    return (
        <>
            <InputGroup className="mb-2">
                <DropdownButton
                    as={InputGroup.Append}
                    variant="outline-secondary"
                    title={statusName || 'Select Status'}  // Show current status or default text
                    id="input-group-dropdown-status"
                    style={{ backgroundColor: statusColor || "#007bff", borderColor: statusColor || "#007bff" }}
                >
                    {statuses.map(status => (
                        <Dropdown.Item key={status.id} onClick={() => handleStatusChange(status.id)}>
                            {status.status}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </InputGroup>
        </>
    );
}

export default NewTicketStatusDropdown;