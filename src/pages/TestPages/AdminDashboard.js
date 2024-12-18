import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";

const AdminDashboard = () => {
    const [data, setData] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/admin/dashboard");
                setData(response.data);
            } catch (err) {
                setError(err.response?.data || "An error occurred");
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {error ? <p style={{ color: "red" }}>{error}</p> : <p>{data}</p>}
        </div>
    );
};

export default AdminDashboard;
