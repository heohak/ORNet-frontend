import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container, Row, Col, Collapse } from "react-bootstrap";
import { FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";
import SearchBar from "./SearchBar";
import TicketsList from "./TicketsList";
import config from "../../config/config";
import NewTicket from "./SingleTicketModal/NewTicket";
import AddTicketModal from "./AddTicketModal/AddTicketModal";
import axiosInstance from "../../config/axiosInstance";

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [crisis, setCrisis] = useState(false);
    const [paid, setPaid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [selectedWorkType, setSelectedWorkType] = useState('');
    const [closedStatusId, setClosedStatusId] = useState(0);
    const [closedStatus, setClosedStatus] = useState(null);
    const [ticket, setTicket] = useState(null);
    const [ticketModal, setTicketModal] = useState(false);
    const [addTicketModal, setAddTicketModal] = useState(false);

    // Mobile-specific state for advanced filters toggle
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    const navigate = useNavigate();
    const { ticketId } = useParams();

    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            setStatuses(response.data);
        } catch (error) {
            console.error("Error fetching statuses", error);
        }
    };

    useEffect(() => {
        fetchWorkTypes();
    }, []);

    const fetchWorkTypes = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`);
            setWorkTypes(response.data);
        } catch (error) {
            console.error("Error fetching work types", error);
        }
    };

    useEffect(() => {
        const findClosedStatus = () => {
            if (statuses.length > 0) {
                const closed = statuses.find(status => status.status === 'Closed');
                if (closed) {
                    setClosedStatus(closed);
                    setClosedStatusId(closed.id);
                }
            }
        };
        findClosedStatus();
    }, [statuses]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        fetchTickets();
    }, [filter, debouncedSearchQuery, crisis, paid, selectedWorkType]);

    useEffect(() => {
        if (ticketId) {
            fetchTicketById(ticketId);
            setTicketModal(true);
        } else {
            setTicketModal(false);
            setTicket(null);
        }
    }, [ticketId]);

    const fetchTickets = async () => {
        if (filter === null) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (debouncedSearchQuery.trim()) {
                params.append('searchTerm', debouncedSearchQuery);
            }
            if (filter !== 'all') {
                params.append('statusId', filter);
            }
            if (crisis) {
                params.append('crisis', crisis);
            }
            if (paid) {
                params.append('paid', paid);
            }
            if (selectedWorkType !== 'all') {
                params.append('workTypeId', selectedWorkType);
            }
            const url = `${config.API_BASE_URL}/ticket/search?${params.toString()}`;
            const response = await axiosInstance.get(url);
            setTickets(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
    }, []);

    const handleCrisisChange = useCallback(() => {
        setCrisis(prev => !prev);
    }, []);

    const handlePaidChange = useCallback(() => {
        setPaid(prev => !prev);
    }, []);

    const handleWorkTypeChange = useCallback((newWorkTypeId) => {
        setSelectedWorkType(newWorkTypeId);
    }, []);

    const handleAddTicket = () => {
        setAddTicketModal(true);
    };

    const fetchTicketById = async (id) => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/${id}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Error fetching ticket by ID:', error);
        }
    };

    const handleNavigate = (ticket) => {
        navigate(`/tickets/${ticket.id}`, { state: { fromPath: `/tickets/${ticket.id}` } });
    };

    const closeTicketModal = () => {
        navigate('/tickets');
    };

    return (
        <Container className="mt-5">
            {/* Header: Title and Add Ticket button on the same line */}
            <Row className="align-items-center justify-content-between mb-4">
                <Col xs="auto">
                    <h1 className="mb-0">Tickets</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={handleAddTicket}>
                        Add Ticket
                    </Button>
                </Col>
            </Row>

            {isMobile ? (
                <>
                    <Row className="mb-3 align-items-center">
                        <Col className="align-items-center">
                            <SearchBar
                                collapsed
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                onFilterChange={handleFilterChange}
                                onCrisisChange={handleCrisisChange}
                                onPaidChange={handlePaidChange}
                                onWorkTypeChange={handleWorkTypeChange}
                                filter={filter}
                                crisis={crisis}
                                paid={paid}
                                statuses={statuses}
                                workTypes={workTypes}
                                selectedWorkType={selectedWorkType}
                                handleAddTicket={handleAddTicket}
                            />
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center">
                            <Button variant="outline-secondary" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                                <FaFilter style={{ marginRight: '0.5rem' }} />
                                {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
                            </Button>
                        </Col>
                    </Row>
                    <Collapse in={showMobileFilters}>
                        <div className="mb-3" style={{ padding: '0 1rem' }}>
                            <SearchBar
                                advancedOnly
                                onFilterChange={handleFilterChange}
                                onCrisisChange={handleCrisisChange}
                                onPaidChange={handlePaidChange}
                                onWorkTypeChange={handleWorkTypeChange}
                                filter={filter}
                                crisis={crisis}
                                paid={paid}
                                statuses={statuses}
                                workTypes={workTypes}
                                selectedWorkType={selectedWorkType}
                            />
                        </div>
                    </Collapse>
                </>
            ) : (
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    onCrisisChange={handleCrisisChange}
                    onPaidChange={handlePaidChange}
                    onWorkTypeChange={handleWorkTypeChange}
                    filter={filter}
                    crisis={crisis}
                    paid={paid}
                    statuses={statuses}
                    workTypes={workTypes}
                    selectedWorkType={selectedWorkType}
                    handleAddTicket={handleAddTicket}
                    hideAddTicket={true}  // Do not render the Add Ticket button in desktop SearchBar
                />
            )}
            <TicketsList
                tickets={tickets}
                loading={loading}
                onNavigate={handleNavigate}
                error={error}
                statuses={statuses}
            />
            {ticket && (
                <NewTicket
                    show={ticketModal}
                    onClose={closeTicketModal}
                    firstTicket={ticket}
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                    reFetch={fetchTickets}
                />
            )}
            <AddTicketModal
                show={addTicketModal}
                handleClose={() => setAddTicketModal(false)}
                reFetch={fetchTickets}
                setTicket={setTicket}
                onNavigate={handleNavigate}
                statuses={statuses}
            />
        </Container>
    );
}

export default Tickets;
