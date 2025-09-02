// frontend/src/components/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Wishlist.css';
import {
  Heart, ShoppingCart, ArrowLeft, Star, Shield,
  TrendingUp, Share2, Filter, Grid, List, X
} from 'lucide-react';

import { getWishlist, removeFromWishlistApi, addToCart, getFullImageUrl } from '../services/api';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterPrice, setFilterPrice] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [movingAll, setMovingAll] = useState(false); // NEW: for “Move All to Cart” button

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
    loadWishlistItems();
  }, []);

  const loadWishlistItems = async () => {
    setIsLoading(true);
    try {
      const response = await getWishlist();
      const items = (response.data || []).map(item => ({
        ...item,
        dateAdded: item.dateAdded ? new Date(item.dateAdded) : new Date()
      }));
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlistApi(productId);
      setWishlistItems(items => items.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Could not remove item. Please try again.');
    }
  };

  const moveToCart = async (item) => {
    try {
      await addToCart(item._id, 1);
      await removeFromWishlistApi(item._id);
      setWishlistItems(items => items.filter(i => i._id !== item._id));
      alert(`${item.name} moved to cart!`);
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      alert('Please login as a customer to move items to cart.');
    }
  };

  // NEW: Move All to Cart
  const handleMoveAllToCart = async () => {
    if (!wishlistItems.length) return;

    // Optional auth guard
    const userType = localStorage.getItem('userType');
    if (userType !== 'customer') {
      alert('Please login as a customer to move items to cart.');
      return;
    }

    setMovingAll(true);
    try {
      // Add all to cart in parallel
      const results = await Promise.allSettled(
        wishlistItems.map(item => addToCart(item._id, 1))
      );

      // Collect successfully added productIds
      const successIds = results
        .map((res, idx) => (res.status === 'fulfilled' ? wishlistItems[idx]._id : null))
        .filter(Boolean);

      // Remove only those successfully added from wishlist
      await Promise.allSettled(successIds.map(id => removeFromWishlistApi(id)));

      // Update UI
      setWishlistItems(items => items.filter(i => !successIds.includes(i._id)));

      // Summary message
      const successCount = successIds.length;
      const failCount = wishlistItems.length - successCount;
      if (successCount && !failCount) {
        alert('All items moved to cart!');
      } else if (successCount && failCount) {
        alert(`${successCount} items moved to cart. ${failCount} failed.`);
      } else {
        alert('Could not move items to cart.');
      }
    } catch (e) {
      console.error('Move all to cart failed:', e);
      alert('Could not move all items. Please try again.');
    } finally {
      setMovingAll(false);
    }
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      default:
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });

  const filteredItems = sortedItems.filter(item => {
    if (filterPrice === 'all') return true;
    if (filterPrice === 'under5k') return item.price < 5000;
    if (filterPrice === '5to10k') return item.price >= 5000 && item.price < 10000;
    if (filterPrice === 'above10k') return item.price >= 10000;
    return true;
  });

  if (isLoading) {
    return (
      <div className="wishlist-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
      <header className="wishlist-header" data-aos="fade-down">
        <div className="header-container">
          <Link to="/products" className="back-link">
            <ArrowLeft />
            <span>Back to Products</span>
          </Link>
          <h1 className="wishlist-title">
            <Heart className="heart-filled" />
            My Wishlist ({wishlistItems.length})
          </h1>
          <button className="share-wishlist-btn" onClick={() => setShowShareModal(true)}>
            <Share2 size={16} />
            Share
          </button>
        </div>
      </header>

      <div className="wishlist-stats" data-aos="fade-up">
        <div className="stat-card">
          <div className="stat-icon"><Heart /></div>
          <div className="stat-info">
            <span className="stat-value">{wishlistItems.length}</span>
            <span className="stat-label">Items</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-info">
            <span className="stat-value">₹{wishlistItems.reduce((s, i) => s + (i.price || 0), 0).toLocaleString()}</span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
      </div>

      <div className="wishlist-toolbar" data-aos="fade-up">
        <div className="toolbar-left">
          <button
            className="move-all-btn"
            onClick={handleMoveAllToCart}
            disabled={movingAll || wishlistItems.length === 0}
          >
            <ShoppingCart size={16} />
            {movingAll ? ' Moving...' : ' Move All to Cart'}
          </button>
        </div>
        <div className="toolbar-right">
          <div className="filter-dropdown">
            <Filter size={16} />
            <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
              <option value="all">All</option>
              <option value="under5k">Under ₹5,000</option>
              <option value="5to10k">₹5,000 - ₹10,000</option>
              <option value="above10k">Above ₹10,000</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <Grid size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dateAdded">Recently Added</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <Grid size={16} />
            </button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`wishlist-container ${viewMode}`}>
        {filteredItems.map((item, index) => (
          <div
            key={item._id}
            className={`wishlist-item ${viewMode} ${!item.inStock ? 'out-of-stock' : ''}`}
            data-aos="fade-up"
            data-aos-delay={index * 50}
          >
            <div className="item-image-container">
              <img
                src={getFullImageUrl(item.image)}
                alt={item.name}
                className="item-image"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400'; }}
              />
              <button
                className="remove-wishlist-btn"
                onClick={() => handleRemoveFromWishlist(item._id)}
                title="Remove from wishlist"
              >
                <X size={16} />
              </button>
            </div>

            <div className="item-info">
              <div className="seller-row">
                <span className="seller-name">
                  {item.seller?.name || 'Surity Seller'}
                  {item.seller?.verified && <Shield className="verified-badge" size={14} />}
                </span>
                <span className="date-added">
                  Added {Math.floor((Date.now() - new Date(item.dateAdded)) / (1000 * 60 * 60 * 24))} days ago
                </span>
              </div>

              <h3 className="item-title">{item.name}</h3>

              <div className="price-row">
                <span className="current-price">₹{(item.price || 0).toLocaleString()}</span>
              </div>

              <div className="item-actions">
                <button
                  className="move-to-cart-btn"
                  onClick={() => moveToCart(item)}
                  disabled={!item.inStock}
                >
                  <ShoppingCart size={16} />
                  {item.inStock ? 'Move to Cart' : 'Out of Stock'}
                </button>
                <button className="share-btn" onClick={() => { setSelectedItem(item); setShowShareModal(true); }}>
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Wishlist Item</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p>Share: {selectedItem?.name}</p>
              <div className="share-options">
                <button className="share-option whatsapp">WhatsApp</button>
                <button className="share-option facebook">Facebook</button>
                <button className="share-option twitter">Twitter</button>
                <button className="share-option copy-link">Copy Link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
