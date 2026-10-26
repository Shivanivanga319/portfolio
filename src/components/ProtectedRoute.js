import React from 'react';

/**
 * ProtectedRoute Component
 * NOTE: Login requirement is temporarily bypassed as requested.
 * When you are ready to re-attach login authentication later, 
 * you can restore the token verification check.
 */
const ProtectedRoute = ({ children }) => {
  // Direct access without login
  return children;
};

export default ProtectedRoute;
