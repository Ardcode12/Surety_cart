// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/Home';
import Login from './components/Login';
import SellerDashboard from './components/SellerDashboard';
import Products from './components/Products';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Orders from './components/Orders';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    if (token && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading Application...</div>;

  return (
    <Router>
      <div className="App">
        <Routes>
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

          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to={userType === 'seller' ? '/seller-dashboard' : '/'} replace />
                : <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
            }
          />

          <Route
            path="/seller-dashboard"
            element={
              isAuthenticated && userType === 'seller'
                ? <SellerDashboard setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />
                : <Navigate to="/login" replace />
            }
          />

          {/* Public routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* NEW: Orders route (customer protected) */}
          <Route
            path="/orders"
            element={
              isAuthenticated && userType === 'customer'
                ? <Orders />
                : <Navigate to="/login" replace />
            }
          />

          <Route path="/shop" element={<div>Shop Page - Coming Soon</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
