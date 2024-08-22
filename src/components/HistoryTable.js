import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container } from 'react-bootstrap';
import config from "../config/config";
import '../css/HistoryTable.css';
import { useLocation } from "react-router-dom";

function HistoryTable() {
    const location = useLocation();
    const endpoint = location.state?.endpoint;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attributeKeys, setAttributeKeys] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/${endpoint}`);
                console.log(response.data);
                setData(response.data);

                // Extract unique attribute keys from all objects
                const attributesKeysSet = new Set();
                response.data.forEach(item => {
                    if (item.attributes && typeof item.attributes === 'object') {
                        Object.keys(item.attributes).forEach(attrKey => attributesKeysSet.add(attrKey));
                    }
                });

                setAttributeKeys(Array.from(attributesKeysSet));
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

    // Extract keys from the first object to create table headers (excluding attributes)
    const baseHeaders = Object.keys(data[0]).filter(key => key !== 'attributes');

    // Combine base headers with dynamic attribute keys
    const allHeaders = [...baseHeaders, ...attributeKeys];

    return (
        <Container fluid className="mt-4 table-wrapper">
            <Table striped bordered hover>
                <thead>
                <tr>
                    {allHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        {baseHeaders.map((header, index) => (
                            <td key={index}>{item[header]}</td>
                        ))}
                        {attributeKeys.map((attrKey, index) => (
                            <td key={index}>
                                {item.attributes && item.attributes[attrKey] ? item.attributes[attrKey] : ''}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default HistoryTable;