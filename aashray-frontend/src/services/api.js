import axios from 'axios';

const API = axios.create({
  baseURL: 'https://aashray-hotel-management-system.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const getMe = () => API.get('/auth/me');
export const logoutUser = () => API.post('/auth/logout');

// Hotel Endpoints
export const fetchAllHotels = (params) => API.get('/hotels', { params });
export const fetchHotelDetails = (id) => API.get(`/hotels/${id}`);

// Booking Endpoints
// export const createNewBooking = (data) => API.post('/bookings', data);
export const fetchMyBookings = () => API.get('/bookings/my-bookings');
export const cancelUserBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const verifyCheckoutCode = (data) => API.post('/bookings/verify-checkout', data);
export const cancelBooking = (bookingId) => API.put(`/bookings/${bookingId}/cancel`);
export const fetchAllAdminBookings = () => API.get('/bookings/admin/all');
export const createRazorpayOrder = (data) => API.post('/bookings/razorpay-order', data);
export const verifyRazorpayPayment = (data) => API.post('/bookings/verify-payment', data);


export const createHotelListing = (data) => API.post('/hotels', data);
export const updateHotelListing = (id, data) => API.put(`/hotels/${id}`, data);
export const deleteHotelListing = (id) => API.delete(`/hotels/${id}`);
export const fetchAdminStats = () => API.get('/hotels/stats/overview');

export const addReview = (hotelId, data) => API.post(`/hotels/${hotelId}/reviews`, data);

// src/services/api.js ke bottom me add karein:
export const fetchAllUsers = () => API.get('/admin/users');
export const updateUserDetails = (id, data) => API.put(`/admin/users/${id}`, data);
export const toggleBlockUser = (id) => API.patch(`/admin/users/${id}/block`);
export const deleteUserAccount = (id) => API.delete(`/admin/users/${id}`);

// src/services/api.js
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// src/services/api.js
export const updateProfile = (data) => API.put('/auth/update-profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);


// src/services/api.js
export const fetchAdminContacts = () => API.get('/contact/admins');
export const broadcastInquiryToAdmins = (data) => API.post('/contact/broadcast', data);

// src/services/api.js
export const askAashrayAI = (data) => API.post('/ai/chat', data);

export default API;