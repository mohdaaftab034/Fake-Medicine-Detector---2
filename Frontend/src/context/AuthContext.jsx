import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth`;

  useEffect(() => {
    const savedUser = localStorage.getItem('mediguard-user');
    const token = localStorage.getItem('mediguard-token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        setUser(user);
        localStorage.setItem('mediguard-user', JSON.stringify(user));
        localStorage.setItem('mediguard-token', accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (formData) => {
    try {
      // Provide dummy data for required fields that the frontend form doesn't collect
      const submitData = {
        ...formData,
        phone: formData.phone || '0000000000',
        city: formData.city || 'Unknown City',
        state: formData.state || 'Unknown State',
        shopName: formData.shopName || `${formData.name}'s Pharmacy`,
        address: formData.address || '123 Main St',
        pincode: formData.pincode || '000000',
      };
      
      const response = await axios.post(`${API_URL}/register`, submitData);
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        setUser(user);
        localStorage.setItem('mediguard-user', JSON.stringify(user));
        localStorage.setItem('mediguard-token', accessToken);
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (err) {
      console.log('Logout error', err);
    } finally {
      setUser(null);
      localStorage.removeItem('mediguard-user');
      localStorage.removeItem('mediguard-token');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
