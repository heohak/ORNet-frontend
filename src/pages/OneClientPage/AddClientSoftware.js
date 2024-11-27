import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Container } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import Select from 'react-select';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/OneClientPage/AddActivityModal.css'; // Adjust the path as needed
import { format } from 'date-fns';

function AddClientSoftware({ clientId, show, handleClose, setRefresh, client }) {
    const [softwareList, setSoftwareList] = useState([]);
    const [selectedSoftware, setSelectedSoftware] = useState(null);
    const [error, setError] = useState(null);
    const [showAddNewSoftwareModal, setShowAddNewSoftwareModal] = useState(false);

    const [name, setName] = useState('');
    const [dbVersion, setDbVersion] = useState('');
    const [his, setHis] = useState({ vendorName: '', version: '', updateDate: null });
    const [pacs, setPacs] = useState({ vendorName: '', version: '', updateDate: null });
    const [dicom, setDicom] = useState({ vendorName: '', version: '', updateDate: null });
    const [hl7, setHl7] = useState({ vendorName: '', version: '', updateDate: null });
    const [lis, setLis] = useState({ vendorName: '', version: '', updateDate: null });
    const [returnImagesToLIS, setReturnImagesToLIS] = useState({ toReturn: false, link: '', updateDate: null });
    const [orNetAPI, setOrNetAPI] = useState({ version: '', updateDate: null });
    const [txtIntegrationDate, setTxtIntegrationDate] = useState(null);
    const [customerAPI, setCustomerAPI] = useState({ vendorName: '', version: '', updateDate: null });
    const [orNetAPIClient, setOrNetAPIClient] = useState({ version: '', updateDate: null });
    const [consultationModule, setConsultationModule] = useState({ version: '', updateDate: null });
    const [aiModule, setAiModule] = useState({ version: '', updateDate: null });

    const [isSubmittingMainForm, setIsSubmittingMainForm] = useState(false);
    const [isSubmittingModalForm, setIsSubmittingModalForm] = useState(false);


    useEffect(() => {
        fetchSoftware();
    }, []);
    const fetchSoftware = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/software/not-used`);
            const sortedSofts = response.data.sort((a, b) => a.name.localeCompare(b.name))
            setSoftwareList(sortedSofts.map(software => ({ value: software.id, label: software.name })));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddExistingSoftware = async () => {
        if (isSubmittingMainForm) return;
        setIsSubmittingMainForm(true);
        if (selectedSoftware) {
            try {
                await axios.put(`${config.API_BASE_URL}/software/add/client/${selectedSoftware.value}/${clientId}`);
                setRefresh(prev => !prev); // Trigger refresh by toggling state
                fetchSoftware();
                handleClose();
                setSelectedSoftware(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsSubmittingMainForm(false);
            }
        } else {
            setError('Please select a software');
            setIsSubmittingMainForm(false);
        }
    };

    const handleAddNewSoftware = async (e) => {
        e.preventDefault();
        if (isSubmittingModalForm) return;
        setIsSubmittingModalForm(true)
        setError(null);

        try {
            const formattedHisUpdateDate = his.updateDate ? format(his.updateDate, 'yyyy-MM-dd') : null;
            const formattedPacsUpdateDate = pacs.updateDate ? format(pacs.updateDate, 'yyyy-MM-dd') : null;
            const formattedDicomUpdateDate = dicom.updateDate ? format(dicom.updateDate, 'yyyy-MM-dd') : null;
            const formattedHl7UpdateDate = hl7.updateDate ? format(hl7.updateDate, 'yyyy-MM-dd') : null;
            const formattedLisUpdateDate = lis.updateDate ? format(lis.updateDate, 'yyyy-MM-dd') : null;
            const formattedReturnImagesToLISUpdateDate = returnImagesToLIS.updateDate ? format(returnImagesToLIS.updateDate, 'yyyy-MM-dd') : null;
            const formattedOrNetAPIUpdateDate = orNetAPI.updateDate ? format(orNetAPI.updateDate, 'yyyy-MM-dd') : null;
            const formattedTxtIntegrationDate = txtIntegrationDate ? format(txtIntegrationDate, 'yyyy-MM-dd') : null;
            const formattedCustomerAPIUpdateDate = customerAPI.updateDate ? format(customerAPI.updateDate, 'yyyy-MM-dd') : null;
            const formattedOrNetAPIClientUpdateDate = orNetAPIClient.updateDate ? format(orNetAPIClient.updateDate, 'yyyy-MM-dd') : null;
            const formattedConsultationModuleUpdateDate = consultationModule.updateDate ? format(consultationModule.updateDate, 'yyyy-MM-dd') : null;
            const formattedAiModuleUpdateDate = aiModule.updateDate ? format(aiModule.updateDate, 'yyyy-MM-dd') : null;

            const response = await axios.post(`${config.API_BASE_URL}/software/add`, {
                name,
                dbVersion,
                his: {
                    vendorName: his.vendorName,
                    version: his.version,
                    updateDate: formattedHisUpdateDate
                },
                pacs: {
                    vendorName: pacs.vendorName,
                    version: pacs.version,
                    updateDate: formattedPacsUpdateDate
                },
                dicom: {
                    vendorName: dicom.vendorName,
                    version: dicom.version,
                    updateDate: formattedDicomUpdateDate
                },
                hl7: {
                    vendorName: hl7.vendorName,
                    version: hl7.version,
                    updateDate: formattedHl7UpdateDate
                },
                lis: {
                    vendorName: lis.vendorName,
                    version: lis.version,
                    updateDate: formattedLisUpdateDate
                },
                returnImagesToLIS: {
                    toReturn: returnImagesToLIS.toReturn,
                    link: returnImagesToLIS.link,
                    updateDate: formattedReturnImagesToLISUpdateDate
                },
                orNetAPI: {
                    version: orNetAPI.version,
                    updateDate: formattedOrNetAPIUpdateDate
                },
                txtIntegrationDate: formattedTxtIntegrationDate,
                customerAPI: {
                    vendorName: customerAPI.vendorName,
                    version: customerAPI.version,
                    updateDate: formattedCustomerAPIUpdateDate
                },
                orNetAPIClient: {
                    version: orNetAPIClient.version,
                    updateDate: formattedOrNetAPIClientUpdateDate
                },
                consultationModule: {
                    version: consultationModule.version,
                    updateDate: formattedConsultationModuleUpdateDate
                },
                aiModule: {
                    version: aiModule.version,
                    updateDate: formattedAiModuleUpdateDate
                }
            });

            if (response.data && response.data.token) {
                await axios.put(`${config.API_BASE_URL}/software/add/client/${response.data.token}/${clientId}`);
                setRefresh(prev => !prev);
                setName('');
                setDbVersion('');
                setHis({ vendorName: '', version: '', updateDate: null });
                setPacs({ vendorName: '', version: '', updateDate: null });
                setDicom({ vendorName: '', version: '', updateDate: null });
                setHl7({ vendorName: '', version: '', updateDate: null });
                setLis({ vendorName: '', version: '', updateDate: null });
                setReturnImagesToLIS({ toReturn: false, link: '', updateDate: null });
                setOrNetAPI({ version: '', updateDate: null });
                setTxtIntegrationDate(null);
                setCustomerAPI({ vendorName: '', version: '', updateDate: null });
                setOrNetAPIClient({ version: '', updateDate: null });
                setConsultationModule({ version: '', updateDate: null });
                setAiModule({ version: '', updateDate: null });
                setShowAddNewSoftwareModal(false);
                handleClose();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmittingModalForm(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Technical Information to {client.shortName}</Modal.Title>
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
                            <Form.Label>Select Existing Tech Info</Form.Label>
                            <Select
                                options={softwareList}
                                value={selectedSoftware}
                                onChange={setSelectedSoftware}
                                placeholder="Select existing Tech Info"
                            />
                            <Form.Text className="text-muted">
                                Can't find the Tech Info? <Button variant="link" onClick={() => setShowAddNewSoftwareModal(true)}>Add New</Button>
                            </Form.Text>
                        </Form.Group>

                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddExistingSoftware} disabled={isSubmittingMainForm}>
                        {isSubmittingMainForm ? 'Adding...' : 'Add Selected Tech Info'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding a new software */}
            <Modal show={showAddNewSoftwareModal} onHide={() => setShowAddNewSoftwareModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Technical Information</Modal.Title>
                </Modal.Header>

                    <Form onSubmit={handleAddNewSoftware}>
                        <Modal.Body>
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
                            <ReactDatePicker
                                selected={his.updateDate}
                                onChange={(date) => setHis({ ...his, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={pacs.updateDate}
                                onChange={(date) => setPacs({ ...pacs, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={dicom.updateDate}
                                onChange={(date) => setDicom({ ...dicom, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={hl7.updateDate}
                                onChange={(date) => setHl7({ ...hl7, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={lis.updateDate}
                                onChange={(date) => setLis({ ...lis, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={returnImagesToLIS.updateDate}
                                onChange={(date) => setReturnImagesToLIS({ ...returnImagesToLIS, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={orNetAPI.updateDate}
                                onChange={(date) => setOrNetAPI({ ...orNetAPI, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
                            />
                        </Form.Group>
                        {/* Txt Integration Date */}
                        <Form.Group className="mb-3">
                            <Form.Label>Txt Integration Date</Form.Label>
                            <ReactDatePicker
                                selected={txtIntegrationDate}
                                onChange={(date) => setTxtIntegrationDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Integration Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={customerAPI.updateDate}
                                onChange={(date) => setCustomerAPI({ ...customerAPI, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={orNetAPIClient.updateDate}
                                onChange={(date) => setOrNetAPIClient({ ...orNetAPIClient, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={consultationModule.updateDate}
                                onChange={(date) => setConsultationModule({ ...consultationModule, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
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
                            <ReactDatePicker
                                selected={aiModule.updateDate}
                                onChange={(date) => setAiModule({ ...aiModule, updateDate: date })}
                                dateFormat="dd/MM/yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Select Update Date"
                                maxDate={new Date()}
                                isClearable
                                required
                            />
                        </Form.Group>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={() => setShowAddNewSoftwareModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmittingModalForm}>
                        {isSubmittingModalForm ? 'Adding...' : 'Add Tech Info'}
                    </Button>


                </Modal.Footer>
            </Form>
            </Modal>
        </>
    );
}

export default AddClientSoftware;
