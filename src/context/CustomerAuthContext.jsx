import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem('vaagai_customer_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('vaagai_customer_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCustomer(data.user);
          localStorage.setItem('vaagai_customer_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch {
        // Silently preserve offline state if temporary network disruption
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid credentials' };
      }

      setToken(data.token);
      setCustomer(data.user);
      localStorage.setItem('vaagai_customer_token', data.token);
      localStorage.setItem('vaagai_customer_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      setToken(data.token);
      setCustomer(data.user);
      localStorage.setItem('vaagai_customer_token', data.token);
      localStorage.setItem('vaagai_customer_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('vaagai_customer_token');
    localStorage.removeItem('vaagai_customer_user');
  };

  const updateProfile = async (name, phone) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCustomer(data.user);
        localStorage.setItem('vaagai_customer_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Addresses
  const getAddresses = async () => {
    if (!token) return [];
    try {
      const res = await fetch('/api/auth/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.success ? data.addresses : [];
    } catch {
      return [];
    }
  };

  const addAddress = async (addressData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteAddress = async (id) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  };

  // Orders
  const getMyOrders = async () => {
    if (!token) return [];
    try {
      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.success ? data.orders : [];
    } catch {
      return [];
    }
  };

  const cancelOrder = async (orderNumber, reason) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const requestReturn = async (orderNumber, payload) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        loading,
        isAuthenticated: Boolean(customer && token),
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        getAddresses,
        addAddress,
        deleteAddress,
        getMyOrders,
        cancelOrder,
        requestReturn,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
}

