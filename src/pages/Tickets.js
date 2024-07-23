// Tickets.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button, Alert, Spinner } from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import TicketsList from "../components/TicketsList";
import config from "../config/config";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const navigate = useNavigate();

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
        const fetchTickets = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `${config.API_BASE_URL}/ticket/all`;
                if (filter === 'open') {
                    url = `${config.API_BASE_URL}/ticket/status/1`;
                } else if (filter === 'closed') {
                    url = `${config.API_BASE_URL}/ticket/status/2`;
                } else if (debouncedSearchQuery.trim()) {
                    url = `${config.API_BASE_URL}/ticket/search?q=${debouncedSearchQuery}`;
                }
                const response = await axios.get(url);
                setTickets(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [filter, debouncedSearchQuery]);

    const handleNavigate = (ticketId) => {
        navigate(`/ticket/${ticketId}?scrollTo=${ticketId}`);
    };

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
        setSearchQuery(''); // Clear search query when filter changes
    }, []);

    const handleAddTicket = () => {
        navigate('/add-ticket', { state: { from: 'tickets' } });
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
                filter={filter}
            />
            <TicketsList
                tickets={tickets}
                loading={loading}
                onNavigate={handleNavigate}
                error={error}
            />
        </Container>
    );
}

export default Tickets;
