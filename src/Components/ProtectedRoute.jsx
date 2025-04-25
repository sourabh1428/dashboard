import { Navigate } from 'react-router-dom';

/**
 * A wrapper component for routes that should only be accessible to authenticated users.
 * It checks for a valid token in localStorage and redirects to the login page if not found.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login page if no token is found
    return <Navigate to="/signin" />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 