import React from 'react';
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Clients from './Clients';
import Home from './Home';
import Workers from './Workers';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/workers" element={<Workers />} />
            </Routes>
        </Router>
    );
}

export default App;
