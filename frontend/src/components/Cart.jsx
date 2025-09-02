// frontend/src/components/Cart.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Cart.css';
import {
  ShoppingCart, Trash2, Plus, Minus, Shield,
  ArrowLeft, Tag, Truck, ChevronRight,
  Package, Clock, Award, X
} from 'lucide-react';
import {
  getCart,
  removeFromCart,
  clearCart,
  placeOrderFromCart,
  getFullImageUrl
} from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
    loadCartItems();
  }, []);

  // Lock page scroll when modal open
  useEffect(() => {
    if (showCheckout) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCheckout]);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      const response = await getCart();
      setCartItems(response.data);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeFromCart(productId);
      setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Could not remove item. Please try again.");
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.product._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    // Optional: persist quantity to server if you add a PUT /cart/:productId route
  };

  const applyCoupon = () => {
    if (couponCode === 'SAVE20') {
      setAppliedCoupon({ code: 'SAVE20', discount: 20 });
    } else if (couponCode === 'FIRST50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50 });
    } else {
      alert("Invalid coupon code.");
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const delivery = subtotal > 1000 ? 0 : 99;
  const total = subtotal - discount + delivery;

  const handleCheckout = () => {
    navigate('/orders', { state: { source: 'cart' } });
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);
      // Simulate payment delay
      setTimeout(async () => {
        await placeOrderFromCart({ method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'paid' });
        setProcessing(false);
        setShowCheckout(false);
        setCartItems([]); // Clear UI cart
        alert('Payment successful! Your order has been placed.');
      }, 1200);
    } catch (e) {
      setProcessing(false);
      console.error('Checkout failed:', e);
      alert('Payment failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="cart-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
            <button
              className="clear-cart-btn"
              onClick={async () => {
                try {
                  const resp = await clearCart();
                  // console.log('Clear cart response:', resp.data);
                  await loadCartItems(); // refresh from server
                } catch (e) {
                  console.error('Failed to clear cart:', e?.response?.data || e.message);
                  alert(e?.response?.data?.message || 'Could not clear cart. Please try again.');
                }
              }}
            >
              Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div
                key={item.product._id}
                className="cart-item"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="item-image">
                  <img
                    src={getFullImageUrl(item.product.image)}
                    alt={item.product.name}
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400'; }}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <div className="seller-info">
                    <span>{item.product.seller?.name || 'Surity Seller'}</span>
                    {item.product.seller?.verified && <Shield className="verified-icon" size={14} />}
                  </div>

                  <div className="price-info">
                    <span className="current-price">₹{item.product.price.toLocaleString()}</span>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.product._id)}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  ₹{(item.product.price * item.quantity).toLocaleString()}
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

          <button className="checkout-btn" onClick={handleCheckout}>
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

      {/* Fake Payment Modal (via Portal) */}
      {showCheckout && createPortal(
        <div className="checkout-modal-overlay" onClick={() => !processing && setShowCheckout(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complete Payment</h3>
              <button className="close-modal" onClick={() => !processing && setShowCheckout(false)} disabled={processing}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary-mini">
                <div className="row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {appliedCoupon && (
                  <div className="row"><span>Discount ({appliedCoupon.code})</span><span>-₹{discount.toLocaleString()}</span></div>
                )}
                <div className="row"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                <div className="row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>

              <div className="payment-methods-group">
                <label className={`pay-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    disabled={processing}
                  />
                  <span>Card (Visa/Mastercard)</span>
                </label>
                <label className={`pay-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    disabled={processing}
                  />
                  <span>UPI (GPay/PhonePe)</span>
                </label>
                <label className={`pay-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    disabled={processing}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              <button className="confirm-payment-btn" onClick={handleConfirmPayment} disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Cart;
