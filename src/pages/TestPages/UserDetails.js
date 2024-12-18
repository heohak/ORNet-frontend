import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";

const UserDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axiosInstance.get("/details");
                setUserDetails(response.data); // Set the user details
            } catch (err) {
                setError(err.response?.data || "An error occurred");
            }
        };
        fetchUserDetails();
    }, []);

    return (
        <div>
            <h1>User Details</h1>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : userDetails ? (
                <div>
                    <p><strong>Common Name (CN):</strong> {userDetails.cn}</p>
                    <p><strong>Surname (SN):</strong> {userDetails.sn}</p>
                    <p><strong>Email:</strong> {userDetails.mail}</p>
                </div>
            ) : (
                <p>Loading user details...</p>
            )}
        </div>
    );
};

export default UserDetails;
