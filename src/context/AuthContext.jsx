import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('spectr_auth_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('spectr_auth_token', token);
      fetchUser();
    } else {
      localStorage.removeItem('spectr_auth_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.ok) {
        setUser(res.data.user);
        // Sync Pro status
        if (res.data.user.subscriptionStatus === 'PRO') {
          localStorage.setItem('spectr_pro_status', 'true');
          window.dispatchEvent(new Event('proStatusChanged'));
        }
      } else {
        setToken(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/login';
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('spectr_pro_status');
    window.dispatchEvent(new Event('proStatusChanged'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, setToken, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
