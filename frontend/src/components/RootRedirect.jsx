import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RootRedirect() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/admin/login" replace />;
  if (role === 'seller') return <Navigate to="/seller/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'dlp') return <Navigate to="/dlp/dashboard" replace />;

  return <Navigate to="/admin/login" replace />;
}