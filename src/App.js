import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MenuBar from './components/MenuBar';
import Footer from './components/Footer';
import Customers from './pages/CustomersPage/Customers';
import ClientDevices from './pages/OneClientPage/ClientDevices';
import Tickets from './pages/TicketsPage/Tickets';
import AddClientWorker from './pages/OneClientPage/AddClientWorker';
import Devices from './pages/AllDevicesPage/Devices';
import OneDevice from './pages/OneDevicePage/OneDevice';
import AddClientDevice from './pages/OneClientPage/AddClientDevice';
import SoftwareDetails from './pages/OneClientPage/SoftwareDetails';
import OneClient from './pages/OneClientPage/OneClient';
import Wiki from './pages/WikiPage/Wiki';
import WikiDetails from './pages/WikiPage/WikiDetails';
import Settings from './pages/SettingsPage/Settings';
import ViewBaitWorkers from './pages/SettingsPage/ViewBaitWorkers';
import ViewLocations from './pages/SettingsPage/ViewLocations';
import ViewDeviceClassificators from './pages/SettingsPage/ViewDeviceClassificators';
import ViewTicketStatusClassificators from './pages/SettingsPage/ViewTicketStatusClassificators';
import ViewThirdPartyITs from './pages/SettingsPage/ViewThirdPartyITs';
import ViewLinkedDevices from './pages/SettingsPage/ViewLinkedDevices';
import ViewClientWorkerRoles from './pages/SettingsPage/ViewClientWorkerRoles';
import ViewSoftware from './pages/SettingsPage/ViewSoftware';
import ViewFiles from './pages/SettingsPage/ViewFiles';
import ViewWorkTypes from './pages/SettingsPage/ViewWorkTypes';
import EditClient from "./pages/OneClientPage/EditClient";
import EditDevice from "./pages/OneDevicePage/EditDevice";
import EditLinkedDevice from "./pages/SettingsPage/EditLinkedDeviceModal";
import EditClientWorkerRole from "./pages/SettingsPage/EditClientWorkerRoleModal";
import EditSoftware from "./pages/SettingsPage/EditSoftware";
import EditWorkType from "./pages/SettingsPage/EditWorkType";
import HistoryTable from "./components/HistoryTable";
import Contacts from "./pages/ContactsPage/Contacts";
import ScrollToTop from "./components/ScrollToTop";
import ViewPredefinedDeviceNames from "./pages/SettingsPage/ViewPredefinedDeviceNames";

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="d-flex flex-column min-vh-100">
                <MenuBar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/clients/:clientId/devices" element={<ClientDevices />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/add-client-worker" element={<AddClientWorker />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/device/:deviceId" element={<OneDevice />} />
                        <Route path="/add-client-device" element={<AddClientDevice />} />
                        <Route path="/software/:softwareId" element={<SoftwareDetails />} />
                        <Route path="/customer/:clientId" element={<OneClient />} />
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
                        <Route path="/settings/software" element={<ViewSoftware />} />
                        <Route path="/settings/files" element={<ViewFiles />} />
                        <Route path="/settings/work-types" element={<ViewWorkTypes />} />
                        <Route path="/client/edit/:clientId" element={<EditClient />} />
                        <Route path="/device/edit/:deviceId" element={<EditDevice />} />
                        <Route path="/settings/linked-devices/edit/:id" element={<EditLinkedDevice />} />
                        <Route path="/settings/client-worker-roles/edit/:id" element={<EditClientWorkerRole />} />
                        <Route path="/settings/software/edit/:id" element={<EditSoftware />} />
                        <Route path="/settings/work-types/edit/:id" element={<EditWorkType />} />
                        <Route path="/history" element={<HistoryTable />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/tickets/:ticketId" element={<Tickets />} />
                        <Route path="/customer/:clientId/ticket/:ticketId" element={<OneClient />} />
                        <Route path="/settings/predefined-device-names" element={<ViewPredefinedDeviceNames />}
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
