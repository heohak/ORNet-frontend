import {Button, Col, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {DateUtils} from "../../utils/DateUtils";
import axiosInstance from "../../config/axiosInstance";
import TextareaAutosize from "react-textarea-autosize";
import Linkify from "react-linkify";


const MaintenanceDetailsModal = ({ show, onHide, maintenance }) => {
    const [devices, setDevices] = useState([]);
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        fetchDevices();
    },[])

    const fetchDevices = async() => {
        try {
            const response = await axiosInstance.get(`/maintenance/connections/${maintenance.id}`)
            setDevices(response.data.Devices);
        } catch (error) {
            console.error('Error fetching devices', error);
        }
    }

    const handleDescriptionChange = (description) => {
        maintenance.comment = description
    }






    return (
      <Modal size="xl" show={show} onHide={onHide}>
          <Modal.Header closeButton>
              <Modal.Title>Maintenance Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Row>
                  <Col>
                      Date
                  </Col>
                  <Col>
                      Location
                  </Col>
                  <Col>
                      Time
                  </Col>
              </Row>
              <Row className="mt-4">
                  <Col>
                      Description
                  </Col>
              </Row>
              <Row>
                  <Col>
                      {isEditing ? (
                          <TextareaAutosize
                              minRows={2}
                              value={maintenance.comment}
                              onChange={(e) => handleDescriptionChange(e.target.value)}
                              className="mt-2"
                              style={{
                                  width: "100%",
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "8px",
                                  padding: "8px",
                                  border: "1px solid #ddd",
                              }}
                          />
                      ) : (
                          <div
                              style={{
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "8px",
                                  padding: "10px",
                                  border: "1px solid #ddd",
                              }}
                          >
                              {maintenance.comment &&
                                  maintenance.comment.split("\n").map((line, idx) => (
                                      <React.Fragment key={idx}>
                                          <Linkify>{line}</Linkify>
                                          <br />
                                      </React.Fragment>
                                  ))}

                          </div>
                      )}
                  </Col>
              </Row>
              <Row className="mt-4">
                  <Col>
                      Device List
                  </Col>
                  <Col>
                      Icon
                  </Col>
                  <Col>
                      Status
                  </Col>
                  <Col>
                      Comment
                  </Col>
              </Row>
              {devices.map((device, index) => {
                  const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                  return (
                      <Row
                          key={device.id}
                          className="align-items-center mt-2"
                          style={{ margin: "0", cursor: 'pointer', backgroundColor: rowBgColor }}
                      >
                          <Col md={3} className="py-2">
                              {device.deviceName} {device.serialNumber}
                          </Col>
                          <Col md={3} className="py-2">
                              Add file
                          </Col>
                          <Col md={3} className="py-2">
                              {device.status}
                          </Col>
                          <Col md={2} className="py-2">
                              {device.maintenanceStatus}
                          </Col>
                      </Row>
                  );
              })}
              <Row className="mt-4 justify-content-between">
                  <Col>
                      Service Provided by:
                  </Col>
                  <Col className="col-md-auto">
                      <Button className="me-2">
                          Print Pdf
                      </Button>
                      <Button>
                          Save
                      </Button>
                  </Col>
              </Row>
          </Modal.Body>



      </Modal>
    );

}

export default MaintenanceDetailsModal;