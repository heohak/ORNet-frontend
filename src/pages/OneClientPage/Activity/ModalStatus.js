import { useEffect, useState } from "react";
import { DropdownButton, InputGroup, Dropdown } from "react-bootstrap";
import axios from "axios";
import config from "../../../config/config";

const ModalStatus = ({ activity, statuses, reFetch }) => {
    const [statusName, setStatusName] = useState("");
    const [statusColor, setStatusColor] = useState("");

    useEffect(() => {
        const status = statuses.find(status => status.id === activity.statusId);
        setStatusName(status.status);
        setStatusColor(status.color);
    }, [activity.id]);

    const handleStatusChange = async (status) => {
        await updateTicketStatus(status);
    };

    const updateTicketStatus = async (status) => {
        try {
            await axios.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                statusId: status.id
            });

            const newStatus = statuses.find(oneStatus => oneStatus.id === status.id);
            setStatusName(newStatus.status);
            setStatusColor(newStatus.color);
            reFetch();
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
        </>
    );
};

export default ModalStatus;
