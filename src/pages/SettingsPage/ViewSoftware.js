import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import config from '../../config/config';

function ViewSoftware() {
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [dbVersion, setDbVersion] = useState('');
    const [his, setHis] = useState({ vendorName: '', version: '', updateDate: '' });
    const [pacs, setPacs] = useState({ vendorName: '', version: '', updateDate: '' });
    const [dicom, setDicom] = useState({ vendorName: '', version: '', updateDate: '' });
    const [hl7, setHl7] = useState({ vendorName: '', version: '', updateDate: '' });
    const [lis, setLis] = useState({ vendorName: '', version: '', updateDate: '' });
    const [returnImagesToLIS, setReturnImagesToLIS] = useState({ toReturn: false, link: '', updateDate: '' });
    const [orNetAPI, setOrNetAPI] = useState({ version: '', updateDate: '' });
    const [txtIntegrationDate, setTxtIntegrationDate] = useState('');
    const [customerAPI, setCustomerAPI] = useState({ vendorName: '', version: '', updateDate: '' });
    const [orNetAPIClient, setOrNetAPIClient] = useState({ version: '', updateDate: '' });
    const [consultationModule, setConsultationModule] = useState({ version: '', updateDate: '' });
    const [aiModule, setAiModule] = useState({ version: '', updateDate: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const softwareResponse = await axios.get(`${config.API_BASE_URL}/software/all`);
                setSoftwareList(softwareResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refresh]);

    const handleAddSoftware = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/software/add`, {
                name,
                dbVersion,
                his,
                pacs,
                dicom,
                hl7,
                lis,
                returnImagesToLIS,
                orNetAPI,
                txtIntegrationDate,
                customerAPI,
                orNetAPIClient,
                consultationModule,
                aiModule
            });

            if (response.data && response.data.token) {
                setRefresh(prev => !prev); // Trigger refresh by toggling state
                setShowAddModal(false); // Close the modal after adding the software

                // Clear the form fields
                setName('');
                setDbVersion('');
                setHis({ vendorName: '', version: '', updateDate: '' });
                setPacs({ vendorName: '', version: '', updateDate: '' });
                setDicom({ vendorName: '', version: '', updateDate: '' });
                setHl7({ vendorName: '', version: '', updateDate: '' });
                setLis({ vendorName: '', version: '', updateDate: '' });
                setReturnImagesToLIS({ toReturn: false, link: '', updateDate: '' });
                setOrNetAPI({ version: '', updateDate: '' });
                setTxtIntegrationDate('');
                setCustomerAPI({ vendorName: '', version: '', updateDate: '' });
                setOrNetAPIClient({ version: '', updateDate: '' });
                setConsultationModule({ version: '', updateDate: '' });
                setAiModule({ version: '', updateDate: '' });
            }
        } catch (error) {
            setError(error.message);
        }
    };

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Softwares</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Software</Button>
            </div>
            <Row>
                {softwareList.map((software) => (
                    <Col md={4} key={software.id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{software.name}</Card.Title>
                                <Card.Text>
                                    <strong>DB Version:</strong> {software.dbVersion}<br />
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Software</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form onSubmit={handleAddSoftware}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>DB Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={dbVersion}
                                    onChange={(e) => setDbVersion(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {/* Add input fields for each embedded entity */}
                            <Form.Group className="mb-3">
                                <Form.Label>HIS</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={his.vendorName}
                                    onChange={(e) => setHis({ ...his, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={his.version}
                                    onChange={(e) => setHis({ ...his, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={his.updateDate}
                                    onChange={(e) => setHis({ ...his, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* Repeat for other entities */}
                            {/* PACS */}
                            <Form.Group className="mb-3">
                                <Form.Label>PACS</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={pacs.vendorName}
                                    onChange={(e) => setPacs({ ...pacs, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={pacs.version}
                                    onChange={(e) => setPacs({ ...pacs, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={pacs.updateDate}
                                    onChange={(e) => setPacs({ ...pacs, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* DICOM */}
                            <Form.Group className="mb-3">
                                <Form.Label>DICOM</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={dicom.vendorName}
                                    onChange={(e) => setDicom({ ...dicom, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={dicom.version}
                                    onChange={(e) => setDicom({ ...dicom, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={dicom.updateDate}
                                    onChange={(e) => setDicom({ ...dicom, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* HL7 */}
                            <Form.Group className="mb-3">
                                <Form.Label>HL7</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={hl7.vendorName}
                                    onChange={(e) => setHl7({ ...hl7, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={hl7.version}
                                    onChange={(e) => setHl7({ ...hl7, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={hl7.updateDate}
                                    onChange={(e) => setHl7({ ...hl7, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* LIS */}
                            <Form.Group className="mb-3">
                                <Form.Label>LIS</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={lis.vendorName}
                                    onChange={(e) => setLis({ ...lis, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={lis.version}
                                    onChange={(e) => setLis({ ...lis, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={lis.updateDate}
                                    onChange={(e) => setLis({ ...lis, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* Return Images to LIS */}
                            <Form.Group className="mb-3">
                                <Form.Label>Return Images to LIS</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="To Return"
                                    checked={returnImagesToLIS.toReturn}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, toReturn: e.target.checked })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Link"
                                    value={returnImagesToLIS.link}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, link: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={returnImagesToLIS.updateDate}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* ORNetAPI */}
                            <Form.Group className="mb-3">
                                <Form.Label>ORNetAPI</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={orNetAPI.version}
                                    onChange={(e) => setOrNetAPI({ ...orNetAPI, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={orNetAPI.updateDate}
                                    onChange={(e) => setOrNetAPI({ ...orNetAPI, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* Txt Integration Date */}
                            <Form.Group className="mb-3">
                                <Form.Label>Txt Integration Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={txtIntegrationDate}
                                    onChange={(e) => setTxtIntegrationDate(e.target.value)}
                                />
                            </Form.Group>
                            {/* CustomerAPI */}
                            <Form.Group className="mb-3">
                                <Form.Label>CustomerAPI</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Vendor Name"
                                    value={customerAPI.vendorName}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, vendorName: e.target.value })}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={customerAPI.version}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={customerAPI.updateDate}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* ORNetAPIClient */}
                            <Form.Group className="mb-3">
                                <Form.Label>ORNetAPIClient</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={orNetAPIClient.version}
                                    onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={orNetAPIClient.updateDate}
                                    onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* ConsultationModule */}
                            <Form.Group className="mb-3">
                                <Form.Label>ConsultationModule</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={consultationModule.version}
                                    onChange={(e) => setConsultationModule({ ...consultationModule, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={consultationModule.updateDate}
                                    onChange={(e) => setConsultationModule({ ...consultationModule, updateDate: e.target.value })}
                                />
                            </Form.Group>
                            {/* AIModule */}
                            <Form.Group className="mb-3">
                                <Form.Label>AIModule</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Version"
                                    value={aiModule.version}
                                    onChange={(e) => setAiModule({ ...aiModule, version: e.target.value })}
                                />
                                <Form.Control
                                    type="date"
                                    placeholder="Update Date"
                                    value={aiModule.updateDate}
                                    onChange={(e) => setAiModule({ ...aiModule, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <Button variant="success" type="submit">
                                Add Software
                            </Button>
                        </Form>
                    </Container>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ViewSoftware;
