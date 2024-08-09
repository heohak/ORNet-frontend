import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <Navbar bg="light" variant="light" className="footer mt-auto">
            <Container className="justify-content-center">
                <Navbar.Text className="text-center">
                    &copy; {new Date().getFullYear()} BP CRM. All Rights Reserved.
                </Navbar.Text>
            </Container>
        </Navbar>
    );
};

export default Footer;
