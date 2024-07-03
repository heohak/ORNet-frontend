// src/pages/Workers.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Workers() {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = location.state || {};
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clientId) {
            navigate('/');
            return;
        }

        const fetchWorkers = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/workers/${clientId}`);
                setWorkers(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, [clientId, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Workers for Client {clientId}</h1>
            <ul>
                {workers.map((worker) => (
                    <li key={worker.id}>
                        <strong>Name:</strong> {worker.firstName} {worker.lastName}<br />
                        <strong>Email:</strong> {worker.email}<br />
                        <strong>Phone number:</strong> {worker.phoneNumber}<br />
                        <strong>Title:</strong> {worker.title}<br />

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Workers;
