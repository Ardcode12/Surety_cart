import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllProducts } from '../services/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Products.css';
import { 
  Shield, Star, Heart, Filter, ChevronDown, Grid, List, 
  TrendingUp, Clock, Award, Package, Search, ShoppingCart,
  Menu, X, ChevronLeft, ChevronRight, Zap, Tag, ArrowUpDown,
  Home, ShoppingBag, Users, Info, HelpCircle, LogIn, Store,
  CreditCard
} from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const productsPerPage = 12;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
    loadProducts();
  }, []);

  // Sample products data (fallback)
  
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAllProducts();
      if (response && response.data && response.data.length > 0) {
        const formattedProducts = response.data.map(p => ({
          ...p,
          name: p.name || 'Unnamed Product',
          id: p._id || p.id,
          description: p.description || 'No description available',
          discount: p.discount || 0,

          isProtected: p.isProtected !== undefined ? p.isProtected : true,
          seller: p.seller || { name: "Unknown Seller", socialId: "@unknown", verified: false, rating: 0 }
        }));
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } 
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Fallback to sample products
      
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and Sort functions
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.seller?.name && p.seller.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch(sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle price range change
  const handlePriceRangeChange = (value, type) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceRange([Math.min(numValue, priceRange[1]), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(numValue, priceRange[0])]);
    }
  };

  const handleBuyNow = (product) => {
    navigate(`/checkout/${product.id}`);
  };

  const handleAddToCart = (product) => {
    // Optionally add to cart logic here
    navigate('/cart');
  };

  const handleWishlist = (productId) => {
    // Optionally add to wishlist logic here
    navigate('/wishlist');
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && !event.target.closest('.sidebar-nav') && !event.target.closest('.menu-toggle-btn')) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🛍' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'fashion', label: 'Fashion', icon: '👕' },
    { value: 'beauty', label: 'Beauty', icon: '💄' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
  ];

  return (
    <div className="all-products-page">
      {/* Sidebar Navigation */}
      <nav className={`sidebar-nav ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <ShoppingBag className="logo-icon" />
            <h2>InstaMarket</h2>
          </div>
          <button className="close-sidebar" onClick={() => setShowSidebar(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="nav-menu">
          <Link to="/" className="nav-item" onClick={() => setShowSidebar(false)}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          
          <Link to="/products" className="nav-item active" onClick={() => setShowSidebar(false)}>
            <ShoppingBag size={20} />
            <span>Products</span>
          </Link>
          
          <Link to="/community-cart" className="nav-item" onClick={() => setShowSidebar(false)}>
            <Users size={20} />
            <span>Community Cart</span>
          </Link>
          
          <Link to="/seller-dashboard" className="nav-item" onClick={() => setShowSidebar(false)}>
            <Store size={20} />
            <span>Seller Hub</span>
          </Link>
          
          <Link to="/about" className="nav-item" onClick={() => setShowSidebar(false)}>
            <Info size={20} />
            <span>About Us</span>
          </Link>
          
          <Link to="/why-trust" className="nav-item" onClick={() => setShowSidebar(false)}>
            <HelpCircle size={20} />
            <span>Why Trust Us</span>
          </Link>
        </div>
        
        <div className="nav-actions">
          <Link to="/login" className="nav-button login-btn" onClick={() => setShowSidebar(false)}>
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        </div>
      </nav>

      {/* Overlay */}
      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}

      {/* Header */}
      <header className="header" data-aos="fade-down">
        <div className="header-container">
          <button className="menu-toggle-btn" onClick={() => setShowSidebar(true)}>
            <Menu size={24} />
          </button>

          <div className="logo-section">
            <Shield className="logo-icon" />
            <h1 className="logo-text">InstaMarket</h1>
          </div>
          
          <div className="search-bar">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <Link to="/wishlist" className="icon-btn">
              <Heart />
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="icon-btn">
              <ShoppingCart />
              <span className="badge">3</span>
            </Link>
          </div>

          <button className="mobile-menu-btn" onClick={() => setShowMobileFilter(!showMobileFilter)}>
            <Filter />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner" data-aos="fade">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">
              <Zap className="zap-icon" />
              Flash Sale Live Now!
            </h2>
            <p className="banner-subtitle">Up to 70% OFF on verified sellers</p>
            <div className="banner-timer">
              <Clock className="timer-icon" />
              <span>Ends in: 23:59:45</span>
            </div>
          </div>
          <div className="banner-badges">
            <div className="trust-badge">
              <Shield />
              <span>100% Protected</span>
            </div>
            <div className="trust-badge">
              <Award />
              <span>Verified Sellers</span>
            </div>
            <div className="trust-badge">
              <Package />
              <span>Safe Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="categories-bar" data-aos="fade-up">
        <div className="categories-container">
          {categories.map((cat, index) => (
            <button
              key={cat.value}
              className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
              data-aos="zoom-in"
              data-aos-delay={index * 50}
            >
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="main-content">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showMobileFilter ? 'show' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="close-filter" onClick={() => setShowMobileFilter(false)}>
              <X />
            </button>
          </div>

          <div className="filter-section" data-aos="fade-right">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(e.target.value, 'min')}
                min="0"
                max={priceRange[1]}
              />
              <span>to</span>
              <input 
                type="number" 
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(e.target.value, 'max')}
                min={priceRange[0]}
                max="50000"
              />
            </div>
            <input 
              type="range" 
              min="0" 
              max="50000" 
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="price-slider"
            />
            <div className="price-range-display">
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </div>
          </div>

          <div className="filter-section" data-aos="fade-right" data-aos-delay="100">
            <h4>Seller Rating</h4>
            <div className="rating-filters">
              {[4, 3, 2].map(rating => (
                <label key={rating} className="checkbox-label">
                  <input type="checkbox" />
                  <div className="stars-filter">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={i < rating ? 'filled' : ''} size={16} />
                    ))}
                  </div>
                  <span>& above</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section" data-aos="fade-right" data-aos-delay="200">
            <h4>Special Offers</h4>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Verified Sellers Only</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Trending Now</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>New Arrivals</span>
            </label>
          </div>
        </aside>

        {/* Products Section */}
        <section className="products-section">
          {/* Toolbar */}
          <div className="toolbar" data-aos="fade-up">
            <div className="results-info">
              <h2>All Products</h2>
              <span>{filteredProducts.length} results found</span>
            </div>
            
            <div className="toolbar-actions">
              <div className="sort-dropdown">
                <ArrowUpDown size={18} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popularity">Popularity</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              
              <div className="view-modes">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            /* Products Grid/List */
            <div className={`products-container ${viewMode}`}>
              {currentProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`product-card ${viewMode}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  {/* Product Image */}
                  <div className="product-image-container">
                    <img 
                      src={product.image || 'https://via.placeholder.com/400'} 
                      alt={product.name} 
                      className="product-image" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                    />
                    <button 
                      className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">₹{product.price.toLocaleString()}</p>
                    <p className="seller-name">
                      Sold by: {product.seller?.name || 'Unknown Seller'}
                    </p>

                    {/* Product Actions */}
                    <div className="product-actions">
                      <button 
                        className="buy-now-btn"
                        onClick={() => handleBuyNow(product)}
                      >
                        Buy Now
                      </button>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="empty-state">
              <Package size={64} />
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" data-aos="fade-up">
              <button 
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filter Button */}
      <button className="mobile-filter-btn" onClick={() => setShowMobileFilter(true)}>
        <Filter />
        Filters
      </button>
    </div>
  );
};

export default Products;
