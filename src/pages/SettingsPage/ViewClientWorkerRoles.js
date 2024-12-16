import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
} from 'react-bootstrap';
import {FaArrowLeft, FaEdit} from 'react-icons/fa';
import config from '../../config/config';
import EditClientWorkerRoleModal from "./EditClientWorkerRoleModal";
import { useNavigate } from 'react-router-dom';

function ViewClientWorkerRoles() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleName, setRoleName] = useState('');

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/worker/classificator/all`);
            setRoles(response.data);
            setError(null);
        } catch (error) {
            setError('Error fetching client worker roles');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_BASE_URL}/worker/classificator/add`, {
                role: roleName,
            });
            fetchRoles();
            setShowAddModal(false);
            setRoleName('');
        } catch (error) {
            setError('Error adding role');
        }
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setSelectedRole(null);
        setShowEditModal(false);
    };

    const handleNavigate = () => {
        navigate('/history', { state: { endpoint: `worker/classificator/deleted` } });
    };

    return (
        <Container className="mt-4">

            <Button
                variant="link"
                onClick={() => window.history.back()}
                className="mb-4 p-0"
                style={{ fontSize: '1.5rem', color: '#0d6efd' }} // Adjust styling as desired
            >
                <FaArrowLeft title="Go back" />
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Customer Contact Roles</h1>
                <div>
                    <Button variant="secondary" onClick={handleNavigate} className="me-2">
                        See Deleted
                    </Button>
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Role
                    </Button>
                </div>
            </div>


            {loading ? (
                <Container className="text-center mt-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    {roles.length === 0 ? (
                        <Alert variant="info">No roles found.</Alert>
                    ) : (
                        <>
                            {/* Table Header */}
                            <Row className="fw-bold mt-2">
                                <Col>Role</Col>
                                <Col md="auto">Actions</Col>
                            </Row>
                            <hr />
                            {/* Roles Rows */}
                            {roles.map((role, index) => {
                                const rowBgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                                return (
                                    <Row
                                        key={role.id}
                                        className="align-items-center"
                                        style={{ backgroundColor: rowBgColor }}
                                    >
                                        <Col>{role.role}</Col>
                                        <Col md="auto">
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    )}
                </>
            )}

            {/* Add Role Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Role</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddRole}>
                    <Modal.Body>
                        <Form.Group controlId="formRole">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Enter role"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Role
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Role Modal */}
            {selectedRole && (
                <EditClientWorkerRoleModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    role={selectedRole}
                    onUpdate={fetchRoles}
                />
            )}
        </Container>
    );
}

export default ViewClientWorkerRoles;
