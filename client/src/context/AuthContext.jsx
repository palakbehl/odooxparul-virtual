// ==========================================
// Auth Context - Traveloop
// ==========================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('traveloop_token');
    const savedUser = localStorage.getItem('traveloop_user');

    if (token && savedUser) {
      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('traveloop_user', JSON.stringify(data.user));
        }
      } catch (err) {
        // Token expired or invalid
        localStorage.removeItem('traveloop_token');
        localStorage.removeItem('traveloop_user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    if (data.success) {
      localStorage.setItem('traveloop_token', data.token);
      localStorage.setItem('traveloop_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    if (data.success) {
      localStorage.setItem('traveloop_token', data.token);
      localStorage.setItem('traveloop_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('traveloop_token');
    localStorage.removeItem('traveloop_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('traveloop_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
