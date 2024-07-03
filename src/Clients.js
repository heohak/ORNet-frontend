// src/pages/Clients.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('http://localhost:8080/client');
                setClients(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleNavigate = (clientId) => {
        navigate('/workers', { state: { clientId } });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Clients Page</h1>
            <ul>
                {clients.map((client) => (
                    <li key={client.id}>
                        <strong>Full Name:</strong> {client.fullName}<br />
                        <strong>Short Name:</strong> {client.shortName}<br />
                        <strong>Third Party IT:</strong> {client.thirdPartyIT}
                        <button onClick={() => handleNavigate(client.id)}>View Workers</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Clients;
