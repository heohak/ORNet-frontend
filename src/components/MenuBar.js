import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { FaSignOutAlt } from "react-icons/fa"; // Import the specific icon
import "../css/Navbar.css";

const MenuBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            localStorage.removeItem("token"); // Remove the token locally
            navigate("/login");
        } catch (err) {
            console.error("Error during logout", err);
        }
    };

    const isLoggedIn = !!localStorage.getItem("token"); // Check if the user is logged in

    return (
        <Navbar bg="light" expand="lg" fixed="top" className="navbar-custom">
            <Container>
                <LinkContainer to="/customers">
                    <Navbar.Brand>BP CRM</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" activeKey={location.pathname}>
                        <LinkContainer to="/customers">
                            <Nav.Link eventKey="/customers">Customers</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/trainings">
                            <Nav.Link eventKey="/trainings">Trainings</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/devices">
                            <Nav.Link eventKey="/devices">Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/linkeddevices">
                            <Nav.Link eventKey="/linkeddevices">Linked Devices</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/tickets">
                            <Nav.Link eventKey="/tickets">Tickets</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/contacts">
                            <Nav.Link eventKey="/contacts">Email List</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/wiki">
                            <Nav.Link eventKey="/wiki">Wiki</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/settings">
                            <Nav.Link eventKey="/settings">Settings</Nav.Link>
                        </LinkContainer>
                    </Nav>
                    {isLoggedIn && (
                        <Nav className="ms-auto">
                            <Nav.Link onClick={handleLogout} className="logout-icon" title="Log out">
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
