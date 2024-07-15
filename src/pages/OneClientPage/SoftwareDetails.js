import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Table, Button, Card } from 'react-bootstrap';


function SoftwareDetails({ softwareList }) {
    const navigate = useNavigate();

    // State to manage expanded state for each software item
    const [expandedSoftwareId, setExpandedSoftwareId] = useState(null);

    const toggleTechnicalInfo = (softwareId) => {
        setExpandedSoftwareId(expandedSoftwareId === softwareId ? null : softwareId);
    };

    if (!softwareList) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">Technical information</h1>

            {softwareList.map(software => (

                <Card key={software.id} className="mb-4">
                    <Card.Body>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Card.Title>Name: {software.name}</Card.Title>
                            </div>
                            <Button variant="link" onClick={() => toggleTechnicalInfo(software.id)}>
                                {expandedSoftwareId === software.id ? '▲' : '▼'}
                            </Button>
                        </div>
                        {expandedSoftwareId === software.id && (
                            <Table striped bordered hover className="mt-3">
                                <tbody>
                                <tr>
                                    <td>ID</td>
                                    <td>{software.id}</td>
                                </tr>
                                <tr>
                                    <td>DB Version</td>
                                    <td>{software.dbVersion}</td>
                                </tr>
                                <tr>
                                    <td>DICOM Update Date</td>
                                    <td>{software.dicom.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>DICOM Vendor Name</td>
                                    <td>{software.dicom.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>DICOM Version</td>
                                    <td>{software.dicom.version}</td>
                                </tr>
                                <tr>
                                    <td>HIS Update Date</td>
                                    <td>{software.his.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>HIS Vendor Name</td>
                                    <td>{software.his.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>HIS Version</td>
                                    <td>{software.his.version}</td>
                                </tr>
                                <tr>
                                    <td>HL7 Update Date</td>
                                    <td>{software.hl7.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>HL7 Vendor Name</td>
                                    <td>{software.hl7.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>HL7 Version</td>
                                    <td>{software.hl7.version}</td>
                                </tr>
                                <tr>
                                    <td>LIS Update Date</td>
                                    <td>{software.lis.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>LIS Vendor Name</td>
                                    <td>{software.lis.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>LIS Version</td>
                                    <td>{software.lis.version}</td>
                                </tr>
                                <tr>
                                    <td>PACS Update Date</td>
                                    <td>{software.pacs.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>PACS Vendor Name</td>
                                    <td>{software.pacs.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>PACS Version</td>
                                    <td>{software.pacs.version}</td>
                                </tr>
                                </tbody>
                            </Table>
                            )}
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
}

export default SoftwareDetails;