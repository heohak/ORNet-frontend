import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import config from '../../config/config';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import axiosInstance from "../../config/axiosInstance";

function EditTechnicalInfoModal({ show, onHide, software, onUpdate }) {
    // Form state variables
    const [name, setName] = useState(software?.name || '');
    const [dbVersion, setDbVersion] = useState(software?.dbVersion || '');
    const [his, setHis] = useState({
        vendorName: software?.his?.vendorName || '',
        version: software?.his?.version || '',
        updateDate: software?.his?.updateDate ? parseISO(software.his.updateDate) : null
    });
    const [pacs, setPacs] = useState({
        vendorName: software?.pacs?.vendorName || '',
        version: software?.pacs?.version || '',
        updateDate: software?.pacs?.updateDate ? parseISO(software.pacs.updateDate) : null
    });
    const [dicom, setDicom] = useState({
        vendorName: software?.dicom?.vendorName || '',
        version: software?.dicom?.version || '',
        updateDate: software?.dicom?.updateDate ? parseISO(software.dicom.updateDate) : null
    });
    const [hl7, setHl7] = useState({
        vendorName: software?.hl7?.vendorName || '',
        version: software?.hl7?.version || '',
        updateDate: software?.hl7?.updateDate ? parseISO(software.hl7.updateDate) : null
    });
    const [lis, setLis] = useState({
        vendorName: software?.lis?.vendorName || '',
        version: software?.lis?.version || '',
        updateDate: software?.lis?.updateDate ? parseISO(software.lis.updateDate) : null
    });
    const [returnImagesToLIS, setReturnImagesToLIS] = useState({
        toReturn: software?.returnImagesToLIS?.toReturn || false,
        link: software?.returnImagesToLIS?.link || '',
        updateDate: software?.returnImagesToLIS?.updateDate ? parseISO(software.returnImagesToLIS.updateDate) : null
    });
    const [orNetAPI, setOrNetAPI] = useState({
        version: software?.orNetAPI?.version || '',
        updateDate: software?.orNetAPI?.updateDate ? parseISO(software.orNetAPI.updateDate) : null
    });
    const [txtIntegrationDate, setTxtIntegrationDate] = useState(
        software?.txtIntegrationDate ? parseISO(software.txtIntegrationDate) : null
    );
    const [customerAPI, setCustomerAPI] = useState({
        vendorName: software?.customerAPI?.vendorName || '',
        version: software?.customerAPI?.version || '',
        updateDate: software?.customerAPI?.updateDate ? parseISO(software.customerAPI.updateDate) : null
    });
    const [orNetAPIClient, setOrNetAPIClient] = useState({
        version: software?.orNetAPIClient?.version || '',
        updateDate: software?.orNetAPIClient?.updateDate ? parseISO(software.orNetAPIClient.updateDate) : null
    });
    const [consultationModule, setConsultationModule] = useState({
        version: software?.consultationModule?.version || '',
        updateDate: software?.consultationModule?.updateDate ? parseISO(software.consultationModule.updateDate) : null
    });
    const [aiModule, setAiModule] = useState({
        version: software?.aiModule?.version || '',
        updateDate: software?.aiModule?.updateDate ? parseISO(software.aiModule.updateDate) : null
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [associatedClient, setAssociatedClient] = useState(undefined);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (software.id) {
            fetchSoftwareWithClient();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [software.id]);

    const fetchSoftwareWithClient = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/software/${software.id}`);
            const clientId = response.data.clientId;

            if (clientId) {
                // Fetch client details using clientId
                const clientResponse = await axiosInstance.get(`${config.API_BASE_URL}/client/${clientId}`);
                setAssociatedClient(clientResponse.data); // Assuming API returns full client details
            } else {
                // No associated client
                setAssociatedClient(null);
            }
        } catch (error) {
            setError('Error fetching software or client information');
        }
    };

    const handleUpdateTechnicalInfo = async (e) => {
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

            await axiosInstance.put(`${config.API_BASE_URL}/software/update/${software.id}`, data);

            if (onUpdate) {
                onUpdate(); // Notify parent component
            }
        } catch (error) {
            console.error('Error updating technical information:', error);
            setError('Error updating technical information.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSoftware = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/software/${software.id}`);
            if (onUpdate) {
                onUpdate(); // Refresh the list in parent component
            }
            setShowDeleteModal(false);
            onHide();
        } catch (error) {
            setError('Error deleting technical information');
        } finally {
            setIsSubmitting(false);
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
        <>
            <Modal
                dialogClassName={showDeleteModal ? "dimmed" : ""}
                show={show}
                onHide={onHide}
                size="lg"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Technical Information</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateTechnicalInfo}>
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
                            <Row>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Vendor Name"
                                        value={his.vendorName}
                                        onChange={(e) => setHis({ ...his, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={his.version}
                                        onChange={(e) => setHis({ ...his, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={his.updateDate}
                                        onChange={(date) => setHis({ ...his, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Vendor Name"
                                        value={pacs.vendorName}
                                        onChange={(e) => setPacs({ ...pacs, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={pacs.version}
                                        onChange={(e) => setPacs({ ...pacs, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={pacs.updateDate}
                                        onChange={(date) => setPacs({ ...pacs, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Vendor Name"
                                        value={dicom.vendorName}
                                        onChange={(e) => setDicom({ ...dicom, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={dicom.version}
                                        onChange={(e) => setDicom({ ...dicom, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={dicom.updateDate}
                                        onChange={(date) => setDicom({ ...dicom, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Vendor Name"
                                        value={hl7.vendorName}
                                        onChange={(e) => setHl7({ ...hl7, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={hl7.version}
                                        onChange={(e) => setHl7({ ...hl7, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={hl7.updateDate}
                                        onChange={(date) => setHl7({ ...hl7, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Vendor Name"
                                        value={lis.vendorName}
                                        onChange={(e) => setLis({ ...lis, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={lis.version}
                                        onChange={(e) => setLis({ ...lis, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={lis.updateDate}
                                        onChange={(date) => setLis({ ...lis, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Link"
                                        value={returnImagesToLIS.link}
                                        onChange={(e) => setReturnImagesToLIS({ ...returnImagesToLIS, link: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={returnImagesToLIS.updateDate}
                                        onChange={(date) => setReturnImagesToLIS({ ...returnImagesToLIS, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Version"
                                        value={orNetAPI.version}
                                        onChange={(e) => setOrNetAPI({ ...orNetAPI, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <ReactDatePicker
                                        selected={orNetAPI.updateDate}
                                        onChange={(date) => setOrNetAPI({ ...orNetAPI, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                dateFormat="dd.MM.yyyy"
                                className="form-control dark-placeholder"
                                placeholderText="Integration Date"
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
                                        placeholder="Vendor Name"
                                        value={customerAPI.vendorName}
                                        onChange={(e) => setCustomerAPI({ ...customerAPI, vendorName: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={customerAPI.version}
                                        onChange={(e) => setCustomerAPI({ ...customerAPI, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <ReactDatePicker
                                        selected={customerAPI.updateDate}
                                        onChange={(date) => setCustomerAPI({ ...customerAPI, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
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
                                        placeholder="Version"
                                        value={orNetAPIClient.version}
                                        onChange={(e) => setOrNetAPIClient({ ...orNetAPIClient, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <ReactDatePicker
                                        selected={orNetAPIClient.updateDate}
                                        onChange={(date) => setOrNetAPIClient({ ...orNetAPIClient, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Col>
                            </Row>
                        </Form.Group>

                        {/* ConsultationModule */}
                        <Form.Group className="mb-3">
                            <Form.Label>Consultation Module</Form.Label>
                            <Row>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={consultationModule.version}
                                        onChange={(e) => setConsultationModule({ ...consultationModule, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <ReactDatePicker
                                        selected={consultationModule.updateDate}
                                        onChange={(date) => setConsultationModule({ ...consultationModule, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Col>
                            </Row>
                        </Form.Group>

                        {/* AIModule */}
                        <Form.Group className="mb-3">
                            <Form.Label>AI Module</Form.Label>
                            <Row>
                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Version"
                                        value={aiModule.version}
                                        onChange={(e) => setAiModule({ ...aiModule, version: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <ReactDatePicker
                                        selected={aiModule.updateDate}
                                        onChange={(date) => setAiModule({ ...aiModule, updateDate: date })}
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control dark-placeholder"
                                        placeholderText="Update Date"
                                        maxDate={new Date()}
                                        isClearable
                                    />
                                </Col>
                            </Row>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={onHide}>Cancel</Button>
                        <Button variant="danger" onClick={handleShowDeleteModal}>
                            Delete Tech Info
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Tech Info'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal backdrop="static" show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Technical Information Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {associatedClient === undefined ? (
                        <p>Loading customer information...</p>
                    ) : associatedClient === null ? (
                        <p>This Technical Information is not linked to any customers. Are you sure you want to delete it?</p>
                    ) : (
                        <div>
                            <p>This Technical Information is linked to the following customer:</p>
                            <ul>
                                <li>Customer: {associatedClient.shortName}</li>
                            </ul>
                            <p style={{ color: 'red' }}>
                                Deleting this Technical Information will affect the above customer. Are you sure you want to proceed?
                            </p>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-info" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSoftware} disabled={isSubmitting}>
                        {isSubmitting ? "Deleting..." : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditTechnicalInfoModal;
