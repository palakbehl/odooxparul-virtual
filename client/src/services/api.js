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

// Places API calls (OpenTripMap)
export const placesAPI = {
  search: (q, params = {}) => API.get('/places/search', { params: { q, ...params } }),
  geoname: (name) => API.get('/places/geoname', { params: { name } }),
  radius: (lat, lon, params = {}) => API.get('/places/radius', { params: { lat, lon, ...params } }),
  autosuggest: (name, params = {}) => API.get('/places/autosuggest', { params: { name, ...params } }),
  details: (xid) => API.get(`/places/details/${xid}`),
  batchDetails: (xids) => API.post('/places/batch-details', { xids }),
  suggestions: (category) => API.get('/places/suggestions', { params: { category } }),
  attractions: (destination, category) => API.get('/places/attractions', { params: { destination, category } }),
};

// Admin API calls
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getTrips: (params) => API.get('/admin/trips', { params }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
};

// Stop API calls
export const stopAPI = {
  add: (data) => API.post('/stops/add', data),
  getByTrip: (tripId) => API.get(`/stops/trip/${tripId}`),
  update: (id, data) => API.put(`/stops/${id}`, data),
  delete: (id) => API.delete(`/stops/${id}`),
};

// DayPlan API calls
export const dayPlanAPI = {
  getByTrip: (tripId) => API.get(`/dayplans/trip/${tripId}`),
  getByStop: (stopId) => API.get(`/dayplans/stop/${stopId}`),
  update: (id, data) => API.put(`/dayplans/${id}`, data),
};

// Activity API calls
export const activityAPI = {
  add: (data) => API.post('/activities/add', data),
  getByDay: (dayPlanId) => API.get(`/activities/day/${dayPlanId}`),
  update: (id, data) => API.put(`/activities/${id}`, data),
  delete: (id) => API.delete(`/activities/${id}`),
  reorder: (data) => API.put('/activities/reorder/batch', data),
};

// Expense API calls
export const expenseAPI = {
  add: (data) => API.post('/expenses/add', data),
  getByTrip: (tripId) => API.get(`/expenses/trip/${tripId}`),
  getBudget: (tripId) => API.get(`/expenses/budget/${tripId}`),
  delete: (id) => API.delete(`/expenses/${id}`),
};

// Community API calls
export const communityAPI = {
  getFeed: (params) => API.get('/community/feed', { params }),
  createPost: (data) => API.post('/community/create', data),
  likePost: (id) => API.put(`/community/${id}/like`),
  comment: (id, content) => API.post(`/community/${id}/comment`, { content }),
  savePost: (id) => API.put(`/community/${id}/save`),
  deletePost: (id) => API.delete(`/community/${id}`),
};

// Invoice API calls
export const invoiceAPI = {
  create: (data) => API.post('/invoices/create', data),
  getByTrip: (tripId) => API.get(`/invoices/trip/${tripId}`),
  markPaid: (id) => API.put(`/invoices/${id}/paid`),
  delete: (id) => API.delete(`/invoices/${id}`),
};

// Notes API calls
export const noteAPI = {
  add: (data) => API.post('/notes/add', data),
  getByTrip: (tripId) => API.get(`/notes/trip/${tripId}`),
  update: (id, data) => API.put(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`),
};

export default API;
