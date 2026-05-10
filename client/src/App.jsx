// ==========================================
// App.jsx - Main Application Router
// ==========================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyTrips from './pages/dashboard/MyTrips';
import CreateTrip from './pages/dashboard/CreateTrip';
import Itinerary from './pages/dashboard/Itinerary';
import Discover from './pages/dashboard/Discover';
import Budget from './pages/dashboard/Budget';
import Checklist from './pages/dashboard/Checklist';
import Profile from './pages/dashboard/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
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
            <Route path="discover" element={<Discover />} />
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
