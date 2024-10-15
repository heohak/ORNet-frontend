import React, { useState, useEffect } from "react";
import "../../../css/ToggleSwitch.css";
import axios from "axios";
import config from "../../../config/config";

const ToggleSwitch = ({ ticket, reFetch }) => {
    const [isActive, setIsActive] = useState(ticket.paid === true); // Initialize based on ticket.paid

    // Update state if ticket.paid changes
    useEffect(() => {
        setIsActive(ticket.paid === true);
    }, [ticket.paid]);

    const handleToggle = async () => {
        const newPaidStatus = !isActive; // Calculate the new paid status before updating the state

        setIsActive(newPaidStatus); // Toggle the state visually immediately

        try {
            // Use different endpoints based on whether the new paid status is true or false
            const endpoint = newPaidStatus
                ? `${config.API_BASE_URL}/ticket/add/paid/${ticket.id}`
                : `${config.API_BASE_URL}/ticket/remove/paid/${ticket.id}`;

            // Make a request to the appropriate endpoint based on the new status
            await axios.put(endpoint);
            reFetch();

        } catch (error) {
            console.error("Error updating the ticket's paid status", error);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Paid</span> {/* Add "Paid" label here */}
            <div
                className={`toggle-switch ${isActive ? "active" : ""}`}
                onClick={handleToggle}
            >
                <div className="toggle-ball"></div>
            </div>
        </div>
    );
};

export default ToggleSwitch;
