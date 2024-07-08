import React, { useState } from 'react';
import chung from '../assets/chungus.png';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';

function Home() {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        setLoading(true);
        setResult(null);

        setTimeout(() => {
            setLoading(false);
            const randomChance = Math.random();
            if (randomChance <= 0.1) {
                const sum = parseFloat(value1) + parseFloat(value2);
                setResult(`The result is: ${sum}`);
            } else {
                setResult("You Have Been Molested By Big Chungus");
            }
        }, 5000);
    };

    return (
        <Container className="mt-5">
            <Row className="mb-4">
                <Col>
                    <img src={chung} alt="chung.png" style={{ width: "100%", display: "block", margin: "auto" }} />
                </Col>
            </Row>
            <h1 style={{display: "flex", justifyContent: "center"}}>Calculator</h1>
            <Row className="mb-3 justify-content-center">
                <Col md={2}>
                    <Form.Control
                        type="text"
                        value={value1}
                        onChange={(e) => setValue1(e.target.value)}
                        placeholder="Enter number"
                    />
                </Col>
                <Col md="auto" className="d-flex align-items-center">
                    <span>+</span>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="text"
                        value={value2}
                        onChange={(e) => setValue2(e.target.value)}
                        placeholder="Enter number"
                    />
                </Col>
            </Row>
            <Row className="mb-3 justify-content-center">
                <Col md={2}>
                    <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                        <Button variant="primary" onClick={handleCalculate} disabled={loading}>
                            Calculate
                        </Button>
                    </div>
                </Col>
                <p style={{display: "flex", justifyContent: "center"}}>Answer:</p>
            </Row>
            <Row className="justify-content-center">
                <Col md="auto">
                    {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
                    {result && <Alert variant="success">{result}</Alert>}
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
