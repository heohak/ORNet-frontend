import React, {useRef, useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import ModalFiles from "./ModalFiles";
import ModalDetails from "./ModalDetails";
import ModalDescription from "./ModalDescription";
import ModalStatus from "./ModalStatus";
import {FaEdit, FaSave, FaTrash} from "react-icons/fa";
import "../../../css/DarkenedModal.css";
import '../../../css/OneClientPage/AddActivityModal.css';
import ReactDatePicker from "react-datepicker";
import axiosInstance from "../../../config/axiosInstance";
import config from "../../../config/config";
import '../../../css/OneClientPage/CustomerActivity.css';
import ActivityComments from "./ActivityComments";
import {DateUtils} from "../../../utils/DateUtils";
const ActivityModal = ({ activity, handleClose, reFetch, clientName, locations, statuses }) => {
    const [activeKey, setActiveKey] = useState('0');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deadline, setDeadline] = useState(activity.endDateTime)

    const modalDetailsRef = useRef();
    const modalDescriptionRef = useRef();
    const modalCommentsRef = useRef();

    const locationName = locations.find(location => location.id === activity.locationId)?.name || 'Location not found';
    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle the accordion
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "N/A"
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // This will format it to DD.MM.YYYY
    };

    const handleSaveDeadline = async() => {
        try {
            await axiosInstance.put(`${config.API_BASE_URL}/client-activity/update/${activity.id}`,{
                endDateTime: deadline
            })
        } catch (error) {
            console.error("Error saving deadline: ", error)
        }
    }

    const handleSaveChanges = async () => {

        if (modalDetailsRef.current) {
            await modalDetailsRef.current.saveChanges(); // Calls the child method
        }
        if (modalDescriptionRef.current) {
            await modalDescriptionRef.current.saveChanges();
        }
        if (modalDescriptionRef.current) {
            await modalCommentsRef.current.saveChanges();
        }
        await handleSaveDeadline();
        reFetch();

    }


    const handleEditToggle = (e) => {
        e.stopPropagation();  // Prevent the accordion from collapsing
        if (isEditing) {
            // If in edit mode, save the changes to the server
            handleSaveChanges();
        }
        setIsEditing(!isEditing);
    };

    const handleDateChange = (date) => {
        setDeadline(date)
    };



    return (
        <>
            <Modal
                id="custom-modal"
                show
                backdrop="static"
                onHide={handleClose}
                className="custom-width-modal"
                dialogClassName={showDeleteModal ? "dimmed" : "custom-modal"}
            >
                <Modal.Header closeButton>
                    <div className="w-100">
                        <p className="text-muted mb-0">{clientName}</p>
                        <p className="text-muted mb-0">{locationName}</p>
                    </div>
                </Modal.Header>
                <Modal.Body style={{minHeight: "400px"}}>
                    <Row>
                        <Col md={8}>
                            <h1 className="mb-4">{activity.title}</h1>
                            <ModalDescription
                                ref={modalDescriptionRef}
                                isEditing={isEditing}
                                activity={activity}
                                reFetch={reFetch}
                            />
                            <ActivityComments
                                activity={activity}
                                reFetch={reFetch}
                                isEditing={isEditing}
                                ref={modalCommentsRef}
                            />
                        </Col>
                        <hr className="responsive-hr" />
                        <Col md={4}>
                            <Row className="mb-2 justify-content-between">
                                <Col className="col-md-auto">
                                    <div className="d-flex align-items-center">
                                        <Col className="col-md-auto">
                                            <ModalStatus
                                                statuses={statuses}
                                                activity={activity}
                                                reFetch={reFetch}
                                            />
                                        </Col>
                                        <Col className="col-md-auto px-2">
                                            {/*<ModalPaidButton activity={activity} reFetch={reFetch} />*/}
                                            {isEditing ? (
                                                <div>
                                                    <ReactDatePicker
                                                        selected={deadline}
                                                        onChange={handleDateChange}
                                                        dateFormat="dd.MM.yyyy"
                                                        className="form-control dark-placeholder" // Add a custom class
                                                        placeholderText="Select a date"
                                                        isClearable
                                                        required
                                                    />

                                                </div>
                                            ) : <p className="fw-bold mb-0 fs-5">Deadline: {DateUtils.formatDate(deadline)}</p>
                                            }
                                        </Col>
                                    </div>
                                </Col>
                                <Col xs="auto" className="col-md-auto align-content-center" style={{paddingLeft: 0}}>
                                    <Button
                                        variant="link"
                                        onClick={handleEditToggle}  // Stop event propagation here
                                        style={{ textDecoration: 'none', padding: 0 }} // Style button
                                        className="me-2 d-flex"
                                    >
                                        {isEditing ? <FaSave style={{ fontSize: '1.5rem' }}/> : <FaEdit style={{ fontSize: '1.5rem' }}/>}
                                    </Button>
                                </Col>
                            </Row>
                            <ModalDetails
                                ref={modalDetailsRef}
                                activity={activity}
                                activeKey={activeKey}
                                handleAccordionToggle={handleAccordionToggle}
                                eventKey="0"
                                reFetch={reFetch}
                                setShowDeleteModal={setShowDeleteModal}
                                showDeleteModal={showDeleteModal}
                                closeActivity={handleClose}
                                isEditing={isEditing}
                            />
                            <ModalFiles
                                activity={activity}
                                activeKey={activeKey}
                                handleAccordionToggle={handleAccordionToggle}
                                eventKey="2"
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </>
    );

}

export default ActivityModal;