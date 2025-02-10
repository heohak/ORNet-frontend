import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MenuBar from './components/MenuBar';
import Footer from './components/Footer';
import Customers from './pages/CustomersPage/Customers';
import Login from './pages/LoginPage/Login';
import ClientDevices from './pages/OneClientPage/ClientDevices/ClientDevices';
import Tickets from './pages/TicketsPage/Tickets';
import AddClientWorker from './pages/OneClientPage/AddClientWorker';
import Devices from './pages/AllDevicesPage/Devices';
import OneDevice from './pages/OneDevicePage/OneDevice';
import AddClientDevice from './pages/OneClientPage/ClientDevices/AddClientDevice';
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
import ProtectedRoute from "./pages/ProtectedRoute";
import axios from "axios";
import AdminDashboard from "./pages/TestPages/AdminDashboard";
import UserProfile from "./pages/TestPages/UserProfile";
import UserDetails from "./pages/TestPages/UserDetails";
import Trainings from './pages/TrainingPage/Trainings';
import Maintenances from "./pages/MaintenancePage/Maintenances";

axios.defaults.withCredentials=true;

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="d-flex flex-column min-vh-100">
                <MenuBar />
                <main className="flex-grow-1">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/user/details" element={<UserDetails />} />

                        {/* Protected Routes */}
                        <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Customers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customers"
                            element={
                                <ProtectedRoute>
                                    <Customers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clients/:clientId/devices"
                            element={
                                <ProtectedRoute>
                                    <ClientDevices />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tickets"
                            element={
                                <ProtectedRoute>
                                    <Tickets />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/add-client-worker"
                            element={
                                <ProtectedRoute>
                                    <AddClientWorker />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/devices"
                            element={
                                <ProtectedRoute>
                                    <Devices />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/linkeddevices"
                            element={<ViewLinkedDevices />
                        }
                        />
                        <Route
                            path="/maintenances"
                            element={<Maintenances />
                            }
                        />
                        <Route
                            path="/device/:deviceId"
                            element={
                                <ProtectedRoute>
                                    <OneDevice />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/add-client-device"
                            element={
                                <ProtectedRoute>
                                    <AddClientDevice />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/software/:softwareId"
                            element={
                                <ProtectedRoute>
                                    <SoftwareDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/:clientId"
                            element={
                                <ProtectedRoute>
                                    <OneClient />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wiki"
                            element={
                                <ProtectedRoute>
                                    <Wiki />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wiki/:wikiId"
                            element={
                                <ProtectedRoute>
                                    <WikiDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/view-bait-workers"
                            element={
                                <ProtectedRoute>
                                    <ViewBaitWorkers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/locations"
                            element={
                                <ProtectedRoute>
                                    <ViewLocations />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/device-classificators"
                            element={
                                <ProtectedRoute>
                                    <ViewDeviceClassificators />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/ticket-status-classificators"
                            element={
                                <ProtectedRoute>
                                    <ViewTicketStatusClassificators />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/third-party-its"
                            element={
                                <ProtectedRoute>
                                    <ViewThirdPartyITs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/linked-devices"
                            element={
                                <ProtectedRoute>
                                    <ViewLinkedDevices />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/client-worker-roles"
                            element={
                                <ProtectedRoute>
                                    <ViewClientWorkerRoles />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/software"
                            element={
                                <ProtectedRoute>
                                    <ViewSoftware />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/files"
                            element={
                                <ProtectedRoute>
                                    <ViewFiles />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/work-types"
                            element={
                                <ProtectedRoute>
                                    <ViewWorkTypes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/client/edit/:clientId"
                            element={
                                <ProtectedRoute>
                                    <EditClient />
                                </ProtectedRoute>
                            }
                        />
                        {/*<Route*/}
                        {/*    path="/edit-bait-worker/:baitWorkerId"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <EditBaitWorker />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/edit-location/:locationId"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <EditLocation />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/settings/device-classificators/edit/:classificatorId"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <EditDeviceClassificator />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/settings/ticket-status-classificators/edit/:id"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <EditTicketStatusClassificator />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        <Route
                            path="/device/edit/:deviceId"
                            element={
                                <ProtectedRoute>
                                    <EditDevice />
                                </ProtectedRoute>
                            }
                        />
                        {/*<Route*/}
                        {/*    path="/settings/third-party-its/edit/:id"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <EditThirdPartyIT />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}
                        <Route
                            path="/settings/linked-devices/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditLinkedDevice />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/client-worker-roles/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditClientWorkerRole />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/software/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditSoftware />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/work-types/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditWorkType />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <ProtectedRoute>
                                    <HistoryTable />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/contacts"
                            element={
                                <ProtectedRoute>
                                    <Contacts />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tickets/:ticketId"
                            element={
                                <ProtectedRoute>
                                    <Tickets />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/predefined-device-names"
                            element={
                                <ProtectedRoute>
                                    <ViewPredefinedDeviceNames />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/:clientId/ticket/:ticketId"
                            element={
                                <ProtectedRoute>
                                    <OneClient />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/device/:deviceId/ticket/:ticketId"
                            element={
                                <ProtectedRoute>
                                    <OneDevice />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
