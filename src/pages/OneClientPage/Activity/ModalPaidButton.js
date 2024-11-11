import React, { useState, useEffect } from "react";
import "../../../css/ToggleSwitch.css";
import axios from "axios";
import config from "../../../config/config";

const ModalPaidButton = ({ activity, reFetch }) => {
    const [isActive, setIsActive] = useState(activity.paid === true); // Initialize based on ticket.paid

    // Update state if ticket.paid changes
    useEffect(() => {
        setIsActive(activity.paid === true);
    }, [activity.paid]);

    const handleToggle = async () => {
        const newPaidStatus = !isActive; // Calculate the new paid status before updating the state

        setIsActive(newPaidStatus); // Toggle the state visually immediately

        try {
            await axios.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`, {
                paid: newPaidStatus
            });
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

export default ModalPaidButton;
