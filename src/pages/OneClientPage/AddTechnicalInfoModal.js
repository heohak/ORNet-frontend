import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config/config';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

function AddTechnicalInfoModal({ show, onHide, onAddTechnicalInfo, clientId }) {
    // Form state variables
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleAddTechnicalInfo = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            // Format dates
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

            // Build data object
            const data = {
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
            };

            const response = await axios.post(`${config.API_BASE_URL}/software/add`, data);

            if (response.data && response.data.token) {
                const softwareId = response.data.token;
                if (clientId) {
                    // Associate software with client
                    await axios.put(`${config.API_BASE_URL}/software/add/client/${softwareId}/${clientId}`);
                }
                if (onAddTechnicalInfo) {
                    onAddTechnicalInfo(); // Notify parent component
                }
                // Reset form fields
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
                onHide();
            }
        } catch (error) {
            console.error('Error adding technical information:', error);
            setError('Error adding technical information.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Technical Information</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddTechnicalInfo}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}
                    {/* Form fields */}
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>DB Version</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter DB Version"
                            value={dbVersion}
                            onChange={(e) => setDbVersion(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* HIS */}
                    <Form.Group className="mb-3">
                        <Form.Label>HIS</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={his.vendorName}
                                    onChange={(e) => setHis({ ...his, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder=" Enter Version"
                                    value={his.version}
                                    onChange={(e) => setHis({ ...his, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={his.updateDate}
                                    onChange={(date) => setHis({ ...his, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* PACS */}
                    <Form.Group className="mb-3">
                        <Form.Label>PACS</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={pacs.vendorName}
                                    onChange={(e) => setPacs({ ...pacs, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={pacs.version}
                                    onChange={(e) => setPacs({ ...pacs, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={pacs.updateDate}
                                    onChange={(date) => setPacs({ ...pacs, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* DICOM */}
                    <Form.Group className="mb-3">
                        <Form.Label>DICOM</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={dicom.vendorName}
                                    onChange={(e) => setDicom({ ...dicom, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={dicom.version}
                                    onChange={(e) => setDicom({ ...dicom, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={dicom.updateDate}
                                    onChange={(date) => setDicom({ ...dicom, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* HL7 */}
                    <Form.Group className="mb-3">
                        <Form.Label>HL7</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={hl7.vendorName}
                                    onChange={(e) => setHl7({ ...hl7, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={hl7.version}
                                    onChange={(e) => setHl7({ ...hl7, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={hl7.updateDate}
                                    onChange={(date) => setHl7({ ...hl7, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* LIS */}
                    <Form.Group className="mb-3">
                        <Form.Label>LIS</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={lis.vendorName}
                                    onChange={(e) => setLis({ ...lis, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={lis.version}
                                    onChange={(e) => setLis({ ...lis, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={lis.updateDate}
                                    onChange={(date) => setLis({ ...lis, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* Return Images to LIS */}
                    <Form.Group className="mb-3">
                        <Form.Label>Return Images to LIS</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Check
                                    type="checkbox"
                                    label="To Return"
                                    checked={returnImagesToLIS.toReturn}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, toReturn: e.target.checked })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Link"
                                    value={returnImagesToLIS.link}
                                    onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, link: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={returnImagesToLIS.updateDate}
                                    onChange={(date) => setReturnImagesToLIS({ ...returnImagesToLIS, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* ORNetAPI */}
                    <Form.Group className="mb-3">
                        <Form.Label>ORNetAPI</Form.Label>
                        <Row>
                            <Col md={6}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={orNetAPI.version}
                                    onChange={(e) => setOrNetAPI({ ...orNetAPI, version: e.target.value })}
                                />
                            </Col>
                            <Col md={6}>
                                <ReactDatePicker
                                    selected={orNetAPI.updateDate}
                                    onChange={(date) => setOrNetAPI({ ...orNetAPI, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* Txt Integration Date */}
                    <Form.Group className="mb-3">
                        <Form.Label>Txt Integration Date</Form.Label>
                        <ReactDatePicker
                            selected={txtIntegrationDate}
                            onChange={(date) => setTxtIntegrationDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control dark-placeholder"
                            placeholderText="Select an Integration Date"
                            maxDate={new Date()}
                            isClearable
                        />
                    </Form.Group>

                    {/* CustomerAPI */}
                    <Form.Group className="mb-3">
                        <Form.Label>CustomerAPI</Form.Label>
                        <Row>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Vendor Name"
                                    value={customerAPI.vendorName}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, vendorName: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder=" Enter Version"
                                    value={customerAPI.version}
                                    onChange={(e) => setCustomerAPI({ ...customerAPI, version: e.target.value })}
                                />
                            </Col>
                            <Col md={4}>
                                <ReactDatePicker
                                    selected={customerAPI.updateDate}
                                    onChange={(date) => setCustomerAPI({ ...customerAPI, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* ORNetAPIClient */}
                    <Form.Group className="mb-3">
                        <Form.Label>ORNetAPIClient</Form.Label>
                        <Row>
                            <Col md={6}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={orNetAPIClient.version}
                                    onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, version: e.target.value })}
                                />
                            </Col>
                            <Col md={6}>
                                <ReactDatePicker
                                    selected={orNetAPIClient.updateDate}
                                    onChange={(date) => setOrNetAPIClient({ ...orNetAPIClient, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* ConsultationModule */}
                    <Form.Group className="mb-3">
                        <Form.Label>ConsultationModule</Form.Label>
                        <Row>
                            <Col md={6}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={consultationModule.version}
                                    onChange={(e) => setConsultationModule({ ...consultationModule, version: e.target.value })}
                                />
                            </Col>
                            <Col md={6}>
                                <ReactDatePicker
                                    selected={consultationModule.updateDate}
                                    onChange={(date) => setConsultationModule({ ...consultationModule, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {/* AIModule */}
                    <Form.Group className="mb-3">
                        <Form.Label>AIModule</Form.Label>
                        <Row>
                            <Col md={6}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Version"
                                    value={aiModule.version}
                                    onChange={(e) => setAiModule({ ...aiModule, version: e.target.value })}
                                />
                            </Col>
                            <Col md={6}>
                                <ReactDatePicker
                                    selected={aiModule.updateDate}
                                    onChange={(date) => setAiModule({ ...aiModule, updateDate: date })}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control dark-placeholder"
                                    placeholderText="Select an Update Date"
                                    maxDate={new Date()}
                                    isClearable
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Tech Info'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AddTechnicalInfoModal;
