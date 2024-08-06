// SearchBar.js
import React, { useEffect, useRef } from 'react';
import { FormControl, InputGroup, DropdownButton, Dropdown, Form } from 'react-bootstrap';

const SearchBar = ({ searchQuery, onSearchChange, onFilterChange, onCrisisChange, onPaidChange, filter, crisis, paid, statuses }) => {
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

    const handleFilterChange = (statusId) => {
        onFilterChange(statusId);
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
                <DropdownButton
                    as={InputGroup.Append}
                    variant="outline-secondary"
                    title={statuses.find(status => status.id === parseInt(filter))?.status || 'All Statuses'}
                    id="input-group-dropdown-2"
                >
                    <Dropdown.Item onClick={() => handleFilterChange('all')}>All Statuses</Dropdown.Item>
                    {statuses.map(status => (
                        <Dropdown.Item key={status.id} onClick={() => handleFilterChange(status.id)}>
                            {status.status}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </InputGroup>
            <Form.Check
                type="switch"
                id="crisis-switch"
                label="Crisis"
                checked={crisis}
                onChange={onCrisisChange}
                className="mb-4"
            />
            <Form.Check
                type="switch"
                id="paid-switch" // New switch for Paid
                label="Paid"
                checked={paid}
                onChange={onPaidChange}
                className="mb-4"
            />
        </div>
    );
};

export default SearchBar;
