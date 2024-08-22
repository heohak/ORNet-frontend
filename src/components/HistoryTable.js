import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container } from 'react-bootstrap';
import config from "../config/config";
import '../css/HistoryTable.css';
import {useLocation} from "react-router-dom";

function HistoryTable({}) {
    const location = useLocation();
    const endpoint = location.state?.endpoint;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/${endpoint}`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    if (data.length === 0) return <p>No data available</p>;

    // Extract keys from the first object to create table headers
    const headers = Object.keys(data[0]);

    return (
        <Container fluid className="mt-4">
            <div className="table-responsive">
                <Table striped bordered hover className="table-fixed">
                    <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            {headers.map((header, i) => (
                                <td key={i}>{item[header]}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
}

export default HistoryTable;
