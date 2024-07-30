import React from 'react';
import { Card, Form, Button } from "react-bootstrap";


function TicketForm({ ticket, editFields, setEditFields, handleSave }) {
    const handleChange = (e, ticketId) => {
        const { name, value } = e.target;
        setEditFields((prevFields) => ({
            ...prevFields,
            [ticketId]: {
                ...prevFields[ticketId],
                [name]: value
            }
        }));
    };

    return (
        <>
            <Card.Title className="mt-4">Response</Card.Title>
            <Form.Control
                as="textarea"
                rows={3}
                name="response"
                value={editFields[ticket.id]?.response || ''}
                onChange={(e) => handleChange(e, ticket.id)}
                placeholder="Enter your response here..."
            />
            <Card.Title className="mt-4">Inside Info</Card.Title>
            <Form.Control
                as="textarea"
                rows={3}
                name="insideInfo"
                value={editFields[ticket.id]?.insideInfo || ''}
                onChange={(e) => handleChange(e, ticket.id)}
                placeholder="Enter inside info here..."
            />
            <Button className="mt-3" variant="primary" onClick={() => handleSave(ticket.id)}>
                Save
            </Button>
        </>
    );
}

export default TicketForm;
