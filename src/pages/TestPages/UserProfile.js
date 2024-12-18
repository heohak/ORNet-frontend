// src/pages/UserProfile.js
import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";

const UserProfile = () => {
    const [data, setData] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/user/profile");
                setData(response.data);
            } catch (err) {
                setError(err.response?.data || "An error occurred");
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>User Profile</h1>
            {error ? <p style={{ color: "red" }}>{error}</p> : <p>{data}</p>}
        </div>
    );
};

export default UserProfile;
