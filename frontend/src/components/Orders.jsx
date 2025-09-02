// frontend/src/components/Orders.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {  useNavigate } from 'react-router-dom'; 
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Orders.css';
import {
  ShoppingBag, Package, CheckCircle2, Clock, Truck, CreditCard, MapPin, ArrowRight,
  ShoppingCart, Loader2, Shield, IndianRupee, AlertCircle, Calendar, User, Phone,
  Home, Building, Navigation, CheckCircle, XCircle, RefreshCw, Sparkles, Zap,
  Star, TrendingUp, Award, Gift, Crown
} from 'lucide-react';
// add cancelMyOrder import
import { placeOrderFromCart, placeDirectOrder, getMyOrders, cancelMyOrder, getFullImageUrl } from '../services/api';
 

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilled = location.state?.product || null;

  const [activeTab, setActiveTab] = useState(prefilled ? 'checkout' : 'orders');
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addressFocused, setAddressFocused] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  useEffect(() => {
    AOS.init({ 
      duration: 1000, 
      once: true, 
      easing: 'ease-out-cubic',
      offset: 50 
    });
    loadOrders();
  }, []);

  // Open the correct tab based on where we navigated from
  useEffect(() => {
    const src = location.state?.source;
    if (src === 'cart') {
      setActiveTab('cart');
    } else if (prefilled) {
      setActiveTab('checkout');
    } else {
      setActiveTab('orders');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, prefilled]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const resp = await getMyOrders();
      setOrders(resp.data || []);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };
  // identify cancellable statuses
const canCancel = (order) => {
  const st = (order.status || '').toLowerCase();
  return ['pending', 'confirmed', 'processing'].includes(st);
};

const [cancellingId, setCancellingId] = useState(null);

const onCancelOrder = async (orderId) => {
  if (!window.confirm("Are you sure you want to cancel this order?")) return;
  setCancellingId(orderId);
  try {
    const resp = await cancelMyOrder(orderId);
    // Update orders state with the returned order
    setOrders(prev => prev.map(o => o._id === orderId ? resp.data.order : o));
    alert('Order cancelled successfully.');
  } catch (e) {
    console.error('Cancel failed:', e?.response?.data || e.message);
    alert(e?.response?.data?.message || 'Could not cancel order.');
  } finally {
    setCancellingId(null);
  }
};


  const subtotalDirect = useMemo(() => {
    if (!prefilled) return 0;
    return (prefilled.price || 0) * (qty || 1);
  }, [prefilled, qty]);

  const tax = subtotalDirect * 0.08; // 8% tax
  const shipping = subtotalDirect > 2000 ? 0 : 99; // Free shipping above ₹2000
  const totalDirect = subtotalDirect + tax + shipping;

  const onPlaceDirectOrder = async () => {
    if (!prefilled) return alert('No product selected for Buy Now.');
    if (!address.fullName || !address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      return alert('Please fill all required address fields.');
    }

    setProcessing(true);
    try {
      await placeDirectOrder({
        productId: prefilled.id,
        qty: Number(qty || 1),
        payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'paid' },
        shippingAddress: address,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadOrders();
      setActiveTab('orders');
    } catch (e) {
      console.error('Place direct order failed:', e?.response?.data || e.message);
      alert(e?.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const onPlaceCartOrder = async () => {
    if (!address.fullName || !address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      return alert('Please fill all required address fields.');
    }

    setProcessing(true);
    try {
      await placeOrderFromCart({
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadOrders();
      setActiveTab('orders');
    } catch (e) {
      console.error('Place cart order failed:', e?.response?.data || e.message);
      alert(e?.response?.data?.message || 'Could not place order from cart.');
    } finally {
      setProcessing(false);
    }
  };

  const ongoingOrders = useMemo(() => {
    return orders.filter(o => !['delivered', 'cancelled'].includes((o.status || '').toLowerCase()));
  }, [orders]);

  const previousOrders = useMemo(() => {
    return orders.filter(o => ['delivered', 'cancelled'].includes((o.status || '').toLowerCase()));
  }, [orders]);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <Clock className="status-icon" />;
      case 'confirmed': return <CheckCircle className="status-icon" />;
      case 'processing': return <RefreshCw className="status-icon spinning" />;
      case 'shipped': return <Truck className="status-icon" />;
      case 'delivered': return <CheckCircle2 className="status-icon" />;
      case 'cancelled': return <XCircle className="status-icon" />;
      default: return <Package className="status-icon" />;
    }
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'card': return <CreditCard size={20} />;
      case 'upi': return <Zap size={20} />;
      case 'cod': return <IndianRupee size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  return (
    <div className="orders-page">
      {/* Success Animation */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-animation">
            <CheckCircle2 className="success-icon" />
            <h3>Order Placed Successfully!</h3>
            <p>Your order has been confirmed</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="orders-header" data-aos="fade-down">
        <div className="header-left">
          <div className="brand-logo">
            <ShoppingBag className="brand-icon" />
            <span className="brand-text">Orders</span>
          </div>
          <div className="header-stats">
            <div className="stat">
              <TrendingUp size={16} />
              <span>{orders.length} Total</span>
            </div>
            <div className="stat">
              <Package size={16} />
              <span>{ongoingOrders.length} Active</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button
            type="button"
            className="back-to-products"
            onClick={() => navigate('/products')}
            title="Back to Products"
><ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            <span>Back to Products</span>
          </button>
          <div className="security-badge">
            <Shield className="secure-icon" />
            <div>
              <span className="secure-text">Secure Checkout</span>
              <span className="secure-sub">256-bit SSL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Tabs */}
      <div className="orders-tabs-container" data-aos="fade-up">
        <div className="tabs-wrapper">
          <div className="tabs-bg"></div>
          <button 
            className={`tab ${activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkout')}
            disabled={!prefilled}
          >
            <Sparkles size={18} />
            <span>Checkout Now</span>
            {prefilled && <span className="tab-badge">1 item</span>}
          </button>
          <button 
            className={`tab ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={18} />
            <span>Buy From Cart</span>
          </button>
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Crown size={18} />
            <span>My Orders</span>
            {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="orders-body">
        {/* Checkout Now */}
        {activeTab === 'checkout' && prefilled && (
          <div className="checkout-container" data-aos="fade-up">
            <div className="checkout-progress">
              <div className="progress-step active">
                <div className="step-icon"><ShoppingBag /></div>
                <span>Product</span>
              </div>
              <div className="progress-line active"></div>
              <div className="progress-step active">
                <div className="step-icon"><MapPin /></div>
                <span>Address</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-icon"><CreditCard /></div>
                <span>Payment</span>
              </div>
            </div>

            <div className="checkout-content">
              <div className="checkout-main">
                <div className="product-showcase" data-aos="fade-right" data-aos-delay="100">
                  <div className="showcase-header">
                    <h2><Package /> Product Details</h2>
                    <span className="badge premium">Premium</span>
                  </div>
                  
                  <div className="product-display">
                    <div className="product-image-wrapper">
                      <div className="image-container">
                        <img
                          src={getFullImageUrl(prefilled.image)}
                          alt={prefilled.name}
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400'; }}
                        />
                        <div className="image-overlay">
                          <Star className="star" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="product-details">
                      <h3 className="product-name">{prefilled.name}</h3>
                      <div className="price-tag">
                        <IndianRupee size={20} />
                        <span className="price">{prefilled.price.toLocaleString()}</span>
                        <span className="per-unit">per unit</span>
                      </div>
                      
                      <div className="quantity-selector">
                        <label>Quantity</label>
                        <div className="qty-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            value={qty} 
                            min={1} 
                            onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} 
                          />
                          <button 
                            className="qty-btn"
                            onClick={() => setQty(q => q + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="features">
                        <div className="feature">
                          <Gift size={16} />
                          <span>Gift Wrapping Available</span>
                        </div>
                        <div className="feature">
                          <Truck size={16} />
                          <span>Fast Delivery</span>
                        </div>
                        <div className="feature">
                          <Award size={16} />
                          <span>Quality Assured</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="forms-section" data-aos="fade-left" data-aos-delay="200">
                  {/* Shipping Address */}
                  <div className="form-card address-form">
                    <div className="form-header">
                      <h3><Home /> Shipping Address</h3>
                      <span className="required-note">* Required fields</span>
                    </div>
                    
                    <div className="form-grid">
                      <div className={`form-group ${addressFocused === 'fullName' ? 'focused' : ''}`}>
                        <User className="field-icon" />
                        <input 
                          placeholder="Full Name*" 
                          value={address.fullName}
                          onFocus={() => setAddressFocused('fullName')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, fullName: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group ${addressFocused === 'phone' ? 'focused' : ''}`}>
                        <Phone className="field-icon" />
                        <input 
                          placeholder="Phone Number*" 
                          value={address.phone}
                          onFocus={() => setAddressFocused('phone')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, phone: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group full-width ${addressFocused === 'line1' ? 'focused' : ''}`}>
                        <Home className="field-icon" />
                        <input 
                          placeholder="Address Line 1*" 
                          value={address.line1}
                          onFocus={() => setAddressFocused('line1')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, line1: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group full-width ${addressFocused === 'line2' ? 'focused' : ''}`}>
                        <Building className="field-icon" />
                        <input 
                          placeholder="Address Line 2 (Optional)" 
                          value={address.line2}
                          onFocus={() => setAddressFocused('line2')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, line2: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group ${addressFocused === 'city' ? 'focused' : ''}`}>
                        <Building className="field-icon" />
                        <input 
                          placeholder="City*" 
                          value={address.city}
                          onFocus={() => setAddressFocused('city')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, city: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group ${addressFocused === 'state' ? 'focused' : ''}`}>
                        <Navigation className="field-icon" />
                        <input 
                          placeholder="State*" 
                          value={address.state}
                          onFocus={() => setAddressFocused('state')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, state: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group ${addressFocused === 'postalCode' ? 'focused' : ''}`}>
                        <MapPin className="field-icon" />
                        <input 
                          placeholder="Postal Code*" 
                          value={address.postalCode}
                          onFocus={() => setAddressFocused('postalCode')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, postalCode: e.target.value })} 
                        />
                      </div>
                      
                      <div className={`form-group ${addressFocused === 'country' ? 'focused' : ''}`}>
                        <Navigation className="field-icon" />
                        <input 
                          placeholder="Country" 
                          value={address.country}
                          onFocus={() => setAddressFocused('country')}
                          onBlur={() => setAddressFocused('')}
                          onChange={e => setAddress({ ...address, country: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="form-card payment-form">
                    <div className="form-header">
                      <h3><CreditCard /> Payment Method</h3>
                      <span className="secure-payment">
                        <Shield size={16} />
                        Secure Payment
                      </span>
                    </div>
                    
                    <div className="payment-options">
                      <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')} 
                        />
                        <div className="option-content">
                          <CreditCard className="option-icon" />
                          <div>
                            <span className="option-title">Credit/Debit Card</span>
                            <span className="option-desc">Visa, Mastercard, Rupay</span>
                          </div>
                        </div>
                        <div className="option-badge">Popular</div>
                      </label>
                      
                      <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')} 
                        />
                        <div className="option-content">
                          <Zap className="option-icon" />
                          <div>
                            <span className="option-title">UPI Payment</span>
                            <span className="option-desc">Google Pay, PhonePe, Paytm</span>
                          </div>
                        </div>
                        <div className="option-badge instant">Instant</div>
                      </label>
                      
                      <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')} 
                        />
                        <div className="option-content">
                          <IndianRupee className="option-icon" />
                          <div>
                            <span className="option-title">Cash on Delivery</span>
                            <span className="option-desc">Pay when you receive</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="checkout-sidebar" data-aos="fade-up" data-aos-delay="300">
                <div className="summary-card">
                  <h3 className="summary-title">Order Summary</h3>
                  
                  <div className="summary-content">
                    <div className="summary-row">
                      <span>Subtotal ({qty} items)</span>
                      <span className="amount">₹{subtotalDirect.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (GST 8%)</span>
                      <span className="amount">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className={`amount ${shipping === 0 ? 'free' : ''}`}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                    
                    {shipping === 0 && (
                      <div className="free-shipping-badge">
                        <Truck size={16} />
                        <span>Eligible for free shipping!</span>
                      </div>
                    )}
                    
                    <div className="summary-divider"></div>
                    
                    <div className="summary-total">
                      <span>Total Amount</span>
                      <div className="total-amount">
                        <IndianRupee size={24} />
                        <span>{totalDirect.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
  className="orders-place-order-btn"
  onClick={onPlaceDirectOrder}
  disabled={processing}
>
                    {processing ? (
                      <>
                        <Loader2 className="spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                  
                  <div className="trust-badges">
                    <div className="trust-badge">
                      <Shield size={16} />
                      <span>Secure Payment</span>
                    </div>
                    <div className="trust-badge">
                      <RefreshCw size={16} />
                      <span>Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buy From Cart */}
        {activeTab === 'cart' && (
          <div className="cart-checkout" data-aos="fade-up">
            <div className="cart-header">
              <h2><ShoppingCart /> Cart Checkout</h2>
              <p>Complete your purchase from cart items</p>
            </div>

            <div className="cart-checkout-grid">
              <div className="cart-forms">
                {/* Address Form */}
                <div className="form-card address-form">
                  <div className="form-header">
                    <h3><Home /> Delivery Address</h3>
                  </div>
                  
                  <div className="form-grid">
                    <div className={`form-group ${addressFocused === 'fullName' ? 'focused' : ''}`}>
                      <User className="field-icon" />
                      <input 
                        placeholder="Full Name*" 
                        value={address.fullName}
                        onFocus={() => setAddressFocused('fullName')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, fullName: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group ${addressFocused === 'phone' ? 'focused' : ''}`}>
                      <Phone className="field-icon" />
                      <input 
                        placeholder="Phone Number*" 
                        value={address.phone}
                        onFocus={() => setAddressFocused('phone')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, phone: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group full-width ${addressFocused === 'line1' ? 'focused' : ''}`}>
                      <Home className="field-icon" />
                      <input 
                        placeholder="Address Line 1*" 
                        value={address.line1}
                        onFocus={() => setAddressFocused('line1')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, line1: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group full-width ${addressFocused === 'line2' ? 'focused' : ''}`}>
                      <Building className="field-icon" />
                      <input 
                        placeholder="Address Line 2 (Optional)" 
                        value={address.line2}
                        onFocus={() => setAddressFocused('line2')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, line2: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group ${addressFocused === 'city' ? 'focused' : ''}`}>
                      <Building className="field-icon" />
                      <input 
                        placeholder="City*" 
                        value={address.city}
                        onFocus={() => setAddressFocused('city')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, city: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group ${addressFocused === 'state' ? 'focused' : ''}`}>
                      <Navigation className="field-icon" />
                      <input 
                        placeholder="State*" 
                        value={address.state}
                        onFocus={() => setAddressFocused('state')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, state: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group ${addressFocused === 'postalCode' ? 'focused' : ''}`}>
                      <MapPin className="field-icon" />
                      <input 
                        placeholder="Postal Code*" 
                        value={address.postalCode}
                        onFocus={() => setAddressFocused('postalCode')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, postalCode: e.target.value })} 
                      />
                    </div>
                    
                    <div className={`form-group ${addressFocused === 'country' ? 'focused' : ''}`}>
                      <Navigation className="field-icon" />
                      <input 
                        placeholder="Country" 
                        value={address.country}
                        onFocus={() => setAddressFocused('country')}
                        onBlur={() => setAddressFocused('')}
                        onChange={e => setAddress({ ...address, country: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="form-card payment-form">
                  <div className="form-header">
                    <h3><CreditCard /> Payment Options</h3>
                  </div>
                  
                  <div className="payment-options">
                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="cartPayment" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')} 
                      />
                      <div className="option-content">
                        <CreditCard className="option-icon" />
                        <div>
                          <span className="option-title">Card Payment</span>
                          <span className="option-desc">All major cards accepted</span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="cartPayment" 
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')} 
                      />
                      <div className="option-content">
                        <Zap className="option-icon" />
                        <div>
                          <span className="option-title">UPI</span>
                          <span className="option-desc">Instant payment</span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="cartPayment" 
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')} 
                      />
                      <div className="option-content">
                        <IndianRupee className="option-icon" />
                        <div>
                          <span className="option-title">Cash on Delivery</span>
                          <span className="option-desc">Pay on receipt</span>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                 <button
  className="orders-place-order-btn cart-order"
  onClick={onPlaceCartOrder}
  disabled={processing}
>
                    {processing ? (
                      <>
                        <Loader2 className="spin" />
                        <span>Processing Cart Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart />
                        <span>Place Cart Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="cart-info">
                <div className="info-card">
                  <Gift className="info-icon" />
                  <h4>Special Offers</h4>
                  <p>Get 10% off on orders above ₹5000</p>
                </div>
                <div className="info-card">
                  <Truck className="info-icon" />
                  <h4>Free Shipping</h4>
                  <p>On orders above ₹2000</p>
                </div>
                <div className="info-card">
                  <Shield className="info-icon" />
                  <h4>Secure Payment</h4>
                  <p>Your payment info is safe with us</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Orders */}
        {activeTab === 'orders' && (
          <div className="orders-list" data-aos="fade-up">
            {loadingOrders ? (
              <div className="loading-container">
                <div className="loader-wrapper">
                  <Loader2 className="main-loader spin" />
                  <p>Loading your orders...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Ongoing Orders */}
                
                <div className="orders-section">
                  <div className="section-header">
                    <h3><Clock /> Ongoing Orders</h3>
                    <span className="count">{ongoingOrders.length}</span>
                  </div>
                  
                  {ongoingOrders.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Package />
                      </div>
                      <h4>No ongoing orders</h4>
                      <p>Your active orders will appear here</p>
                    </div>
                  ) : (
                    <div className="orders-grid">
                      {ongoingOrders.map(order => (
                        <div key={order._id} className="order-card active" data-aos="fade-up" data-aos-delay="100">
                          <div className="order-header">
                            <div className="order-id">
                              <span className="id-label">Order ID</span>
                              <span className="id-value">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className={`order-status ${order.status?.toLowerCase()}`}>
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </div>
                          </div>
                          
                          <div className="order-timeline">
                            <div className={`timeline-step ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'completed' : ''}`}>
                              <div className="step-dot"></div>
                              <span>Placed</span>
                            </div>
                            <div className={`timeline-step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'completed' : ''}`}>
                              <div className="step-dot"></div>
                              <span>Confirmed</span>
                            </div>
                            <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'completed' : ''}`}>
                              <div className="step-dot"></div>
                              <span>Processing</span>
                            </div>
                            <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status?.toLowerCase()) ? 'completed' : ''}`}>
                              <div className="step-dot"></div>
                              <span>Shipped</span>
                            </div>
                            <div className={`timeline-step ${order.status?.toLowerCase() === 'delivered' ? 'completed' : ''}`}>
                              <div className="step-dot"></div>
                              <span>Delivered</span>
                            </div>
                          </div>
                          
                          <div className="order-items">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="order-item">
                                <div className="item-info">
                                  <span className="item-name">{item.name}</span>
                                  <span className="item-qty">Qty: {item.qty}</span>
                                </div>
                                <span className="item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="more-items">
                                +{order.items.length - 3} more items
                              </div>
                            )}
                          </div>
                          
                          <div className="order-footer">
                            {/* inside ongoingOrders.map(...) */}
<div className="order-actions">
  {canCancel(order) ? (
    <button
      className="cancel-order-btn"
      onClick={() => onCancelOrder(order._id)}
      disabled={cancellingId === order._id}
      title="Cancel Order"
    >
      {cancellingId === order._id ? (
        <>
          <Loader2 className="spin" />
          <span>Cancelling...</span>
        </>
      ) : (
        <>
          <XCircle size={16} />
          <span>Cancel Order</span>
        </>
      )}
    </button>
  ) : (
    <span className="cancel-disabled">Not cancellable</span>
  )}
</div>

                            <div className="order-date">
                              <Calendar size={16} />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="order-total">
                              <span>Total</span>
                              <span className="total-amount">₹{(order.total || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previous Orders */}
                <div className="orders-section">
                  <div className="section-header">
                    <h3><CheckCircle2 /> Previous Orders</h3>
                    <span className="count">{previousOrders.length}</span>
                  </div>
                  
                  {previousOrders.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <CheckCircle />
                      </div>
                      <h4>No previous orders</h4>
                      <p>Your completed orders will appear here</p>
                    </div>
                  ) : (
                    <div className="previous-orders-grid">
                      {previousOrders.map(order => (
                        <div key={order._id} className="previous-order-card" data-aos="fade-up" data-aos-delay="100">
                          <div className="order-badge">
                            {order.status === 'delivered' ? (
                              <CheckCircle2 className="delivered-icon" />
                            ) : (
                              <XCircle className="cancelled-icon" />
                            )}
                          </div>
                          
                          <div className="order-main">
                            <div className="order-info">
                              <span className="order-number">#{order._id.slice(-8).toUpperCase()}</span>
                              <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="order-summary">
                              <span className="items-count">{order.items.length} items</span>
                              <span className="divider">•</span>
                              <span className="order-amount">₹{(order.total || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <button className="view-details-btn">
                            View Details
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
