// ==========================================
// Protected Admin Route Component - Traveloop
// Requires authentication + admin role
// ==========================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/25 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
