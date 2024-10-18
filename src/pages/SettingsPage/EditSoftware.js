import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/config';

function EditSoftware() {
    const location = useLocation();
    const navigate = useNavigate();
    const software = location.state?.software;
    const [associatedClient, setAssociatedClient] = useState(null); // State to hold the associated client
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const [name, setName] = useState(software?.name || '');
    const [dbVersion, setDbVersion] = useState(software?.dbVersion || '');
    const [his, setHis] = useState(software?.his || { vendorName: '', version: '', updateDate: '' });
    const [pacs, setPacs] = useState(software?.pacs || { vendorName: '', version: '', updateDate: '' });
    const [dicom, setDicom] = useState(software?.dicom || { vendorName: '', version: '', updateDate: '' });
    const [hl7, setHl7] = useState(software?.hl7 || { vendorName: '', version: '', updateDate: '' });
    const [lis, setLis] = useState(software?.lis || { vendorName: '', version: '', updateDate: '' });
    const [returnImagesToLIS, setReturnImagesToLIS] = useState(software?.returnImagesToLIS || { toReturn: false, link: '', updateDate: '' });
    const [orNetAPI, setOrNetAPI] = useState(software?.orNetAPI || { version: '', updateDate: '' });
    const [txtIntegrationDate, setTxtIntegrationDate] = useState(software?.txtIntegrationDate || '');
    const [customerAPI, setCustomerAPI] = useState(software?.customerAPI || { vendorName: '', version: '', updateDate: '' });
    const [orNetAPIClient, setOrNetAPIClient] = useState(software?.orNetAPIClient || { version: '', updateDate: '' });
    const [consultationModule, setConsultationModule] = useState(software?.consultationModule || { version: '', updateDate: '' });
    const [aiModule, setAiModule] = useState(software?.aiModule || { version: '', updateDate: '' });

    const [error, setError] = useState(null);

    const handleUpdateSoftware = async () => {
        try {
            await axios.put(`${config.API_BASE_URL}/software/update/${software.id}`, {
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
            navigate(-1);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchSoftwareWithClient = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/software/${software.id}`);
            const clientId = response.data.clientId;

            // Make another request to get client details using clientId
            const clientResponse = await axios.get(`${config.API_BASE_URL}/client/${clientId}`);
            setAssociatedClient(clientResponse.data); // Assuming API returns full client details
        } catch (error) {
            setError('Error fetching software or client information');
        }
    };

    const handleDeleteSoftware = async () => {
        try {
            await axios.delete(`${config.API_BASE_URL}/software/${software.id}`);
            navigate(-1);
        } catch (error) {
            setError(error.message);
        }
    };
    const handleShowDeleteModal = () => {
        fetchSoftwareWithClient(); // Fetch client before showing the modal
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    return (
        <Container className="mt-5">
            <h1>Edit Technical Information</h1>
            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
            <Form>
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

                {/* HIS */}
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
                    <Form.Label>Consultation Module</Form.Label>
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
                    <Form.Label>AI Module</Form.Label>
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

                <Button variant="success" onClick={handleUpdateSoftware}>
                    Update Tech Info
                </Button>
                <Button variant="danger" onClick={handleShowDeleteModal} className="ms-2">
                    Delete Tech Info
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)} className="ms-2">
                    Cancel
                </Button>
            </Form>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Technical Information Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {associatedClient ? (
                        <div>
                            <p>This Technical Information is linked to the following client:</p>
                            <ul>
                                <li>Client: {associatedClient.shortName}</li>
                            </ul>
                            <p style={{ color: 'red' }}>
                                Deleting this Technical Information will affect the above client. Are you sure you want to proceed?
                            </p>
                        </div>
                    ) : (
                        <p>Loading client information...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSoftware} disabled={!associatedClient}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default EditSoftware;
