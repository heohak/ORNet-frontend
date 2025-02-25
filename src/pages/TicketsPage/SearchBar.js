import React, { useEffect, useRef } from 'react';
import { FormControl, InputGroup, DropdownButton, Dropdown, Form, Button, Row, Col } from 'react-bootstrap';

const SearchBar = ({
                       searchQuery,
                       onSearchChange,
                       onFilterChange,
                       onCrisisChange,
                       onPaidChange,
                       onWorkTypeChange,
                       filter,
                       crisis,
                       paid,
                       statuses,
                       workTypes,
                       selectedWorkType,
                       handleAddTicket,
                       collapsed = false,
                       advancedOnly = false,
                       hideAddTicket = false
                   }) => {
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchInputRef.current && !advancedOnly) {
            searchInputRef.current.focus();
        }
    }, [searchQuery, advancedOnly]);

    const handleSearchChange = (e) => {
        onSearchChange(e.target.value);
    };

    const handleFilterChange = (statusId) => {
        onFilterChange(statusId);
    };

    const handleWorkTypeChange = (workTypeId) => {
        onWorkTypeChange(workTypeId);
    };

    // Advanced-only mode: Render each control on its own row (stacked vertically)
    if (advancedOnly) {
        return (
            <>
                <Row className="mb-2">
                    <Col>
                        <InputGroup>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={statuses.find(status => status.id === parseInt(filter))?.status || 'All Statuses'}
                                id="input-group-dropdown-status"
                            >
                                <Dropdown.Item onClick={() => handleFilterChange('all')}>All Statuses</Dropdown.Item>
                                {statuses.map(status => (
                                    <Dropdown.Item key={status.id} onClick={() => handleFilterChange(status.id)}>
                                        {status.status}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <InputGroup>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={workTypes.find(workType => workType.id === parseInt(selectedWorkType))?.workType || 'All Work Types'}
                                id="input-group-dropdown-work-types"
                            >
                                <Dropdown.Item onClick={() => handleWorkTypeChange('all')}>All Work Types</Dropdown.Item>
                                {workTypes.map(workType => (
                                    <Dropdown.Item key={workType.id} onClick={() => handleWorkTypeChange(workType.id)}>
                                        {workType.workType}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Check
                            type="switch"
                            id="crisis-switch"
                            label="Priority"
                            checked={crisis}
                            onChange={onCrisisChange}
                        />
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Check
                            type="switch"
                            id="paid-switch"
                            label="Paid"
                            checked={paid}
                            onChange={onPaidChange}
                        />
                    </Col>
                </Row>
            </>
        );
    }

    // Collapsed mode: Only render the search bar
    if (collapsed) {
        return (
            <Row>
                <Col>
                    <InputGroup>
                        <FormControl
                            ref={searchInputRef}
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                </Col>
            </Row>
        );
    }

    // Full version (desktop)
    return (
        <Row className="mb-4 align-items-center justify-content-between">
            <Col>
                <Row>
                    <Col md={5}>
                        <InputGroup>
                            <FormControl
                                ref={searchInputRef}
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </Col>
                    <Col className="col-md-auto">
                        <InputGroup>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={statuses.find(status => status.id === parseInt(filter))?.status || 'All Statuses'}
                                id="input-group-dropdown-status"
                            >
                                <Dropdown.Item onClick={() => handleFilterChange('all')}>All Statuses</Dropdown.Item>
                                {statuses.map(status => (
                                    <Dropdown.Item key={status.id} onClick={() => handleFilterChange(status.id)}>
                                        {status.status}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                    <Col className="col-md-auto">
                        <InputGroup>
                            <DropdownButton
                                as={InputGroup.Append}
                                variant="outline-secondary"
                                title={workTypes.find(workType => workType.id === parseInt(selectedWorkType))?.workType || 'All Work Types'}
                                id="input-group-dropdown-work-types"
                            >
                                <Dropdown.Item onClick={() => handleWorkTypeChange('all')}>All Work Types</Dropdown.Item>
                                {workTypes.map(workType => (
                                    <Dropdown.Item key={workType.id} onClick={() => handleWorkTypeChange(workType.id)}>
                                        {workType.workType}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                    <Col className="col-md-auto text-center align-content-center">
                        <Form.Check type="switch" id="crisis-switch" label="Priority" checked={crisis} onChange={onCrisisChange} />
                    </Col>
                    <Col className="col-md-auto text-center align-content-center">
                        <Form.Check type="switch" id="paid-switch" label="Paid" checked={paid} onChange={onPaidChange} />
                    </Col>
                </Row>
            </Col>
            {/* Render Add Ticket button only if hideAddTicket is false */}
            {!hideAddTicket && (
                <Col className="col-md-auto text-end">
                    <Button variant="primary" onClick={() => handleAddTicket()}>
                        Add Ticket
                    </Button>
                </Col>
            )}
        </Row>
    );
};

export default SearchBar;
