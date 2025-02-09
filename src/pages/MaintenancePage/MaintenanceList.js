import React, { useState } from 'react';
import { Row, Col} from 'react-bootstrap';
import {DateUtils} from "../../utils/DateUtils";



const MaintenanceList = ({ maintenances, locationNames, setSelectedMaintenance, setShowDetailsModal }) => {


    return (
        <>
            <Row className="row-margin-0 fw-bold mt-2">
                <Col md={3}>Maintenance Name</Col>
                <Col md={3}>Location</Col>
                <Col md={3}>Planned Date</Col>
                <Col md={2}>Status</Col>
                <Col md={1}>Last Date</Col>
            </Row>
            <hr />

            {maintenances.map((maintenance, index) => {
                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                return (
                    <Row
                        key={maintenance.id}
                        className="align-items-center"
                        style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                        onClick={() => { setSelectedMaintenance(maintenance); setShowDetailsModal(true); }}
                    >
                        <Col md={3} className="py-2">
                            {maintenance.maintenanceName}
                        </Col>
                        <Col md={3} className="py-2">
                            {locationNames[maintenance.locationId]}
                        </Col>
                        <Col md={3} className="py-2">
                            {DateUtils.formatDate(maintenance.maintenanceDate)}
                        </Col>
                        <Col md={2} className="py-2">
                            {maintenance.maintenanceStatus}
                        </Col>
                        <Col md={1} className="py-2">
                            {DateUtils.formatDate(maintenance.lastDate)}
                        </Col>
                    </Row>
                );
            })}
        </>
    );
};

export default MaintenanceList;
