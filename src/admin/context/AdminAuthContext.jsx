import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vaagai_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vaagai_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await adminApi.getMe();
        if (data.success && data.user) {
          setAdminUser(data.user);
          localStorage.setItem('vaagai_admin_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch {
        // If server responded with 401/403
        logout();
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await adminApi.login(email, password);
      if (data.success && data.token) {
        setToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('vaagai_admin_token', data.token);
        localStorage.setItem('vaagai_admin_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to connect to authentication server' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setToken(null);
    localStorage.removeItem('vaagai_admin_token');
    localStorage.removeItem('vaagai_admin_user');
    window.location.hash = '#admin/login';
  };

  const hasRole = (...allowedRoles) => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin' || adminUser.role === 'admin') return true;
    return allowedRoles.includes(adminUser.role);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated: Boolean(adminUser && token),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

