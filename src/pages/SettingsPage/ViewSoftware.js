import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function ViewSoftware() {
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const [name, setName] = useState('');
    const [dbVersion, setDbVersion] = useState('');
    const [his, setHis] = useState({ vendorName: '', version: '', updateDate: '' });
    const [pacs, setPacs] = useState({ vendorName: '', version: '', updateDate: '' });
    const [dicom, setDicom] = useState({ vendorName: '', version: '', updateDate: '' });
    const [hl7, setHl7] = useState({ vendorName: '', version: '', updateDate: '' });
    const [lis, setLis] = useState({ vendorName: '', version: '', updateDate: '' });
    const [returnImagesToLIS, setReturnImagesToLIS] = useState({ toReturn: '', link: '', updateDate: '' });
    const [orNetAPI, setOrNetAPI] = useState({ version: '', updateDate: '' });
    const [txtIntegrationDate, setTxtIntegrationDate] = useState('');
    const [customerAPI, setCustomerAPI] = useState({ vendorName: '', version: '', updateDate: '' });
    const [orNetAPIClient, setOrNetAPIClient] = useState({ version: '', updateDate: '' });
    const [consultationModule, setConsultationModule] = useState({ version: '', updateDate: '' });
    const [aiModule, setAiModule] = useState({ version: '', updateDate: '' });

    const navigate = useNavigate();

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
            }
            window.location.reload()
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

                            <h5>HIS</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={his.vendorName}
                                    onChange={(e) => setHis({ ...his, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={his.version}
                                    onChange={(e) => setHis({ ...his, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={his.updateDate}
                                    onChange={(e) => setHis({ ...his, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>PACS</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={pacs.vendorName}
                                    onChange={(e) => setPacs({ ...pacs, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={pacs.version}
                                    onChange={(e) => setPacs({ ...pacs, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={pacs.updateDate}
                                    onChange={(e) => setPacs({ ...pacs, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>DICOM</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={dicom.vendorName}
                                    onChange={(e) => setDicom({ ...dicom, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={dicom.version}
                                    onChange={(e) => setDicom({ ...dicom, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dicom.updateDate}
                                    onChange={(e) => setDicom({ ...dicom, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>HL7</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={hl7.vendorName}
                                    onChange={(e) => setHl7({ ...hl7, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={hl7.version}
                                    onChange={(e) => setHl7({ ...hl7, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={hl7.updateDate}
                                    onChange={(e) => setHl7({ ...hl7, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>LIS</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lis.vendorName}
                                    onChange={(e) => setLis({ ...lis, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lis.version}
                                    onChange={(e) => setLis({ ...lis, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={lis.updateDate}
                                    onChange={(e) => setLis({ ...lis, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>Return Images To LIS</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>To Return</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={returnImagesToLIS.toReturn}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, toReturn: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Link</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={returnImagesToLIS.link}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, link: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={returnImagesToLIS.updateDate}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>ORNet API</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={orNetAPI.version}
                                    onChange={(e) => setOrNetAPI({ ...orNetAPI, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={orNetAPI.updateDate}
                                    onChange={(e) => setOrNetAPI({ ...orNetAPI, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Integration Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={txtIntegrationDate}
                                    onChange={(e) => setTxtIntegrationDate(e.target.value)}
                                />
                            </Form.Group>

                            <h5>Customer API</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Vendor Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customerAPI.vendorName}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, vendorName: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customerAPI.version}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={customerAPI.updateDate}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>ORNet API Client</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={orNetAPIClient.version}
                                    onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={orNetAPIClient.updateDate}
                                    onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>Consultation Module</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={consultationModule.version}
                                    onChange={(e) => setConsultationModule({ ...consultationModule, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={consultationModule.updateDate}
                                    onChange={(e) => setConsultationModule({ ...consultationModule, updateDate: e.target.value })}
                                />
                            </Form.Group>

                            <h5>AI Module</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={aiModule.version}
                                    onChange={(e) => setAiModule({ ...aiModule, version: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Update Date</Form.Label>
                                <Form.Control
                                    type="date"
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
            <Button onClick={() => navigate(-1)}>Back</Button>
        </Container>
    );
}

export default ViewSoftware;
