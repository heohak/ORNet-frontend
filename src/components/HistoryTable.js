import React, { useState, useEffect } from 'react';
import { Table, Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axiosInstance from '../config/axiosInstance';
import config from '../config/config';
import '../css/HistoryTable.css';

function HistoryTable() {
    const location = useLocation();
    const endpoint = location.state?.endpoint;
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Collect attribute keys so we can add them as columns
    const [attributeKeys, setAttributeKeys] = useState([]);

    // Mapped references: e.g. fileNames[id], comments[id], etc.
    const [clientNames, setClientNames] = useState({});
    const [classificatorNames, setClassificatorNames] = useState({});
    const [locationNames, setLocationNames] = useState({});
    const [maintenanceNames, setMaintenanceNames] = useState({});
    const [fileNames, setFileNames] = useState({});
    const [commentsMap, setCommentsMap] = useState({});
    const [thirdPartyNames, setThirdPartyNames] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            if (!endpoint) {
                setError('No endpoint specified');
                setLoading(false);
                return;
            }

            try {
                // 1) Fetch the main data (device or client history, etc.)
                console.log('Fetching history from:', `${config.API_BASE_URL}/${endpoint}`);
                const response = await axiosInstance.get(`${config.API_BASE_URL}/${endpoint}`);
                const fetchedData = response.data || [];

                setData(fetchedData);

                // 2) Collect all unique attribute keys for dynamic columns
                const attributesKeysSet = new Set();
                fetchedData.forEach(item => {
                    if (item.attributes && typeof item.attributes === 'object') {
                        Object.keys(item.attributes).forEach(attrKey => attributesKeysSet.add(attrKey));
                    }
                });
                setAttributeKeys(Array.from(attributesKeysSet));

                // 3) Gracefully fetch all referenced entity names
                await fetchNames(fetchedData);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching history data:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        const fetchNames = async (fetchedData) => {
            // Prepare sets for all referenced IDs
            const clientIds = new Set();
            const classificatorIds = new Set();
            const locationIds = new Set();
            const maintenanceIds = new Set();
            const fileIds = new Set();
            const commentIds = new Set();
            const thirdPartyIds = new Set();

            // 1) Collect all unique IDs
            fetchedData.forEach(item => {
                if (item.clientId) clientIds.add(item.clientId);
                if (item.classificatorId) classificatorIds.add(item.classificatorId);
                if (item.locationId) locationIds.add(item.locationId);
                if (item.locationIds) item.locationIds.forEach(id => locationIds.add(id));
                if (item.maintenanceIds) item.maintenanceIds.forEach(id => maintenanceIds.add(id));
                if (item.fileIds) item.fileIds.forEach(id => fileIds.add(id));
                if (item.commentIds) item.commentIds.forEach(id => commentIds.add(id));
                if (item.thirdPartyIds) item.thirdPartyIds.forEach(id => thirdPartyIds.add(id));
            });

            // 2) Gracefully fetch each referenced type in a for...of loop with try/catch

            // A) Client Names
            const clientMap = {};
            for (const cid of clientIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/client/${cid}`);
                    clientMap[cid] = res.data.fullName;
                } catch (err) {
                    clientMap[cid] = `Deleted (${cid})`;
                }
            }
            setClientNames(clientMap);

            // B) Device Classificator Names
            const classifierMap = {};
            for (const ccid of classificatorIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/device/classificator/${ccid}`);
                    classifierMap[ccid] = res.data.name;
                } catch (err) {
                    classifierMap[ccid] = `Deleted (${ccid})`;
                }
            }
            setClassificatorNames(classifierMap);

            // C) Location Names
            const locMap = {};
            for (const locId of locationIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/location/${locId}`);
                    locMap[locId] = res.data.name;
                } catch (err) {
                    locMap[locId] = `Deleted (${locId})`;
                }
            }
            setLocationNames(locMap);

            // D) Maintenance Names
            const maintMap = {};
            for (const mid of maintenanceIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/maintenance/${mid}`);
                    maintMap[mid] = res.data.maintenanceName;
                } catch (err) {
                    maintMap[mid] = `Deleted (${mid})`;
                }
            }
            setMaintenanceNames(maintMap);

            // E) File Names
            const fileMap = {};
            for (const fid of fileIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/file/${fid}`);
                    fileMap[fid] = res.data.fileName;
                } catch (err) {
                    fileMap[fid] = `Deleted (${fid})`;
                }
            }
            setFileNames(fileMap);

            // F) Comments
            const commMap = {};
            for (const cid of commentIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/comment/${cid}`);
                    commMap[cid] = res.data.comment;
                } catch (err) {
                    commMap[cid] = `Deleted (${cid})`;
                }
            }
            setCommentsMap(commMap);

            // G) Third Party
            const thirdPartyMap = {};
            for (const tid of thirdPartyIds) {
                try {
                    const res = await axiosInstance.get(`${config.API_BASE_URL}/third-party/${tid}`);
                    thirdPartyMap[tid] = res.data.name;
                } catch (err) {
                    thirdPartyMap[tid] = `Deleted (${tid})`;
                }
            }
            setThirdPartyNames(thirdPartyMap);
        };

        fetchData();
    }, [endpoint]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // If there's no data at all
    if (data.length === 0) {
        return (
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
                <p>No data available</p>
            </Container>
        );
    }

    // Extract base headers from first item (excluding "attributes")
    const baseHeaders = Object.keys(data[0]).filter(key => key !== 'attributes');

    // Optionally remove "id" or reorder
    if (baseHeaders.includes('id')) {
        baseHeaders.splice(baseHeaders.indexOf('id'), 1);
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
        // Remove trailing "Id" or "Ids"
        header = header.replace(/Ids?$/, '');
        // Replace "client" with "customer" (case-insensitive)
        header = header.replace(/client/gi, 'customer');
        // Insert spaces before capital letters
        header = header.replace(/([a-z])([A-Z])/g, '$1 $2');
        // Capitalize each word
        header = header.replace(/\b\w/g, char => char.toUpperCase());
        // Tweak known fields
        if (header === 'Classificator') {
            header = 'Type';
        }
        return header.trim();
    }

    return (
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

            <Table striped bordered hover>
                <thead>
                <tr>
                    {allHeaders.map((header, idx) => (
                        <th key={idx}>
                            {formatHeaderLabel(header)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item, rowIndex) => {
                    // item is, e.g., a DeviceDTO or ClientDTO revision
                    return (
                        <tr key={rowIndex}>
                            {/* Render base fields (no "attributes") */}
                            {baseHeaders.map((header, colIndex) => {
                                let value = item[header];

                                // Replace IDs with fetched names if possible
                                if (header === 'clientId') {
                                    value = clientNames[item[header]] ?? `Deleted (${item[header]})`;
                                } else if (header === 'classificatorId') {
                                    value = classificatorNames[item[header]] ?? `Deleted (${item[header]})`;
                                } else if (header === 'locationId') {
                                    value = locationNames[item[header]] ?? `Deleted (${item[header]})`;
                                } else if (header === 'maintenanceIds') {
                                    value = item.maintenanceIds
                                        ?.map(mid => maintenanceNames[mid] ?? `Deleted (${mid})`)
                                        .join(', ') || '';
                                } else if (header === 'fileIds') {
                                    value = item.fileIds
                                        ?.map(fid => fileNames[fid] ?? `Deleted (${fid})`)
                                        .join(', ') || '';
                                } else if (header === 'commentIds') {
                                    value = item.commentIds
                                        ?.map(cid => commentsMap[cid] ?? `Deleted (${cid})`)
                                        .join(', ') || '';
                                } else if (header === 'locationIds') {
                                    value = item.locationIds
                                        ?.map(lid => locationNames[lid] ?? `Deleted (${lid})`)
                                        .join(', ') || '';
                                } else if (header === 'thirdPartyIds') {
                                    value = item.thirdPartyIds
                                        ?.map(tid => thirdPartyNames[tid] ?? `Deleted (${tid})`)
                                        .join(', ') || '';
                                } else if (booleanHeaders.includes(header)) {
                                    // Show "Yes"/"No" for booleans
                                    value = item[header] ? 'Yes' : 'No';
                                }

                                return <td key={colIndex}>{value ?? ''}</td>;
                            })}

                            {/* Render dynamic attributes in additional columns */}
                            {attributeKeys.map((attrKey, attrColIndex) => {
                                const attrValue = item.attributes?.[attrKey] || '';
                                return (
                                    <td key={attrColIndex}>
                                        {attrValue}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        </Container>
    );
}

export default HistoryTable;
