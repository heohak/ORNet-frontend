import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const MenuBar = () => {
    const location = useLocation();

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>BP CRM</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Pass the current pathname as activeKey to highlight the active link */}
                    <Nav className="me-auto" activeKey={location.pathname}>
                        <LinkContainer to="/" exact>
                            <Nav.Link eventKey="/">Home</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/clients">
                            <Nav.Link eventKey="/clients">Clients</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/devices">
                            <Nav.Link eventKey="/devices">Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/tickets">
                            <Nav.Link eventKey="/tickets">Tickets</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/wiki">
                            <Nav.Link eventKey="/wiki">Wiki</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/settings">
                            <Nav.Link eventKey="/settings">Settings</Nav.Link>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MenuBar;
