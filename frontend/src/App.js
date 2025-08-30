import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/Home'; // Make sure the filename is Home.jsx
import Login from './components/Login';
import SellerDashboard from './components/SellerDashboard';
import Products from './components/Products';
import Cart from './components/Cart'; // Add this import
import Wishlist from './components/Wishlist'; // Add this import
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // This hook runs only once when the app loads
  // It checks localStorage to see if the user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      
      if (token && storedUserType) {
        setIsAuthenticated(true);
        setUserType(storedUserType);
      }
      setLoading(false); // Stop loading once the check is complete
    };

    checkAuth();
  }, []);

  // Show a loading message while the initial authentication check is running
  if (loading) {
    return <div>Loading Application...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home Route */}
          {/* This is the main change: pass auth state and setters down as props */}
          <Route 
            path="/" 
            element={
              <HomePage 
                isAuthenticated={isAuthenticated} 
                userType={userType} 
                setIsAuthenticated={setIsAuthenticated}
                setUserType={setUserType}
              />
            } 
          />
          
          {/* Login Route */}
          {/* If the user is already authenticated, redirect them away from the login page */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to={userType === 'seller' ? '/seller-dashboard' : '/'} replace /> : 
                <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
            } 
          />
          
          {/* Seller Dashboard (Protected Route) */}
          {/* This route is only accessible if the user is an authenticated seller */}
          <Route 
            path="/seller-dashboard" 
            element={
              isAuthenticated && userType === 'seller' ? 
                <SellerDashboard setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Public Routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} /> {/* Add this route */}
          <Route path="/wishlist" element={<Wishlist />} /> {/* Add this route */}
          <Route path="/shop" element={<div>Shop Page - Coming Soon</div>} />
          
          {/* Catch-all route to redirect any unknown paths back to the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
