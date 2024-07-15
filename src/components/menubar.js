// src/Menubar.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Menubar = () => {
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>BP CRM</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <LinkContainer to="/">
                            <Nav.Link>Home</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/clients">
                            <Nav.Link>Clients</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/devices">
                            <Nav.Link>Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/tickets">
                            <Nav.Link>Tickets</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/wiki">
                            <Nav.Link>Wiki</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/settings">
                            <Nav.Link>Settings</Nav.Link>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menubar;
