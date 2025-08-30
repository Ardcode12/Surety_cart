import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './home.css';

const HomePage = ({ isAuthenticated, userType, setIsAuthenticated, setUserType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple category rotation
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.premium-sidebar') && !event.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserType(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Instant connections with verified sellers', color: '#FF6B6B' },
    { icon: '🛡️', title: 'Ultra Secure', desc: 'Bank-level encryption for all transactions', color: '#4ECDC4' },
    { icon: '🌟', title: 'Premium Quality', desc: 'Curated selection of top-rated sellers', color: '#45B7D1' },
    { icon: '🚀', title: 'Future Ready', desc: 'AI-powered recommendations & insights', color: '#96CEB4' }
  ];

  const categories = [
    { name: 'Luxury Fashion', icon: '💎', count: '5.2K', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Tech & Gadgets', icon: '📱', count: '3.8K', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Artisan Beauty', icon: '✨', count: '4.1K', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Home Luxe', icon: '🏛️', count: '2.9K', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { name: 'Gourmet Food', icon: '🍷', count: '1.7K', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Rare Finds', icon: '🎭', count: '980', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
  ];

  return (
    <div className="premium-homepage">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      {/* Header Bar */}
      <header className="homepage-header">
        <div className="header-container">
          <button className="menu-toggle" onClick={toggleMenu}>
            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className="header-logo">
            <span className="logo-icon">⚡</span>
            <h1 className="logo-text">InstaMarket</h1>
          </div>

          <div className="header-actions">
            {isAuthenticated ? (
              <button className="header-logout-btn" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" className="header-login-btn">
                <span className="login-icon">🔑</span>
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={toggleMenu} />}

      {/* Premium Sidebar */}
      <nav className={`premium-sidebar ${isMenuOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🛍️</span>
            <h2>InstaMarket</h2>
          </div>
          <button className="close-sidebar" onClick={toggleMenu}>
            <span className="close-icon">✕</span>
          </button>
        </div>

        <div className="nav-menu">
          <Link to="/" className="nav-item active" onClick={toggleMenu}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          
          <Link to="/products" className="nav-item" onClick={toggleMenu}>
            <span className="nav-icon">🛍️</span>
            <span>Products</span>
          </Link>
          
          <Link to="/community-cart" className="nav-item" onClick={toggleMenu}>
            <span className="nav-icon">👥</span>
            <span>Community Cart</span>
          </Link>
          
          <Link to="/seller-dashboard" className="nav-item" onClick={toggleMenu}>
            <span className="nav-icon">🏪</span>
            <span>Seller Hub</span>
          </Link>
          
          <a href="#about" className="nav-item" onClick={toggleMenu}>
            <span className="nav-icon">ℹ️</span>
            <span>About Us</span>
          </a>
          
          <a href="#trust" className="nav-item" onClick={toggleMenu}>
            <span className="nav-icon">🤝</span>
            <span>Why Trust Us</span>
          </a>
        </div>

        <div className="nav-actions">
          {!isAuthenticated && (
            <Link to="/login" state={{ defaultTab: 'signup', userType: 'seller' }} className="nav-button signup-btn" onClick={toggleMenu}>
              <span className="nav-icon">🚀</span>
              <span>Start Selling</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">Premium Marketplace</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">
                <span className="title-word">Discover</span>
                <span className="title-word gradient-text">Authentic</span>
              </span>
              <span className="title-line">
                <span className="title-word">Instagram</span>
                <span className="title-word">Sellers</span>
              </span>
            </h1>
            <p className="hero-description">
              Experience the future of social commerce with our curated marketplace 
              of verified Instagram businesses. Shop with confidence, style, and security.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="primary-button">
                <span className="button-text">Start Shopping</span>
                <span className="button-icon">→</span>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" state={{ defaultTab: 'signup', userType: 'seller' }} className="secondary-button">
                  <span className="button-text">Become a Seller</span>
                  <span className="button-icon">💼</span>
                </Link>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">15K+</span>
                <span className="stat-label">Verified Sellers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2.5M+</span>
                <span className="stat-label">Products Listed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="floating-card card-1">
                <div className="card-placeholder fashion">
                  <span><img src="/images/mens-formal-suits-980.jpg" alt="" /></span>
                  <p>Fashion</p>
                </div>
              </div>
              <div className="floating-card card-2">
                <div className="card-placeholder tech">
                  <span><img src="https://images.stockcake.com/public/5/3/d/53d9e0ea-efac-4aee-b4b1-a506af6d8b23_large/tech-gadget-assortment-stockcake.jpg" alt="" /></span>
                  <p>Tech</p>
                </div>
              </div>
              <div className="floating-card card-3">
                <div className="card-placeholder beauty">
                  <span><img src="https://media.post.rvohealth.io/wp-content/uploads/2020/08/beauty-skin-care-cosmetics_thumb-1-732x549.jpg" alt="" /></span>
                  <p>Beauty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your sections remain the same */}
      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose InstaMarket Premium</h2>
            <p className="section-subtitle">Advanced features designed for the modern shopper</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ '--feature-color': feature.color }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
                <div className="feature-bg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="categories-section" id="categories">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Explore Premium Categories</h2>
            <p className="section-subtitle">Curated collections from top Instagram sellers</p>
          </div>
          <div className="categories-showcase">
            <div className="categories-carousel">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className={`category-item ${activeCategory === index ? 'active' : ''}`}
                  onClick={() => setActiveCategory(index)}
                  style={{ '--category-gradient': category.gradient }}
                >
                  <div className="category-content">
                    <span className="category-icon">{category.icon}</span>
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-count">{category.count} Sellers</p>
                  </div>
                  <div className="category-bg"></div>
                </div>
              ))}
            </div>
            <div className="category-preview">
              <div className="preview-content">
                <h3>{categories[activeCategory].name}</h3>
                <p>Discover {categories[activeCategory].count} verified sellers offering premium {categories[activeCategory].name.toLowerCase()} products.</p>
                <Link to="/products" className="explore-link">
                  Explore Collection <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About InstaMarket</h2>
            <p className="section-subtitle">Bridging the gap between Instagram sellers and buyers</p>
          </div>
          <div className="about-content">
            <p>InstaMarket was born from a simple idea: making it easier and safer to buy from Instagram sellers. We noticed how challenging it was for buyers to trust unknown sellers and for genuine sellers to reach customers beyond their followers.</p>
            <p>Our platform brings together the creativity and uniqueness of Instagram businesses with the security and convenience of established e-commerce. Every seller is verified, every transaction is protected, and every review is genuine.</p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section" id="trust">
        <div className="section-container">
          <div className="trust-content">
            <div className="trust-header">
              <h2 className="section-title">Enterprise-Grade Security</h2>
              <p className="section-subtitle">Your safety is our top priority</p>
            </div>
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon">🔐</div>
                <h4>256-bit Encryption</h4>
                <p>Military-grade security for all transactions</p>
              </div>
              <div className="trust-item">
                <div className="trust-icon">✅</div>
                <h4>Verified Sellers</h4>
                <p>Multi-step verification process</p>
              </div>
              <div className="trust-item">
                <div className="trust-icon">💰</div>
                <h4>Money-Back Guarantee</h4>
                <p>100% refund for undelivered items</p>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🤝</div>
                <h4>24/7 Support</h4>
                <p>Premium customer service always available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Experience Premium Shopping?</h2>
            <p className="cta-subtitle">Join thousands of satisfied customers today</p>
            <div className="cta-actions">
              <Link to="/products" className="cta-button primary">
                <span>Browse Products</span>
                <span className="button-shimmer"></span>
              </Link>
              <Link to="/login" state={{ defaultTab: 'signup' }} className="cta-button secondary">
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
