import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protect routes by checking token + role in localStorage.
 * role: "admin" | "seller"
 */
export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Define login and dashboard paths for each role
  const loginPaths = {
    admin: '/admin/login',
    seller: '/seller/login',
    dlp: '/dlp/login',
  };
  const dashboardPaths = {
    admin: '/admin/dashboard',
    seller: '/seller/dashboard',
    dlp: '/dlp/dashboard',
  };

  // If not authenticated, redirect to the login page for the expected role
  if (!token) {
    return <Navigate to={loginPaths[role] || '/admin/login'} replace />;
  }

  // If the user role does not match the required role, redirect to their own dashboard
  if (role && userRole !== role) {
    return <Navigate to={dashboardPaths[userRole] || '/admin/dashboard'} replace />;
  }

  return children;
}