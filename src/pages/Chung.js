import React, {useEffect, useState} from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from "axios";
import chung from "../assets/chungus.png";
function Home() {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [ip, setIp] = useState('');
    const [delayedMessage, setDelayedMessage] = useState(false);
    const fetchIp = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIp(response.data.ip);
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    };
    useEffect(() => {
        if (loading) {
            const timeoutId = setTimeout(() => {
                setDelayedMessage(true);
            }, 5000);
            return () => clearTimeout(timeoutId);
        }
    }, [loading]);
    const handleCalculate = () => {
        setLoading(true);
        setResult(null);
        fetchIp();
        setDelayedMessage(false);
        const randomChance = Math.random();
        const delayDuration = randomChance <= 0.3 ? 15000 : 5000;
        setTimeout(() => {
            setLoading(false);
            setDelayedMessage(false);
            if (randomChance <= 0.3) {
                const sum = parseFloat(value1) + parseFloat(value2);
                setResult(`The result is: ${sum}`);
            } else if (randomChance >= 0.3 && randomChance <=0.5) {
                setResult("She is 18")
            } else {
                setResult("You Have Been Molested By Big Chungus");
            }
        }, delayDuration);
    };
    return (
        <Container className="mt-5">
            <Row className="mb-4">
                <Col>
                    <img src={chung} alt="chung.png" style={{ width: "100%", display: "block", margin: "auto" }} />
                </Col>
            </Row>
            <h1 style={{ display: "flex", justifyContent: "center" }}>Calculator</h1>
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
                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <Button variant="primary" onClick={handleCalculate} disabled={loading}>
                            Calculate
                        </Button>
                    </div>
                </Col>
                <p style={{ display: "flex", justifyContent: "center" }}>Answer:</p>
            </Row>
            <Row className="justify-content-center">
                <Col md="auto">
                    {loading && (
                        <div style={{ textAlign: 'center' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            {delayedMessage && (
                                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                    It is taking longer than expected
                                </div>
                            )}
                        </div>
                    )}
                    {result && <Alert variant="success">{result}</Alert>}
                </Col>
            </Row>
            {ip && (
                <Row className="justify-content-center">
                    <Col md="auto">
                        <Alert variant="info">Your IP: {ip}</Alert>
                    </Col>
                </Row>
            )}
        </Container>
    );
}


export default Home;
