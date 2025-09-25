// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../Services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/User/profile')
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/User/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const register = async (name, email, password, role) => {
    const response = await api.post('/User/register', { name, email, password, role });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}