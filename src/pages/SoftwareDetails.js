import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Table } from 'react-bootstrap';

function SoftwareDetails() {
    const { softwareId } = useParams();
    const location = useLocation();
    const { clientId } = location.state || {};
    const [software, setSoftware] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSoftwareDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/software/${softwareId}`);
                setSoftware(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSoftwareDetails();
    }, [softwareId]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Software Details for Client {clientId}</h1>
            {software && (
                <Table striped bordered hover>
                    <tbody>
                    <tr>
                        <td>ID</td>
                        <td>{software.id}</td>
                    </tr>
                    <tr>
                        <td>DB Version</td>
                        <td>{software.db_version}</td>
                    </tr>
                    <tr>
                        <td>DICOM Update Date</td>
                        <td>{software.dicom_update_date}</td>
                    </tr>
                    <tr>
                        <td>DICOM Vendor Name</td>
                        <td>{software.dicom_vendor_name}</td>
                    </tr>
                    <tr>
                        <td>DICOM Version</td>
                        <td>{software.dicom_version}</td>
                    </tr>
                    <tr>
                        <td>HIS Update Date</td>
                        <td>{software.his_update_date}</td>
                    </tr>
                    <tr>
                        <td>HIS Vendor Name</td>
                        <td>{software.his_vendor_name}</td>
                    </tr>
                    <tr>
                        <td>HIS Version</td>
                        <td>{software.his_version}</td>
                    </tr>
                    <tr>
                        <td>HL7 Update Date</td>
                        <td>{software.hl7_update_date}</td>
                    </tr>
                    <tr>
                        <td>HL7 Vendor Name</td>
                        <td>{software.hl7_vendor_name}</td>
                    </tr>
                    <tr>
                        <td>HL7 Version</td>
                        <td>{software.hl7_version}</td>
                    </tr>
                    <tr>
                        <td>LIS Update Date</td>
                        <td>{software.lis_update_date}</td>
                    </tr>
                    <tr>
                        <td>LIS Vendor Name</td>
                        <td>{software.lis_vendor_name}</td>
                    </tr>
                    <tr>
                        <td>LIS Version</td>
                        <td>{software.lis_version}</td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>{software.name}</td>
                    </tr>
                    <tr>
                        <td>PACS Update Date</td>
                        <td>{software.pacs_update_date}</td>
                    </tr>
                    <tr>
                        <td>PACS Vendor Name</td>
                        <td>{software.pacs_vendor_name}</td>
                    </tr>
                    <tr>
                        <td>PACS Version</td>
                        <td>{software.pacs_version}</td>
                    </tr>
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default SoftwareDetails;
