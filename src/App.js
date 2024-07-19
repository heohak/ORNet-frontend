import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Menubar from './components/menubar';
import Clients from './pages/Clients';
import Home from './pages/Home';
import Chung from "./pages/Chung";
import Workers from './pages/Workers';
import ClientDevices from "./pages/OneClientPage/ClientDevices";
import Tickets from "./pages/Tickets";
import OneTicket from "./pages/OneTicketPage/OneTicket";
import AddClient from "./components/AddClient";
import AddWorker from "./components/AddWorker";
import Devices from "./pages/AllDevicesPage/Devices" ;
import OneDevice from "./pages/OneDevicePage/OneDevice"
import AddClientDevice from "./components/AddClientDevice";
import AddTicket from "./components/AddTicket";
import Softwares from "./pages/Softwares";
import SoftwareDetails from "./pages/OneClientPage/SoftwareDetails";
import OneClient from "./pages/OneClientPage/OneClient";
import Wiki from "./pages/Wiki";
import WikiDetails from "./pages/WikiDetails";
import Settings from "./pages/SettingsPage/Settings";
import ViewBaitWorkers from "./pages/SettingsPage/ViewBaitWorkers";
import ViewLocations from "./pages/SettingsPage/ViewLocations";
import ViewDeviceClassificators from "./pages/SettingsPage/ViewDeviceClassificators";
import ViewTicketStatusClassificators from "./pages/SettingsPage/ViewTicketStatusClassificators";
import ViewThirdPartyITs from "./pages/SettingsPage/ViewThirdPartyITs";
import ViewLinkedDevices from "./pages/SettingsPage/ViewLinkedDevices";
import ViewClientWorkerRoles from "./pages/SettingsPage/ViewClientWorkerRoles";
import ViewClientWorkers from "./pages/SettingsPage/ViewClientWorkers";
import ViewSoftware from "./pages/SettingsPage/ViewSoftware";

function App() {
    return (
        <Router>
            <Menubar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/clients/:clientId/devices" element={<ClientDevices />} />
                <Route path="/chung" element={<Chung />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/ticket/:ticketId" element={<OneTicket />} />
                <Route path="/add-client" element={<AddClient />} />
                <Route path="/add-worker" element={<AddWorker />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/device/:deviceId" element={<OneDevice />} />
                <Route path="/add-client-device" element={<AddClientDevice />} />
                <Route path="/add-ticket" element={<AddTicket />} />
                <Route path="/add-ticket/:mainTicketId" element={<AddTicket />} />
                <Route path="/clients/:clientId/softwares" element={<Softwares />} />
                <Route path="/software/:softwareId" element={<SoftwareDetails />} />
                <Route path="/client/:clientId" element={<OneClient />} />
                <Route path="/wiki" element={<Wiki />} />
                <Route path="/wiki/:wikiId" element={<WikiDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/view-bait-workers" element={<ViewBaitWorkers />} />
                <Route path="/settings/locations" element={<ViewLocations />} />
                <Route path="/settings/device-classificators" element={<ViewDeviceClassificators />} />
                <Route path="/settings/ticket-status-classificators" element={<ViewTicketStatusClassificators />} />
                <Route path="/settings/third-party-its" element={<ViewThirdPartyITs />} />
                <Route path="/settings/linked-devices" element={<ViewLinkedDevices />} />
                <Route path="/settings/client-worker-roles" element={<ViewClientWorkerRoles />} />
                <Route path="/settings/client-workers" element={<ViewClientWorkers />} />
                <Route path="/settings/software" element={<ViewSoftware />} />
            </Routes>
        </Router>
    );
}

export default App;
