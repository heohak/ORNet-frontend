import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Table, Container, Button} from 'react-bootstrap';
import config from "../config/config";
import '../css/HistoryTable.css';
import {useLocation, useNavigate} from "react-router-dom";
import {FaArrowLeft} from "react-icons/fa";
import axiosInstance from "../config/axiosInstance";

function HistoryTable() {
    const location = useLocation();
    const endpoint = location.state?.endpoint;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attributeKeys, setAttributeKeys] = useState([]);
    const [clientNames, setClientNames] = useState({});
    const [classificatorNames, setClassificatorNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [maintenanceNames, setMaintenanceNames] = useState({});
    const [fileNames, setFileNames] = useState({});
    const [comments, setComments] = useState({});
    const [thirdPartyNames, setThirdPartyNames] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`${config.API_BASE_URL}/${endpoint}`);
                const fetchedData = response.data;
                setData(fetchedData);

                // Extract unique attribute keys from all objects
                const attributesKeysSet = new Set();
                fetchedData.forEach(item => {
                    if (item.attributes && typeof item.attributes === 'object') {
                        Object.keys(item.attributes).forEach(attrKey => attributesKeysSet.add(attrKey));
                    }
                });
                setAttributeKeys(Array.from(attributesKeysSet));

                // Fetch client, classificator, location, maintenance, file, comment, and third-party names
                await fetchNames(fetchedData);

                setLoading(false);
            } catch (error) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        const fetchNames = async (fetchedData) => {
            const clientIds = new Set();
            const classificatorIds = new Set();
            const locationIds = new Set();
            const maintenanceIds = new Set();
            const fileIds = new Set();
            const commentIds = new Set();
            const thirdPartyIds = new Set(); // New Set for third-party IDs

            // Collect all unique IDs for clients, classificators, locations, maintenance, comments, files, and third-party IDs
            fetchedData.forEach(item => {
                if (item.clientId) clientIds.add(item.clientId);
                if (item.classificatorId) classificatorIds.add(item.classificatorId);
                if (item.locationId) locationIds.add(item.locationId);
                if (item.locationIds) item.locationIds.forEach(id => locationIds.add(id));
                if (item.maintenanceIds) item.maintenanceIds.forEach(id => maintenanceIds.add(id));
                if (item.fileIds) item.fileIds.forEach(id => fileIds.add(id));
                if (item.commentIds) item.commentIds.forEach(id => commentIds.add(id));
                if (item.thirdPartyIds) item.thirdPartyIds.forEach(id => thirdPartyIds.add(id)); // Collect third-party IDs
            });

            // Fetch names for clientIds
            const clientNamesResponse = await Promise.all(
                Array.from(clientIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/client/${id}`))
            );
            const clientNamesMap = clientNamesResponse.reduce((acc, response) => {
                const { id, fullName } = response.data;
                acc[id] = fullName;
                return acc;
            }, {});
            setClientNames(clientNamesMap);

            // Fetch names for classificatorIds
            const classificatorNamesResponse = await Promise.all(
                Array.from(classificatorIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/device/classificator/${id}`))
            );
            const classificatorNamesMap = classificatorNamesResponse.reduce((acc, response) => {
                const { id, name } = response.data;
                acc[id] = name;
                return acc;
            }, {});
            setClassificatorNames(classificatorNamesMap);

            // Fetch names for locationIds
            const locationNamesResponse = await Promise.all(
                Array.from(locationIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/location/${id}`))
            );
            const locationNamesMap = locationNamesResponse.reduce((acc, response) => {
                const { id, name } = response.data;
                acc[id] = name;
                return acc;
            }, {});
            setLocationNames(locationNamesMap);

            // Fetch names for maintenanceIds
            const maintenanceNamesResponse = await Promise.all(
                Array.from(maintenanceIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/maintenance/${id}`))
            );
            const maintenanceNamesMap = maintenanceNamesResponse.reduce((acc, response) => {
                const { id, maintenanceName } = response.data;
                acc[id] = maintenanceName;
                return acc;
            }, {});
            setMaintenanceNames(maintenanceNamesMap);

            // Fetch names for fileIds
            const fileNamesResponse = await Promise.all(
                Array.from(fileIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/file/${id}`))
            );
            const fileNamesMap = fileNamesResponse.reduce((acc, response) => {
                const { id, fileName } = response.data;
                acc[id] = fileName;
                return acc;
            }, {});
            setFileNames(fileNamesMap);

            // Fetch comments for commentIds
            const commentsResponse = await Promise.all(
                Array.from(commentIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/comment/${id}`))
            );
            const commentsMap = commentsResponse.reduce((acc, response) => {
                const { id, comment } = response.data;
                acc[id] = comment;
                return acc;
            }, {});
            setComments(commentsMap);

            // Fetch names for thirdPartyIds (new)
            const thirdPartyNamesResponse = await Promise.all(
                Array.from(thirdPartyIds).map(id => axiosInstance.get(`${config.API_BASE_URL}/third-party/${id}`))
            );
            const thirdPartyNamesMap = thirdPartyNamesResponse.reduce((acc, response) => {
                const { id, name } = response.data;
                acc[id] = name;
                return acc;
            }, {});
            setThirdPartyNames(thirdPartyNamesMap);
        };

        fetchData();
    }, [endpoint]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;


    // Extract keys from the first object to create table headers (excluding attributes)
