// SearchBar.js
import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonGroup, FormControl, InputGroup } from 'react-bootstrap';

const SearchBar = ({ searchQuery, onSearchChange, onFilterChange, filter }) => {
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        onSearchChange(value);
    };

    const handleFilterChange = (newFilter) => {
        onFilterChange(newFilter);
    };

    return (
        <div>
            <InputGroup className="mb-4">
                <FormControl
                    ref={searchInputRef}
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </InputGroup>
            <ButtonGroup className="mb-4">
                <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('all')}
                >
                    All Tickets
                </Button>
                <Button
                    variant={filter === 'open' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('open')}
                >
                    Open Tickets
                </Button>
                <Button
                    variant={filter === 'closed' ? 'primary' : 'outline-primary'}
                    onClick={() => handleFilterChange('closed')}
                >
                    Closed Tickets
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default SearchBar;
