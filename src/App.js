import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Menubar from './components/menubar';
import Clients from './pages/Clients';
import Home from './pages/Home';
import Workers from './pages/Workers';
import ClientDevices from "./pages/ClientDevices";
import Tickets from "./pages/Tickets";
import OneTicket from "./pages/OneTicket";
import AddClient from "./components/AddClient";
import AddWorker from "./components/AddWorker";
import Devices from "./pages/Devices" ;
import OneDevice from "./pages/OneDevice"
import AddClientDevice from "./components/AddClientDevice";

function App() {
    return (
        <Router>
            <Menubar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/clients/:clientId/devices" element={<ClientDevices />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/ticket/:ticketId" element={<OneTicket />} />
                <Route path="/add-client" element={<AddClient />} />
                <Route path="/add-worker" element={<AddWorker />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/device/:deviceId" element={<OneDevice />} />
                <Route path="/add-client-device" element={<AddClientDevice />} />
            </Routes>
        </Router>
    );
}

export default App;
