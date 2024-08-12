import React, { useState } from 'react';

import { Container, Spinner, Table, Button, Card } from 'react-bootstrap';
import AddClientSoftware from "./AddClientSoftware";

function SoftwareDetails({ softwareList, clientId, setRefresh, client }) {

    // State to manage expanded state for each software item
    const [expandedSoftwareId, setExpandedSoftwareId] = useState(null);
    const [showAddSoftwareModal, setShowAddSoftwareModal] = useState(false);

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
            <h2 className="mb-4">Technical information</h2>
            <Button variant="primary" className="mb-4" onClick={() => setShowAddSoftwareModal(true)}>
                Add Software
            </Button>

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
                                {/* Add the missing fields below */}
                                <tr>
                                    <td>Return Images to LIS - To Return</td>
                                    <td>{software.returnImagesToLIS.toReturn ? 'Yes' : 'No'}</td>
                                </tr>
                                <tr>
                                    <td>Return Images to LIS - Link</td>
                                    <td>{software.returnImagesToLIS.link}</td>
                                </tr>
                                <tr>
                                    <td>Return Images to LIS - Update Date</td>
                                    <td>{software.returnImagesToLIS.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>ORNetAPI Version</td>
                                    <td>{software.orNetAPI.version}</td>
                                </tr>
                                <tr>
                                    <td>ORNetAPI Update Date</td>
                                    <td>{software.orNetAPI.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>Txt Integration Date</td>
                                    <td>{software.txtIntegrationDate}</td>
                                </tr>
                                <tr>
                                    <td>Customer API Vendor Name</td>
                                    <td>{software.customerAPI.vendorName}</td>
                                </tr>
                                <tr>
                                    <td>Customer API Version</td>
                                    <td>{software.customerAPI.version}</td>
                                </tr>
                                <tr>
                                    <td>Customer API Update Date</td>
                                    <td>{software.customerAPI.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>ORNetAPIClient Version</td>
                                    <td>{software.orNetAPIClient.version}</td>
                                </tr>
                                <tr>
                                    <td>ORNetAPIClient Update Date</td>
                                    <td>{software.orNetAPIClient.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>Consultation Module Version</td>
                                    <td>{software.consultationModule.version}</td>
                                </tr>
                                <tr>
                                    <td>Consultation Module Update Date</td>
                                    <td>{software.consultationModule.updateDate}</td>
                                </tr>
                                <tr>
                                    <td>AI Module Version</td>
                                    <td>{software.aiModule.version}</td>
                                </tr>
                                <tr>
                                    <td>AI Module Update Date</td>
                                    <td>{software.aiModule.updateDate}</td>
                                </tr>
                                </tbody>
                            </Table>
                        )}

                    </Card.Body>
                </Card>
            ))}

            <AddClientSoftware
                clientId={clientId}
                show={showAddSoftwareModal}
                handleClose={() => setShowAddSoftwareModal(false)}
                setRefresh={setRefresh}
                client={client}
            />
        </Container>
    );
}

export default SoftwareDetails;
