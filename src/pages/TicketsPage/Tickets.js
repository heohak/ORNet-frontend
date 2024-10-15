import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button } from "react-bootstrap";
import SearchBar from "./SearchBar";
import TicketsList from "./TicketsList";
import config from "../../config/config";
import NewTicket from "./SingleTicketModal/NewTicket";
import AddTicketModal from "./AddTicketModal/AddTicketModal";


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
    const [openStatus, setOpenStatus] = useState(null);
    const [closedStatusId, setClosedStatusId] = useState(0);
    const [closedStatus, setClosedStatus] = useState(null);
    const [ticket, setTicket] = useState(null); // selected ticket
    const [ticketModal, setTicketModal] = useState(false); // to control modal state
    const [addTicketModal, setAddTicketModal] = useState(false);
    const navigate = useNavigate();

    // Fetch status classifications
    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/ticket/classificator/all`);
            setStatuses(response.data); // Set statuses once fetched
        } catch (error) {
            console.error("Error fetching statuses", error);
        }
    };

    // Find and set open and closed statuses once statuses are fetched
    useEffect(() => {
        const findOpenAndClosedStatuses = () => {
            // Ensure statuses are available before proceeding
            if (statuses.length > 0) {
                // Filter for open and closed statuses
                const open = statuses.find(status => status.status === 'Open');
                const closed = statuses.find(status => status.status === 'Closed');

                // Update state with the found statuses
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
    }, [filter, debouncedSearchQuery, crisis, paid]); // Include Paid in dependencies

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
                params.append('paidWork', paid);
            }

            const url = `${config.API_BASE_URL}/ticket/search?${params.toString()}`;
            const response = await axios.get(url);
            setTickets(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (ticket) => {
        setTicket(ticket); // Set the selected ticket
        setTicketModal(true); // Open the modal
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

    const handleAddTicket = () => {
        setAddTicketModal(true);
    };

    const closeTicketModal = () => {
        setTicketModal(false);
        setTicket(null); // Reset the ticket when closing the modal
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Tickets</h1>
                <Button variant="success" onClick={handleAddTicket}>Add Ticket</Button>
            </div>
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                onCrisisChange={handleCrisisChange}
                onPaidChange={handlePaidChange} // Pass handler to SearchBar
                filter={filter}
                crisis={crisis}
                paid={paid} // Pass state to SearchBar
                statuses={statuses}
            />
            <TicketsList
                tickets={tickets}
                loading={loading}
                onNavigate={handleNavigate} // Pass the navigation handler
                error={error}
                statuses={statuses}
            />
            {/* Render the NewTicket modal only when the ticket is not null */}
            {ticket && (
                <NewTicket
                    show={ticketModal}
                    onClose={closeTicketModal}
                    firstTicket={ticket} // Pass the selected ticket to NewTicket
                    statuses={statuses}
                    isTicketClosed={closedStatusId === ticket.statusId}
                />
            )}
            <AddTicketModal
                show={addTicketModal}
                handleClose={() => setAddTicketModal(false)}
                reFetch={fetchTickets}
                ticketModal={() => setTicketModal(true)}
                setTicket={setTicket}
            />
        </Container>
    );
}

export default Tickets;
