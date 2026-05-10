// ==========================================
// API Service - Traveloop
// ==========================================

import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('traveloop_token');
      localStorage.removeItem('traveloop_user');
      // Only redirect if not already on public pages
      if (!['/login', '/register', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Trip API calls
export const tripAPI = {
  getAll: (params) => API.get('/trips', { params }),
  getOne: (id) => API.get(`/trips/${id}`),
  create: (data) => API.post('/trips', data),
  update: (id, data) => API.put(`/trips/${id}`, data),
  delete: (id) => API.delete(`/trips/${id}`),
  getDashboardStats: () => API.get('/trips/stats/dashboard'),
};

// Destination API calls
export const destinationAPI = {
  getAll: (params) => API.get('/destinations', { params }),
  getFeatured: () => API.get('/destinations/featured'),
  getOne: (id) => API.get(`/destinations/${id}`),
  seed: () => API.post('/destinations/seed'),
};

// Itinerary API calls
export const itineraryAPI = {
  add: (data) => API.post('/itinerary/add', data),
  getByTrip: (tripId) => API.get(`/itinerary/trip/${tripId}`),
  update: (id, data) => API.put(`/itinerary/update/${id}`, data),
  delete: (id) => API.delete(`/itinerary/delete/${id}`),
  reorder: (data) => API.put('/itinerary/reorder', data),
};

// Places API calls (Outscraper proxy)
export const placesAPI = {
  search: (q) => API.get('/places/search', { params: { q } }),
  attractions: (destination, category) => API.get('/places/attractions', { params: { destination, category } }),
  suggestions: (category) => API.get('/places/suggestions', { params: { category } }),
};

export default API;