// Check if data has at least one item before accessing data[0]
    const baseHeaders = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'attributes') : [];

// Proceed only if baseHeaders has values
    if (baseHeaders.length > 0) {
        baseHeaders.splice(0, 1); // Removes the id field, it is always the first
    }

    // Combine base headers with dynamic attribute keys
    const allHeaders = [...baseHeaders, ...attributeKeys];
    const booleanHeaders = [
        'surgeryCustomer',
        'editorCustomer',
        'pathologyCustomer',
        'surgeryClient',
        'editorClient',
        'pathologyClient',
    ];

    function formatHeaderLabel(header) {
        // Remove 'Id' or 'Ids' suffix
        header = header.replace(/Ids?$/, '');

        // Replace 'client' with 'customer', case-insensitive
        header = header.replace(/client/gi, 'Customer');

        // Insert spaces before capital letters (for camelCase)
        header = header.replace(/([a-z])([A-Z])/g, '$1 $2');

        // Capitalize the first letter of each word
        header = header.replace(/\b\w/g, char => char.toUpperCase());

        // Trim whitespace
        header = header.trim();

        if (header === "Classificator") {
            header = "Type";
        }

        return header;
    }


    return (
        <>
            <Container fluid className="mt-4 table-wrapper">
                <Button
                    variant="link"
                    onClick={() => navigate(-1)}
                    className="p-0 me-2 mb-2"
                    style={{ fontSize: '1.5rem', color: '#0d6efd' }}
                    aria-label="Go back"
                >
                    <FaArrowLeft title="Go back" />
                </Button>
                {data.length === 0 ? (
                    <p>No data available</p>
                ) : (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        {allHeaders.map((header, index) => (
                            <th key={index}>
                                {formatHeaderLabel(header)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            {baseHeaders.map((header, index) => (
                                <td key={index}>
                                    {/* Replace IDs with fetched names, handle multiple IDs */}
                                    {header === 'clientId' ? clientNames[item[header]] || item[header] :
                                        header === 'classificatorId' ? classificatorNames[item[header]] || item[header] :
                                            header === 'locationId' ? locationNames[item[header]] || item[header] :
                                                header === 'maintenanceIds' ? item[header].map(id => maintenanceNames[id] || id).join(', ') :
                                                    header === 'fileIds' ? item[header].map(id => fileNames[id] || id).join(', ') :
                                                        header === 'commentIds' ? item[header].map(id => comments[id] || id).join(', ') :
                                                            header === 'locationIds' ? item[header].map(id => locationNames[id] || id).join(', ') :
                                                                header === 'thirdPartyIds' ? item[header].map(id => thirdPartyNames[id] || id).join(', ') :
                                                                    booleanHeaders.includes(header) ? (item[header] ? 'Yes' : 'No') :
                                                                item[header]}
                                </td>
                            ))}
                            {attributeKeys.map((attrKey, index) => (
                                <td key={index}>
                                    {item.attributes && item.attributes[attrKey] ? item.attributes[attrKey] : ''}
                                </td>
                            ))}
                            {/* New columns for ThirdPartyIds and boolean fields */}
                        </tr>
                    ))}
                    </tbody>
                </Table>
                    )}
            </Container>
        </>
    );
}

export default HistoryTable;
