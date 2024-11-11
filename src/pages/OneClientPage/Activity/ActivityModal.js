import React, {useState} from "react";
import {Col, Modal, Row} from "react-bootstrap";
import NewTicketDescription from "../../TicketsPage/SingleTicketModal/NewTicketDescription";
import NewTicketStatusDropdown from "../../TicketsPage/SingleTicketModal/NewTicketStatusDropdown";
import ToggleSwitch from "../../TicketsPage/SingleTicketModal/ToggleSwitch";
import {FaTrash} from "react-icons/fa";
import ModalFiles from "./ModalFiles";
import ModalDetails from "./ModalDetails";
const ActivityModal = ({ activity, handleClose, reFetch }) => {
    const [activeKey, setActiveKey] = useState('0');


    const handleAccordionToggle = (key) => {
        setActiveKey(prevKey => prevKey === key ? null : key); // Toggle the accordion
    };



    return (
        <>
            <Modal id="custom-modal" show onHide={handleClose} className="custom-width-modal" dialogClassName="custom-modal">
                <Modal.Header closeButton>
                    <div className="w-100">
                        <p className="text-muted mb-0">Kliendi nimi</p>
                        <p className="text-muted mb-0">Lok nimi</p>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <h1>{activity.title}</h1>
                            <p>{activity.description}</p>
                        </Col>
                        <Col md={4}>
                            <Row className="mb-2 justify-content-between">
                                <Col className="col-md-auto">
                                    <div className="d-flex align-items-center">
                                        {/*<Col className="col-md-auto">*/}
                                        {/*    <NewTicketStatusDropdown*/}
                                        {/*        statuses={statuses}*/}
                                        {/*        ticket={ticket}*/}
                                        {/*        setIsClosed={setIsClosed}*/}
                                        {/*        reFetch={reFetchTicket}*/}
                                        {/*    />*/}
                                        {/*</Col>*/}
                                        {/*<Col className="col-md-auto px-2">*/}
                                        {/*    <ToggleSwitch ticket={ticket} reFetch={reFetchTicket} />*/}
                                        {/*</Col>*/}
                                    </div>
                                </Col>
                                {/*<Col className="col-md-auto"> /!* Aligns trash icon to the right *!/*/}
                                {/*    <FaTrash*/}
                                {/*        style={{ cursor: "pointer" }}*/}
                                {/*        onClick={() => setShowDeleteModal(true)} // Add your delete function here*/}
                                {/*        title="Delete Ticket"*/}
                                {/*        className="text-danger" // Optional: add a color class*/}
                                {/*    />*/}
                                {/*</Col>*/}
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
            </Modal>
        </>
    );

}

export default ActivityModal;