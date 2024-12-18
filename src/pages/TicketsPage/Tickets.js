import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {Button, Container} from "react-bootstrap";
import SearchBar from "./SearchBar";
import TicketsList from "./TicketsList";
import config from "../../config/config";
import NewTicket from "./SingleTicketModal/NewTicket";
import AddTicketModal from "./AddTicketModal/AddTicketModal";
import axiosInstance from "../../config/axiosInstance";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(null);
    const [crisis, setCrisis] = useState(false);
    const [paid, setPaid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [workTypes, setWorkTypes] = useState([]); // New state for work types
    const [selectedWorkType, setSelectedWorkType] = useState(''); // New state for selected work type
    const [openStatus, setOpenStatus] = useState(null);
    const [closedStatusId, setClosedStatusId] = useState(0);
    const [closedStatus, setClosedStatus] = useState(null);
    const [ticket, setTicket] = useState(null); // selected ticket
    const [ticketModal, setTicketModal] = useState(false); // to control modal state
    const [addTicketModal, setAddTicketModal] = useState(false);


    const navigate = useNavigate();
    const {ticketId} = useParams();

    // Fetch status classifications
    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            setStatuses(response.data); // Set statuses once fetched
        } catch (error) {
            console.error("Error fetching statuses", error);
        }
    };

    // Fetch work types when the component mounts
    useEffect(() => {
        fetchWorkTypes();
    }, []);

    const fetchWorkTypes = async () => {
        try {
            const response = await axiosInstance.get(`${config.API_BASE_URL}/work-type/classificator/all`); // Adjust the endpoint as needed
            setWorkTypes(response.data);
        } catch (error) {
            console.error("Error fetching work types", error);
        }
    };

    // Find and set open and closed statuses once statuses are fetched
    useEffect(() => {
        const findOpenAndClosedStatuses = () => {
            // Ensure statuses are available before proceeding
            if (statuses.length > 0) {
                const open = statuses.find(status => status.status === 'Open');
                const closed = statuses.find(status => status.status === 'Closed');
                if (open) {
                    setOpenStatus(open);
                    setFilter(open.id); // Set the filter to open status ID
                }
                if (closed) {
                    setClosedStatus(closed);
                    setClosedStatusId(closed.id);
                }
            }
        };

        findOpenAndClosedStatuses();
    }, [statuses]); // This effect runs when 'statuses' is updated

    // Debounce the search query input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms delay
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        fetchTickets();
    }, [filter, debouncedSearchQuery, crisis, paid, selectedWorkType]); // Include selectedWorkType in dependencies

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
            if (paid) { // Append Paid parameter
                params.append('paid', paid);
            }
            if (selectedWorkType !== 'all') {
                params.append('workTypeId', selectedWorkType); // Add work type to the filter
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
        setSearchQuery(''); // Clear search query when filter changes
    }, []);

    const handleCrisisChange = useCallback(() => {
        setCrisis((prevCrisis) => !prevCrisis);
    }, []);

    const handlePaidChange = useCallback(() => { // New handler for Paid
        setPaid((prevPaid) => !prevPaid);
    }, []);

    const handleWorkTypeChange = useCallback((newWorkTypeId) => { // New handler for work type change
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
        navigate(`/tickets/${ticket.id}`, {state: {fromPath: `/tickets/${ticket.id}`}});
    };

    const closeTicketModal = () => {
        navigate('/tickets');
    };

    return (
        <Container className="mt-5">
            <div className="mb-4">
                <h1 className="mb-0">Tickets</h1>
            </div>
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                onCrisisChange={handleCrisisChange}
                onPaidChange={handlePaidChange}
                onWorkTypeChange={handleWorkTypeChange} // Pass work type change handler
                filter={filter}
                crisis={crisis}
                paid={paid}
                statuses={statuses}
                workTypes={workTypes} // Pass work types to SearchBar
                selectedWorkType={selectedWorkType}
                handleAddTicket={handleAddTicket}
            />
            <TicketsList
                tickets={tickets}
                loading={loading}
                onNavigate={handleNavigate} // Pass the navigation handler
                error={error}
                statuses={statuses}
            />
            {ticket && (
                <NewTicket
                    show={ticketModal}
                    onClose={closeTicketModal}
                    firstTicket={ticket} // Pass the selected ticket to NewTicket
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
            />
        </Container>
    );
}

export default Tickets;
