import React from 'react';
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Menubar from './components/menubar';
import Clients from './pages/Clients';
import Home from './pages/Home';
import Workers from './pages/Workers';
import Devices from "./pages/Devices";
import Ticket from "./pages/Ticket";

function App() {
    return (
        <Router>
            <Menubar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/clients/:clientId/devices" element={<Devices />} />
                <Route path="/tickets" element={<Ticket />} />
            </Routes>
        </Router>
    );
}

export default App;
