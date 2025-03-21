import React, {useState, useEffect} from 'react';

import {Alert, Button, Card, Col, Container, Row, Spinner, Table} from 'react-bootstrap';
import AddClientSoftware from "./AddClientSoftware";
import {useNavigate} from 'react-router-dom';
import '../../css/OneClientPage/SoftwareDetails.css';
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import '../../css/OneClientPage/OneClient.css';
import EditTechnicalInfoModal from "../SettingsPage/EditTechnicalInfoModal";
import {DateUtils} from "../../utils/DateUtils";


function SoftwareDetails({softwareList, clientId, setRefresh, client, isMobile}) {

    // State to manage expanded state for each software item
    const [expandedSoftwareId, setExpandedSoftwareId] = useState(null);
    const [showAddSoftwareModal, setShowAddSoftwareModal] = useState(false);
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSoftware, setSelectedSoftware] = useState(null);


    const toggleTechnicalInfo = (softwareId) => {
        setExpandedSoftwareId(expandedSoftwareId === softwareId ? null : softwareId);
    };

    const handleEdit = (software) => {
        setSelectedSoftware(software);
        setShowEditModal(true);
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
        <>
            <Row className="align-items-center justify-content-between mb-4">
                <Col xs="auto">
                    <h2 className="mb-0">
                        {isMobile ? 'Technical info' : 'Technical information'}
                    </h2>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={() => setShowAddSoftwareModal(true)}>
                        {isMobile ? 'Add New' : 'Add Tech Info'}
                    </Button>
                </Col>
            </Row>
            <Row className="mt-1">
                {softwareList.length > 0 ? (
                softwareList.map(software => (
                    <Col md={4} key={software.id} className="mb-3">
                        <Card className="position-relative customer-page-card">
                            <Card.Body>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div>
                                        <Card.Title className='all-page-cardTitle'>{software.name}</Card.Title>
                                    </div>
                                    <div>
                                        <Button variant="link" onClick={() => handleEdit(software)}>
                                            <FontAwesomeIcon icon={faEdit} title="Edit Technical Information" />
                                        </Button>

                                        <Button variant="link" onClick={() => toggleTechnicalInfo(software.id)}>
                                            {expandedSoftwareId === software.id ? '▲' : '▼'}
                                        </Button>
                                    </div>
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
                                            <td>{DateUtils.formatDate(software.dicom.updateDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.his.updateDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.hl7.updateDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.lis.updateDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.pacs.updateDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.returnImagesToLIS.updateDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>ORNetAPI Version</td>
                                            <td>{software.orNetAPI.version}</td>
                                        </tr>
                                        <tr>
                                            <td>ORNetAPI Update Date</td>
                                            <td>{DateUtils.formatDate(software.orNetAPI.updateDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>Txt Integration Date</td>
                                            <td>{DateUtils.formatDate(software.txtIntegrationDate)}</td>
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
                                            <td>{DateUtils.formatDate(software.customerAPI.updateDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>ORNetAPIClient Version</td>
                                            <td>{software.orNetAPIClient.version}</td>
                                        </tr>
                                        <tr>
                                            <td>ORNetAPIClient Update Date</td>
                                            <td>{DateUtils.formatDate(software.orNetAPIClient.updateDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>Consultation Module Version</td>
                                            <td>{software.consultationModule.version}</td>
                                        </tr>
                                        <tr>
                                            <td>Consultation Module Update Date</td>
                                            <td>{DateUtils.formatDate(software.consultationModule.updateDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>AI Module Version</td>
                                            <td>{software.aiModule.version}</td>
                                        </tr>
                                        <tr>
                                            <td>AI Module Update Date</td>
                                            <td>{DateUtils.formatDate(software.aiModule.updateDate)}</td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    ))
                ) : (
                    <Alert className="mt-3" variant="info">No technical information available.</Alert>
                )}
            </Row>

            {selectedSoftware && (
                <EditTechnicalInfoModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    software={selectedSoftware}
                    onUpdate={() => {
                        setRefresh((prev) => !prev);
                        setShowEditModal(false);
                    }}
                />
            )}


            <AddClientSoftware
                clientId={clientId}
                show={showAddSoftwareModal}
                handleClose={() => setShowAddSoftwareModal(false)}
                setRefresh={setRefresh}
                client={client}
            />
        </>
    );
}

export default SoftwareDetails;
