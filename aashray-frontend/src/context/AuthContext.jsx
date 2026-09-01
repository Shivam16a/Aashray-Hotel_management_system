// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initial state local storage se load karein taaki refresh par flicker na aaye
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // 1. Session Verification Helper
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    // Agar token nahi hai to direct unauthenticated state set karein
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      if (res.data?.isAuthenticated && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        // Invalid session cleanup
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Direct Login State Setter (Login component me direct call karne ke liye)
  const loginStateSync = (userData, token) => {
    if (token) localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  // 3. Complete Logout Cleanup
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Backend error ignore karke local cleanup execute karein
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth, loginStateSync }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);