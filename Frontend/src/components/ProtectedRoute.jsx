import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Handling route protection based on login status and user roles
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('authUser') || '{}');
  
  if (!token) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user.role?.toLowerCase() === role.toLowerCase())) {
    // User role not authorized for this section
    // Redirect to their respective dashboard if they are logged in but in the wrong place
    if (user.role?.toLowerCase() === 'admin') return <Navigate to="/admin" replace />;
    if (user.role?.toLowerCase() === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
