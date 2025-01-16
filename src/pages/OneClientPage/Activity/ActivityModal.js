import React, {useState} from "react";
import {Col, Modal, Row} from "react-bootstrap";
import ModalFiles from "./ModalFiles";
import ModalDetails from "./ModalDetails";
import ModalDescription from "./ModalDescription";
import ModalStatus from "./ModalStatus";
import ModalPaidButton from "./ModalPaidButton";
import DeleteModal from "./DeleteModal";
import {FaTrash} from "react-icons/fa";
import "../../../css/DarkenedModal.css";
import config from "../../../config/config";
import axiosInstance from "../../../config/axiosInstance";
const ActivityModal = ({ activity, handleClose, reFetch, clientName, locations, statuses }) => {
    const [activeKey, setActiveKey] = useState('0');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const locationName = locations.find(location => location.id === activity.locationId)?.name || 'Location not found';
    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle the accordion
    };

    const handleDelete = async() => {
        try {
            await axiosInstance.delete(`${config.API_BASE_URL}/client-activity/delete/${activity.id}`)
            reFetch();
            setShowDeleteModal(false);
            handleClose();
        } catch (error) {
            console.error('Error deleting activity', error);
        }
    }



    return (
        <>
            <Modal show onHide={handleClose} size="xl" dialogClassName={showDeleteModal ? "dimmed" : ""}>
                <Modal.Header closeButton>
                    <div className="w-100">
                        <p className="text-muted mb-0">{clientName}</p>
                        <p className="text-muted mb-0">{locationName}</p>
                    </div>
                </Modal.Header>
                <Modal.Body style={{minHeight: "400px"}}>
                    <Row>
                        <Col md={6}>
                            <h1 className="mb-4">{activity.title}</h1>
                            <ModalDescription activity={activity} reFetch={reFetch}/>
                        </Col>
                        <Col md={6}>
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
                                            <ModalPaidButton activity={activity} reFetch={reFetch} />
                                        </Col>
                                    </div>
                                </Col>
                                <Col className="col-md-auto"> {/* Aligns trash icon to the right */}
                                    <FaTrash
                                        style={{ cursor: "pointer", fontSize: "1.5rem" }}
                                        onClick={() => setShowDeleteModal(true)} // Add your delete function here
                                        title="Delete Ticket"
                                        className="text-danger" // Optional: add a color class
                                    />
                                </Col>
                            </Row>
                            <ModalDetails
                                activity={activity}
                                activeKey={activeKey}
                                handleAccordionToggle={handleAccordionToggle}
                                eventKey="0"
                                reFetch={reFetch}
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
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    handleDelete={handleDelete}
                />
            </Modal>
        </>
    );

}

export default ActivityModal;