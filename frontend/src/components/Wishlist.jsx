import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Wishlist.css';
import { 
  Heart, ShoppingCart, Trash2, ArrowLeft, Star, Shield,
  TrendingUp, Share2, Filter, Grid, List, Clock,
  Package, CheckCircle, X, Info
} from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterPrice, setFilterPrice] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
    loadWishlistItems();
  }, []);

  const loadWishlistItems = () => {
    const sampleWishlist = [
      {
        id: 1,
        title: "Premium Wireless Headphones",
        seller: { name: "TechStore_Official", verified: true },
        price: 2999,
        originalPrice: 4999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        rating: 4.5,
        reviews: 234,
        dateAdded: new Date('2024-01-15'),
        inStock: true,
        isProtected: true,
        isTrending: true
      },
      {
        id: 3,
        title: "Smart Watch Series 6",
        seller: { name: "GadgetZone", verified: true },
        price: 12999,
        originalPrice: 19999,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
        rating: 4.6,
        reviews: 512,
        dateAdded: new Date('2024-01-10'),
        inStock: true,
        isProtected: true
      },
      {
        id: 5,
        title: "Organic Skincare Set",
        seller: { name: "BeautyNature", verified: false },
        price: 1999,
        originalPrice: 2999,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        rating: 4.2,
        reviews: 178,
        dateAdded: new Date('2024-01-20'),
        inStock: false,
        isProtected: true
      }
    ];
    setWishlistItems(sampleWishlist);
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const moveToCart = (item) => {
    // Add to cart logic here
    removeFromWishlist(item.id);
  };

  const moveAllToCart = () => {
    // Add all items to cart logic here
    setWishlistItems([]);
  };

  const shareWishlist = (item) => {
    setSelectedItem(item);
    setShowShareModal(true);
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return b.dateAdded - a.dateAdded;
    }
  });

  const filteredItems = sortedItems.filter(item => {
    if (filterPrice === 'all') return true;
    if (filterPrice === 'under5k') return item.price < 5000;
    if (filterPrice === '5to10k') return item.price >= 5000 && item.price < 10000;
    if (filterPrice === 'above10k') return item.price >= 10000;
    return true;
  });

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="empty-wishlist" data-aos="fade-up">
          <div className="empty-wishlist-content">
            <div className="empty-icon" data-aos="zoom-in" data-aos-delay="100">
              <Heart size={80} />
            </div>
            <h2 data-aos="fade-up" data-aos-delay="200">Your wishlist is empty</h2>
            <p data-aos="fade-up" data-aos-delay="300">Start adding items you love to your wishlist</p>
            <Link to="/products" className="browse-btn" data-aos="fade-up" data-aos-delay="400">
              <ArrowLeft size={18} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Header */}
      <header className="wishlist-header" data-aos="fade-down">
        <div className="header-container">
          <Link to="/products" className="back-link">
            <ArrowLeft />
            <span>Back to Shopping</span>
          </Link>
          <h1 className="wishlist-title">
            <Heart className="heart-filled" />
            My Wishlist ({wishlistItems.length})
          </h1>
          <button className="share-wishlist-btn" onClick={() => setShowShareModal(true)}>
            <Share2 size={18} />
            Share Wishlist
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="wishlist-stats" data-aos="fade-up">
        <div className="stat-card" data-aos="zoom-in" data-aos-delay="100">
          <div className="stat-icon">
            <Package />
          </div>
          <div className="stat-info">
            <span className="stat-value">{wishlistItems.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card" data-aos="zoom-in" data-aos-delay="200">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{wishlistItems.filter(item => item.inStock).length}</span>
            <span className="stat-label">In Stock</span>
          </div>
        </div>
        <div className="stat-card" data-aos="zoom-in" data-aos-delay="300">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              ₹{wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Savings</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="wishlist-toolbar" data-aos="fade-up">
        <div className="toolbar-left">
          <button
            className="move-all-btn"
            onClick={moveAllToCart}
            disabled={wishlistItems.length === 0}
          >
            <ShoppingCart size={16} />
            Move All to Cart
          </button>
        </div>

        <div className="toolbar-right">
          <div className="filter-dropdown">
            <Filter size={16} />
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="under5k">Under ₹5,000</option>
              <option value="5to10k">₹5,000 - ₹10,000</option>
              <option value="above10k">Above ₹10,000</option>
            </select>
          </div>

          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dateAdded">Recently Added</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* FIXED VIEW BUTTONS */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className={`wishlist-container ${viewMode}`}>
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={`wishlist-item ${viewMode} ${!item.inStock ? 'out-of-stock' : ''}`}
            data-aos="fade-up"
            data-aos-delay={index * 50}
          >
            <div className="item-image-container">
              <img src={item.image} alt={item.title} className="item-image" />
              {item.isTrending && (
                <div className="trending-badge">
                  <TrendingUp size={12} />
                  Trending
                </div>
              )}
              {!item.inStock && (
                <div className="stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
              <button
                className="remove-wishlist-btn"
                onClick={() => removeFromWishlist(item.id)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="item-info">
              <div className="seller-row">
                <span className="seller-name">
                  {item.seller.name}
                  {item.seller.verified && <Shield className="verified-badge" size={14} />}
                </span>
                <span className="date-added">
                  Added {Math.floor((new Date() - item.dateAdded) / (1000 * 60 * 60 * 24))} days ago
                </span>
              </div>

              <h3 className="item-title">{item.title}</h3>

              <div className="rating-row">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < Math.floor(item.rating) ? 'filled' : ''}
                      size={14}
                    />
                  ))}
                </div>
                <span className="rating-text">{item.rating} ({item.reviews} reviews)</span>
              </div>

              <div className="price-row">
                <span className="current-price">₹{item.price.toLocaleString()}</span>
                <span className="original-price">₹{item.originalPrice.toLocaleString()}</span>
                <span className="discount">
                  {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                </span>
              </div>

              {item.isProtected && (
                <div className="protection-info">
                  <Shield size={14} />
                  <span>SuretyCard Protected</span>
                  <Info size={14} className="info-icon" />
                </div>
              )}

              <div className="item-actions">
                <button
                  className="move-to-cart-btn"
                  onClick={() => moveToCart(item)}
                  disabled={!item.inStock}
                >
                  <ShoppingCart size={16} />
                  {item.inStock ? 'Move to Cart' : 'Notify Me'}
                </button>
                <button
                  className="share-btn"
                  onClick={() => shareWishlist(item)}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()} data-aos="zoom-in">
            <div className="modal-header">
              <h3>Share {selectedItem ? 'Item' : 'Wishlist'}</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                <X />
              </button>
            </div>
            <div className="modal-body">
              <p>Share your {selectedItem ? 'favorite item' : 'wishlist'} with friends and family</p>
              <div className="share-options">
                <button className="share-option whatsapp">
                  <img src="https://img.icons8.com/color/48/000000/whatsapp.png" alt="WhatsApp" />
                  WhatsApp
                </button>
                <button className="share-option facebook">
                  <img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook" />
                  Facebook
                </button>
                <button className="share-option twitter">
                  <img src="https://img.icons8.com/color/48/000000/twitter.png" alt="Twitter" />
                  Twitter
                </button>
                <button className="share-option copy-link">
                  <img src="https://img.icons8.com/color/48/000000/link.png" alt="Copy Link" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Drop Alert */}
      <div className="price-alert-section" data-aos="fade-up">
        <div className="alert-content">
          <Clock className="alert-icon" />
          <div className="alert-text">
            <h4>Get Price Drop Alerts</h4>
            <p>We'll notify you when prices drop on your wishlist items</p>
          </div>
          <button className="enable-alerts-btn">Enable Alerts</button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
