import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { FaSignOutAlt } from "react-icons/fa";
import "../css/Navbar.css";

const MenuBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
            setExpanded(false);
        } catch (err) {
            console.error("Error during logout", err);
        }
    };

    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <Navbar
            bg="light"
            expand="lg"
            fixed="top"
            className="navbar-custom"
            expanded={expanded}
        >
            <Container>
                <LinkContainer to="/customers" onClick={() => setExpanded(false)}>
                    <Navbar.Brand>BP CRM</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(expanded ? false : true)}
                />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" activeKey={location.pathname}>
                        <LinkContainer to="/customers" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/customers">Customers</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/devices" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/devices">Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/linkeddevices" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/linkeddevices">Linked Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/maintenances" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/maintenances">Maintenances</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/tickets" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/tickets">Tickets</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/trainings" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/trainings">Trainings</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/contacts" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/contacts">Email List</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/wiki" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/wiki">Wiki</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/settings" onClick={() => setExpanded(false)}>
                            <Nav.Link eventKey="/settings">Settings</Nav.Link>
                        </LinkContainer>
                    </Nav>
                    {isLoggedIn && (
                        <Nav className="ms-auto">
                            <Nav.Link
                                onClick={handleLogout}
                                className="logout-icon"
                                title="Log out"
                            >
                                <FaSignOutAlt />
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MenuBar;
