// src/Menubar.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Menubar = () => {
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>MyApp</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <LinkContainer to="/">
                            <Nav.Link>Avaleht</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/clients">
                            <Nav.Link>Kliendid</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/devices">
                            <Nav.Link>Seadmed</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/tickets">
                            <Nav.Link>Piletid</Nav.Link>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menubar;
