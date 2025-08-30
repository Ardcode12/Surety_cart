import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Cart.css';
import {
  ShoppingCart, Trash2, Plus, Minus, Shield,
  ArrowLeft, Tag, Truck, ChevronRight,
  Package, Clock, Award, Heart, X
} from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const sampleCart = [
      {
        id: 1,
        title: "Premium Wireless Headphones",
        seller: { name: "TechStore_Official", verified: true },
        price: 2999,
        originalPrice: 4999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: 1,
        isProtected: true
      },
      {
        id: 2,
        title: "Designer Leather Handbag",
        seller: { name: "FashionHub", verified: true },
        price: 3499,
        originalPrice: 6999,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
        quantity: 2,
        isProtected: true
      }
    ];
    setCartItems(sampleCart);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const moveToWishlist = (item) => {
    removeItem(item.id);
  };

  const applyCoupon = () => {
    if (couponCode === 'SAVE20') {
      setAppliedCoupon({ code: 'SAVE20', discount: 20 });
    } else if (couponCode === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 });
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const delivery = subtotal > 1000 ? 0 : 99;
  const total = subtotal - discount + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart" data-aos="fade-up">
          <div className="empty-cart-content">
            <div className="empty-cart-icon" data-aos="zoom-in" data-aos-delay="100">
              <ShoppingCart size={80} />
            </div>
            <h2 data-aos="fade-up" data-aos-delay="200">Your cart is empty</h2>
            <p data-aos="fade-up" data-aos-delay="300">Looks like you haven't added anything to your cart yet</p>
            <Link to="/products" className="continue-shopping-btn" data-aos="fade-up" data-aos-delay="400">
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="cart-header" data-aos="fade-down">
        <div className="header-container">
          <Link to="/products" className="back-link">
            <ArrowLeft />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="cart-title">
            <ShoppingCart />
            Shopping Cart ({cartItems.length})
          </h1>
        </div>
      </header>

      {/* Trust Badges */}
      <div className="trust-badges" data-aos="fade-up">
        <div className="trust-badge" data-aos="zoom-in" data-aos-delay="100">
          <Shield className="badge-icon" />
          <span>100% Secure Payment</span>
        </div>
        <div className="trust-badge" data-aos="zoom-in" data-aos-delay="200">
          <Truck className="badge-icon" />
          <span>Free Delivery Above ₹1000</span>
        </div>
        <div className="trust-badge" data-aos="zoom-in" data-aos-delay="300">
          <Award className="badge-icon" />
          <span>Genuine Products</span>
        </div>
      </div>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="section-header" data-aos="fade-right">
            <h2>Cart Items</h2>
            <button className="clear-cart-btn" onClick={() => setCartItems([])}>
              Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="cart-item"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                  {item.isProtected && (
                    <div className="protection-badge">
                      <Shield size={12} />
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.title}</h3>
                  <div className="seller-info">
                    <span>{item.seller.name}</span>
                    {item.seller.verified && <Shield className="verified-icon" size={14} />}
                  </div>

                  <div className="price-info">
                    <span className="current-price">₹{item.price.toLocaleString()}</span>
                    <span className="original-price">₹{item.originalPrice.toLocaleString()}</span>
                    <span className="discount">{Math.round((1 - item.price / item.originalPrice) * 100)}% OFF</span>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>

                    <button className="move-to-wishlist" onClick={() => moveToWishlist(item)}>
                      <Heart size={16} />
                      Move to Wishlist
                    </button>

                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="coupon-section" data-aos="fade-up">
            <div className="coupon-header" onClick={() => setShowCouponInput(!showCouponInput)}>
              <div className="coupon-title">
                <Tag className="coupon-icon" />
                <span>Apply Coupon</span>
              </div>
              <ChevronRight className={`expand-icon ${showCouponInput ? 'expanded' : ''}`} />
            </div>

            {showCouponInput && (
              <div className="coupon-input-wrapper" data-aos="fade-down">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="coupon-input"
                />
                <button
                  className="apply-coupon-btn"
                  onClick={applyCoupon}
                  disabled={!couponCode}
                >
                  Apply
                </button>
              </div>
            )}

            {appliedCoupon && (
              <div className="applied-coupon" data-aos="fade-in">
                <span className="coupon-code">{appliedCoupon.code}</span>
                <span className="coupon-discount">-{appliedCoupon.discount}% Applied</span>
                <button
                  className="remove-coupon"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="available-coupons">
              <p className="coupons-title">Available Coupons:</p>
              <div className="coupon-list">
                <div className="coupon-item" onClick={() => setCouponCode('SAVE20')}>
                  <span className="code">SAVE20</span>
                  <span className="desc">20% off on all items</span>
                </div>
                <div className="coupon-item" onClick={() => setCouponCode('FIRST50')}>
                  <span className="code">FIRST50</span>
                  <span className="desc">50% off on first order</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary" data-aos="fade-left">
          <h2>Order Summary</h2>

          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            {appliedCoupon && (
              <div className="summary-row discount-row">
                <span>Discount ({appliedCoupon.code})</span>
                <span className="discount-amount">-₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className={delivery === 0 ? 'free-delivery' : ''}>
                {delivery === 0 ? 'FREE' : `₹${delivery}`}
              </span>
            </div>

            <div className="summary-total">
              <span>Total Amount</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="delivery-info">
            <Clock size={16} />
            <span>Estimated delivery in 3-5 business days</span>
          </div>

          <button className="checkout-btn">
            <Package size={18} />
            Proceed to Checkout
          </button>

          <div className="payment-methods">
            <p>We accept</p>
            <div className="payment-icons">
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
              <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
              <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="Rupay" />
              <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
