// ==========================================
// App.jsx - Main Application Router
// ==========================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyTrips from './pages/dashboard/MyTrips';
import CreateTrip from './pages/dashboard/CreateTrip';
import Itinerary from './pages/dashboard/Itinerary';
import DayTimeline from './pages/dashboard/DayTimeline';
import Discover from './pages/dashboard/Discover';
import Community from './pages/dashboard/Community';
import Budget from './pages/dashboard/Budget';
import Checklist from './pages/dashboard/Checklist';
import Invoices from './pages/dashboard/Invoices';
import Notes from './pages/dashboard/Notes';
import Profile from './pages/dashboard/Profile';
import AdminHome from './pages/admin/AdminHome';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes (Regular Users) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="trips" element={<MyTrips />} />
            <Route path="trips/new" element={<CreateTrip />} />
            <Route path="trips/:id" element={<MyTrips />} />
            <Route path="itinerary" element={<Itinerary />} />
            <Route path="itinerary/:tripId" element={<Itinerary />} />
            <Route path="timeline/:tripId" element={<DayTimeline />} />
            <Route path="discover" element={<Discover />} />
            <Route path="community" element={<Community />} />
            <Route path="budget" element={<Budget />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes/:tripId" element={<Notes />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="activities" element={<Discover />} />
            <Route path="analytics" element={<AdminHome />} />
            <Route path="budget" element={<Budget />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
