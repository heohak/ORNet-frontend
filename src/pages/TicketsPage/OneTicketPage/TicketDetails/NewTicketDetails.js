import {Accordion, Col, Row} from "react-bootstrap";
import React from "react";


const NewTicketDetails = ({ticket}) => {


    return (
        <>
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Details</Accordion.Header>
                    <Accordion.Body>
                        <div>
                            <Row className="mb-2">
                                <Col xs="auto" style={{ minWidth: '165px' }}>
                                    <strong>Assignee</strong>
                                </Col>
                                <Col>
                                    {ticket.baitWorkerId}
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
                                    <strong>Status</strong>
                                </Col>
                                <Col>
                                    {ticket.statusId}
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
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    );
}
export default NewTicketDetails;