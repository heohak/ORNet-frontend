import {Accordion, Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import axios from "axios";
import config from "../../../../config/config";


const NewTicketDetails = ({ticket, activeKey, eventKey, handleAccordionToggle}) => {
    const [responsibleName, setResponsibleName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [statusName, setStatusName] = useState('');


    useEffect( () => {
      fetchNames();
    },[]);

    const fetchNames = async () => {
        try {
            const [responsibleResponse, locationResponse, statusResponse] = await Promise.all([
                axios.get(`${config.API_BASE_URL}/bait/worker/${ticket.baitWorkerId}`),
                axios.get(`${config.API_BASE_URL}/location/${ticket.locationId}`),
                axios.get(`${config.API_BASE_URL}/ticket/classificator/${ticket.statusId}`),
            ]);
            const fullName = responsibleResponse.data.firstName + " " + responsibleResponse.data.lastName;
            setResponsibleName(fullName);
            setLocationName(locationResponse.data.name);
            setStatusName(statusResponse.data.status);
        } catch (error) {
            console.error('Error fetching names:', error);
        }
    };

    return (
        <>

            <Accordion activeKey={activeKey}>
                <Accordion.Item eventKey={eventKey}>
                    <Accordion.Header onClick={() => handleAccordionToggle(eventKey)}>
                        Details
                    </Accordion.Header>
                    <Accordion.Body>
                        <div>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Assignee</strong>
                                </Col>
                                <Col>
                                    {responsibleName}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Numeration</strong>
                                </Col>
                                <Col>
                                    {ticket.baitNumeration}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Priority</strong>
                                </Col>
                                <Col>
                                    {ticket.crisis ? "High" : "Normal"}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Client Numeration</strong>
                                </Col>
                                <Col>
                                    {ticket.clientNumeration}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Location</strong>
                                </Col>
                                <Col>
                                    {locationName}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Contacts</strong>
                                </Col>
                                <Col>
                                    {ticket.contactIds}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Work types</strong>
                                </Col>
                                <Col>
                                    {ticket.workTypeIds}
                                </Col>
                            </Row>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
}
export default NewTicketDetails;