import {useEffect, useState} from "react";
import {DropdownButton, InputGroup, Dropdown} from "react-bootstrap";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketStatusDropdown = ({ ticket, statuses, setIsClosed }) => {
    const [statusName, setStatusName] = useState("");
    const [statusColor, setStatusColor] = useState("");

    useEffect(() => {
        const status = statuses.find(status => status.id === ticket.statusId);
        setStatusName(status.status);
        setStatusColor(status.color);
    }, [ticket.id])


    const handleStatusChange = async (status) => {
        try {
            await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`, {
                statusId: status.id
            });

            // Find the status name from the ID and update the local state
            const newStatus = statuses.find(oneStatus => oneStatus.id === status.id);
            setStatusName(newStatus.status);
            if (status.status === "Closed") {
                let now = new Date();
                now.setHours(now.getUTCHours() + 6);
                await axios.put(`${config.API_BASE_URL}/ticket/update/whole/${ticket.id}`,{
                    endDateTime: now
                });
                setIsClosed(true);
            } else {
                setIsClosed(false);
            }

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
                        <Dropdown.Item key={status.id} onClick={() => handleStatusChange(status)}>
                            {status.status}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </InputGroup>
        </>
    );
}

export default NewTicketStatusDropdown;