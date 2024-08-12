import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Container } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import Select from 'react-select';

function AddClientSoftware({ clientId, show, handleClose, setRefresh, client }) {
    const [softwareList, setSoftwareList] = useState([]);
    const [selectedSoftware, setSelectedSoftware] = useState(null);
    const [error, setError] = useState(null);
    const [showAddNewSoftwareModal, setShowAddNewSoftwareModal] = useState(false);

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
        const fetchSoftware = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/software/all`);
                setSoftwareList(response.data.map(software => ({ value: software.id, label: software.name })));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchSoftware();
    }, []);

    const handleAddExistingSoftware = async () => {
        if (selectedSoftware) {
            try {
                await axios.put(`${config.API_BASE_URL}/software/add/client/${selectedSoftware.value}/${clientId}`);
                setRefresh(prev => !prev); // Trigger refresh by toggling state
                handleClose();
            } catch (error) {
                setError(error.message);
            }
        } else {
            setError('Please select a software');
        }
    };

    const handleAddNewSoftware = async (e) => {
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
                await axios.put(`${config.API_BASE_URL}/software/add/client/${response.data.token}/${clientId}`);
                setRefresh(prev => !prev);
                setName('');
                setDbVersion('');
                setHis({ vendorName: '', version: '', updateDate: '' });
                setPacs({ vendorName: '', version: '', updateDate: '' });
                setDicom({ vendorName: '', version: '', updateDate: '' });
                setHl7({ vendorName: '', version: '', updateDate: '' });
                setLis({ vendorName: '', version: '', updateDate: '' });
                setReturnImagesToLIS({ toReturn: '', link: '', updateDate: '' });
                setOrNetAPI({ version: '', updateDate: '' });
                setTxtIntegrationDate('');
                setCustomerAPI({ vendorName: '', version: '', updateDate: '' });
                setOrNetAPIClient({ version: '', updateDate: '' });
                setConsultationModule({ version: '', updateDate: '' });
                setAiModule({ version: '', updateDate: '' });
                setShowAddNewSoftwareModal(false);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Software to {client.shortName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        {error && (
                            <Alert variant="danger">
                                <Alert.Heading>Error</Alert.Heading>
                                <p>{error}</p>
                            </Alert>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Select Existing Software</Form.Label>
                            <Select
                                options={softwareList}
                                value={selectedSoftware}
                                onChange={setSelectedSoftware}
                                placeholder="Select existing software"
                            />
                            <Form.Text className="text-muted">
                                Can't find the software? <Button variant="link" onClick={() => setShowAddNewSoftwareModal(true)}>Add New</Button>
                            </Form.Text>
                        </Form.Group>
                        <Button variant="success" onClick={handleAddExistingSoftware}>
                            Add Selected Software
                        </Button>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding a new software */}
            <Modal show={showAddNewSoftwareModal} onHide={() => setShowAddNewSoftwareModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Software</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddNewSoftware}>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddNewSoftwareModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddClientSoftware;
