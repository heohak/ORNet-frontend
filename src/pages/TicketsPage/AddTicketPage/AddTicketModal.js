import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import config from "../../../config/config";
import {Alert, Button, Form, Modal} from "react-bootstrap";
import Select from "react-select";
import AddWorkTypeModal from "./AddWorkTypeModal";
import AddLocationModal from "./AddLocationModal";
import AddContactModal from "./AddContactModal";



const AddTicketModal = ({show, handleClose}) => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rootCause: '',
        clientId: '',
        startDateTime: '',
        crisis: false,
        remote: false,
        workTypeIds: [],
        baitWorkerId: '',
        locationId: '',
        statusId: '',
        baitNumeration: '',
        clientNumeration: '',
        contactIds: []
    });

    const [clients, setClients] = useState([]);
    const [locations, setLocations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [baitWorkers, setBaitWorkers] = useState([]);
    const [openStatusId, setOpenStatusId] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
    const [error, setError] = useState(null);
    const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statusRes, baitWorkerRes, clientRes, workTypeRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/ticket/classificator/all`),
                    axios.get(`${config.API_BASE_URL}/bait/worker/all`),
                    axios.get(`${config.API_BASE_URL}/client/all`),
                    axios.get(`${config.API_BASE_URL}/work-type/classificator/all`)
                ]);
                const statuses = statusRes.data;
                if (statuses.length > 0) {
                    // Filter for open status
                    const open = statuses.find(status => status.status === 'Open');
                    if (open) {
                        setOpenStatusId(open.id);
                    }
                }
                setBaitWorkers(baitWorkerRes.data);
                setWorkTypes(workTypeRes.data.map(workType => ({value: workType.id, label: workType.workType})));
                setClients(clientRes.data);

            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchLocationsAndContacts = async () => {
            if (formData.clientId) {
                try {
                    const locationRes = await axios.get(`${config.API_BASE_URL}/client/locations/${formData.clientId}`);
                    const contactRes = await axios.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);

                    const contactsWithRoles = await Promise.all(
                        contactRes.data.map(async contact => {
                            const rolesRes = await axios.get(`${config.API_BASE_URL}/worker/role/${contact.id}`);
                            return {...contact, roles: rolesRes.data.map(role => role.role)};
                        })
                    );

                    setLocations(locationRes.data);
                    setContacts(contactsWithRoles);
                } catch (error) {
                    console.error('Error fetching locations or contacts:', error);
                }
            }
        };

        fetchLocationsAndContacts();
    }, [formData.clientId]);

    const handleChange = (e) => {
        const {id, value, type, checked} = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: id === 'contactIds' ? [value] : (type === 'checkbox' ? checked : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {

            const newTicket = {
                ...formData,
                statusId: openStatusId,
                clientId: formData.clientId,
                workTypeIds: selectedWorkTypes.map(option => option.value), // Map selected work type objects to IDs
            };

            await axios.post(`${config.API_BASE_URL}/ticket/add`, newTicket);
            navigate(`/tickets`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleWorkTypeAdded = async (workType) => {
        try {
            const newWorkTypeOption = {value: workType.id, label: workType.workType};

            setWorkTypes(prevWorkTypes => [...prevWorkTypes, newWorkTypeOption]);
            setSelectedWorkTypes(prevSelected => [...prevSelected, newWorkTypeOption]);
        } catch (error) {
            console.error('Error fetching work types:', error);
        }
    };

    const handleLocationAdded = async () => {
        if (formData.clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/client/locations/${formData.clientId}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        }
    };

    const handleContactAdded = async () => {
        if (formData.clientId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/worker/${formData.clientId}`);
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        }
    };



    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add a New Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="title" className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="clientId" className="mb-3">
                        <Form.Label>Client</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData.clientId}
                            onChange={handleChange}
                            id="clientId"
                            required
                        >
                            {clients.length > 0 && <option value="">Select Client</option>}
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.fullName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="baitNumeration" className="mb-3">
                        <Form.Label>Our Numeration</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.baitNumeration}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="clientNumeration" className="mb-3">
                        <Form.Label>Client Numeration</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.clientNumeration}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="description" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="crisis" className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Crisis"
                            checked={formData.crisis}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <div className="d-flex mb-2">
                            <Form.Label className="align-items-centre mb-0">Selected Work Types</Form.Label>
                            <Button
                                variant="link"
                                onClick={() => setShowWorkTypeModal(true)}
                                className="text-primary py-0"
                            >
                                Add New Work Type
                            </Button>
                        </div>
                        <Select
                            isMulti
                            options={workTypes}
                            value={selectedWorkTypes}
                            onChange={setSelectedWorkTypes}
                            placeholder="Select work types"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Responsible</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData.baitWorkerId}
                            onChange={handleChange}
                            id="baitWorkerId"
                        >
                            <option value="">Select Responsible</option>
                            {baitWorkers.map(baitWorker => (
                                <option key={baitWorker.id} value={baitWorker.id}>
                                    {baitWorker.firstName + " " + baitWorker.lastName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <div className="d-flex mb-2">
                            <Form.Label className="align-items-centre mb-0">Location</Form.Label>
                            {formData.clientId && (
                                <Button
                                    variant="link"
                                    onClick={() => setShowLocationModal(true)}
                                    className="py-0 text-primary"
                                >
                                    Add New Location
                                </Button>
                            )}
                        </div>
                        <Form.Control
                            as="select"
                            value={formData.locationId}
                            onChange={handleChange}
                            id="locationId"
                            disabled={!formData.clientId}
                        >
                            {!formData.clientId ? (
                                <option value="">Pick a client before picking a location</option>
                            ) : (
                                <>
                                    <option value="">Select Location</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <div className="d-flex mb-2">
                            <Form.Label className="align-items-centre mb-0">Contact</Form.Label>
                            {formData.clientId && (
                                <Button
                                    variant="link"
                                    onClick={() => setShowContactModal(true)}
                                    className="py-0 text-primary"
                                >
                                    Add A New Contact
                                </Button>
                            )}
                        </div>
                        <Form.Control
                            as="select"
                            value={formData.contactIds[0] || ""}
                            onChange={handleChange}
                            id="contactIds"
                            disabled={!formData.clientId}
                        >
                            {!formData.clientId ? (
                                <option value="">Pick a client before picking a contact</option>
                            ) : (
                                <>
                                    <option value="">Select a Contact</option>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.favorite ? "★ " : ""}
                                            {contact.firstName + " " + contact.lastName}
                                            {contact.roles && contact.roles.length > 0 && ` - Roles: ${contact.roles.join(", ")}`}
                                        </option>
                                    ))}
                                </>
                            )}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="success" type="submit" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>

            <AddWorkTypeModal
                show={showWorkTypeModal}
                handleClose={() => setShowWorkTypeModal(false)}
                onAdd={handleWorkTypeAdded}
            />
            <AddLocationModal
                show={showLocationModal}
                handleClose={() => setShowLocationModal(false)}
                onAdd={handleLocationAdded}
                clientId={formData.clientId}
            />
            <AddContactModal
                show={showContactModal}
                handleClose={() => setShowContactModal(false)}
                onAdd={handleContactAdded}
                clientId={formData.clientId}
                locations={locations}
            />
        </Modal>
    );
};

export default AddTicketModal;
