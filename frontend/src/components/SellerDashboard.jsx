// frontend/src/components/SellerDashboard.jsx  (profile logo upload wired)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './SellerDashboard.css';
import {
  Store, Package, ShoppingBag, Users, TrendingUp, DollarSign,
  Star, Heart, MessageCircle, Settings, Bell, Plus, Edit,
  Trash2, Eye, Download, Upload, Filter, Search, Calendar,
  BarChart3, PieChart, Activity, AlertCircle, CheckCircle,
  Clock, Tag, Zap, Award, Target, ArrowUpRight, ArrowDownRight,
  Menu, X, LogOut, Camera, Grid, List, MoreVertical,
  Instagram, Facebook, Twitter, Globe, Mail, Phone,
  FileText, CreditCard, Truck, RefreshCw, Shield, ChevronRight,
  ShieldCheck, Wallet, UserCheck, PackageCheck, TruckIcon,
  CheckCircle2, XCircle, AlertTriangle, Timer, Sparkles,
  Crown, Gem, ArrowUp, ArrowDown, Percent, IndianRupee
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

import {
  fetchMyProducts, addProduct, deleteProduct, getFullImageUrl,
  getSellerProfile, updateSellerProfile, getSellerOrders, updateOrderStatus, uploadSellerLogo
} from '../services/api';

const SellerDashboard = ({ setIsAuthenticated, setUserType }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedOrderTab, setSelectedOrderTab] = useState('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Image uploads for new product
  const [uploadedImages, setUploadedImages] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  // New product form
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    quantity: '',
    category: '',
    brand: '',
    image: null
  });

  // Profile state (live)
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    storeName: '',
    bio: '',
    policies: { supportEmail: '' },
  });

  // Orders state (live)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const authUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const displayName = sellerProfile?.storeName || authUser.businessName || 'Unknown Store';

  // Logo input ref
  const logoInputRef = useRef(null);
  useEffect(() => {
  const id = setInterval(async () => {
    try {
      const { data } = await getSellerOrders();
      setOrders(data || []);
    } catch {}
  }, 60000); // 60s
  return () => clearInterval(id);
}, []);

  // Load seller orders on mount so dashboard stats are live
useEffect(() => {
  const loadOrders = async () => {
    try {
      const { data } = await getSellerOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Failed to load seller orders (dashboard)', e);
    }
  };
  loadOrders();
}, []);


  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await getSellerProfile();
        setSellerProfile(data);
        setProfileForm({
          storeName: data.storeName || '',
          bio: data.bio || '',
          policies: { supportEmail: data.policies?.supportEmail || '' },
        });
      } catch (e) {
        console.error('Failed to load seller profile', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  // Products loader
  const loadMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await fetchMyProducts();
      const transformedProducts = data.map(product => {
        const stock = product.quantity || 0;
        const originalPrice = product.originalPrice ?? product.price;
        const computedDiscount = originalPrice > 0 ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;
        return {
          ...product,
          name: product.name || product.title,
          sku: product._id.slice(-6).toUpperCase(),
          stock,
          sold: Math.max(0, Math.floor(Math.random() * (stock || 50))),
          reviews: Math.floor(Math.random() * 50),
          rating: (Math.random() * 1 + 4).toFixed(1),
          lastUpdated: new Date(product.updatedAt).toLocaleDateString(),
          status: stock > 50 ? 'active' : stock > 0 ? 'low_stock' : 'out_of_stock',
          discount: product.discount ?? computedDiscount,
          category: product.category,
          brand: product.brand,
          originalPrice,
        };
      });
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Failed to fetch seller's products", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load products when view active
  useEffect(() => {
    if (activeView === 'products') {
      loadMyProducts();
    }
  }, [activeView]);

  // Load orders when view active
  useEffect(() => {
    const loadOrders = async () => {
      if (activeView !== 'orders') return;
      setLoadingOrders(true);
      try {
        const { data } = await getSellerOrders();
        setOrders(data || []);
      } catch (e) {
        console.error('Failed to load seller orders', e);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [activeView]);

  const now = new Date();
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameMonth = (d, ref) =>
  d.getFullYear() === ref.getFullYear() &&
  d.getMonth() === ref.getMonth();

const INR = (n) => `₹${Math.round(Number(n || 0)).toLocaleString('en-IN')}`;

  const dashboardStats = React.useMemo(() => {
  // counts
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // shipped today (we use updatedAt as "shipped at" timestamp)
  const shippedToday = orders.filter(o => {
    if (o.status !== 'shipped') return false;
    const t = o.updatedAt ? new Date(o.updatedAt) : null;
    return t ? isSameDay(t, now) : false;
  }).length;

  // this month revenue from shipped orders (sum of totals.total)
  const monthShippedRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'shipped') return sum;
    const t = o.updatedAt ? new Date(o.updatedAt) : null;
    if (!t || !isSameMonth(t, now)) return sum;
    return sum + (o.totals?.total || 0);
  }, 0);

  return [
    {
      title: "This Month Revenue",
      value: INR(monthShippedRevenue),
      change: "",
      trend: "up",
      icon: IndianRupee,
      gradient: "gradient-1",
      subtitle: "Shipped orders only",
      sparkData: [5, 10, 8, 12, 16, 15, 20]
    },
    {
      title: "Pending Orders",
      value: String(pendingCount),
      change: "",
      trend: "up",
      icon: Clock,
      gradient: "gradient-2",
      subtitle: "Orders awaiting confirmation",
      sparkData: [3, 2, 4, 1, 2, 3, 2]
    },
    {
      title: "Shipped Today",
      value: String(shippedToday),
      change: "",
      trend: "up",
      icon: Truck, // requires Truck from lucide-react (already imported)
      gradient: "gradient-3",
      subtitle: "Marked as shipped today",
      sparkData: [1, 2, 2, 3, 1, 2, 4]
    },
    {
      title: "Customer Rating",
      value: "—",
      change: "",
      trend: "up",
      icon: Star,
      gradient: "gradient-4",
      subtitle: "From customer feedback",
      sparkData: [40, 42, 45, 43, 47, 48, 49]
    }
  ];
}, [orders]);


  const revenueData = [
    { date: 'Mon', revenue: 45000, orders: 42, avgOrder: 1071 },
    { date: 'Tue', revenue: 52000, orders: 48, avgOrder: 1083 },
    { date: 'Wed', revenue: 48000, orders: 45, avgOrder: 1067 },
    { date: 'Thu', revenue: 61000, orders: 56, avgOrder: 1089 },
    { date: 'Fri', revenue: 72000, orders: 65, avgOrder: 1108 },
    { date: 'Sat', revenue: 88000, orders: 78, avgOrder: 1128 },
    { date: 'Sun', revenue: 65000, orders: 58, avgOrder: 1121 }
  ];

  const performanceData = [
    { metric: 'Order Fulfillment', value: 98.5, target: 95, color: '#10b981' },
    { metric: 'Customer Satisfaction', value: 96.2, target: 90, color: '#6366f1' },
    { metric: 'Response Time', value: 94.8, target: 85, color: '#f59e0b' },
    { metric: 'Product Quality', value: 97.5, target: 95, color: '#ef4444' }
  ];

  // Order stats derived from live orders
  const orderStats = React.useMemo(() => {
    const total = orders.length;
    const counts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    return {
      total,
      pending: counts.pending || 0,
      confirmed: counts.confirmed || 0,
      shipped: counts.shipped || 0,
      delivered: counts.delivered || 0,
      cancelled: counts.cancelled || 0,
    };
  }, [orders]);

  const filteredOrders = React.useMemo(() => {
    if (selectedOrderTab === 'all') return orders;
    return orders.filter(o => o.status === selectedOrderTab);
  }, [orders, selectedOrderTab]);

  // Add product (form submit)
  const handleAddProduct = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const imageFile = formData.get('image');
  if (!imageFile || imageFile.size === 0) {
    alert("Please select an image for the product.");
    return;
  }
  try {
    await addProduct(formData); // api.js forces multipart headers
    e.target.reset();
    setUploadedImages([]);
    setShowAddProductModal(false);
    await loadMyProducts();
  } catch (error) {
    console.error('Add Product Error:', error);
    alert(error?.response?.data?.message || 'Failed to add product');
  }
};

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        await loadMyProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product. Please try again.");
      }
    }
  };

  // Order status actions
  const changeOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      const { data } = await getSellerOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Update order status failed', e);
      alert('Failed to update order status');
    }
  };

  // UI helpers
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="status-icon" />;
      case 'confirmed': return <ShieldCheck className="status-icon" />;
      case 'processing': return <RefreshCw className="status-icon spinning" />;
      case 'shipped': return <Truck className="status-icon" />;
      case 'delivered': return <CheckCircle2 className="status-icon" />;
      case 'cancelled': return <XCircle className="status-icon" />;
      case 'returned': return <AlertTriangle className="status-icon" />;
      default: return <Package className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      confirmed: 'status-processing',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      returned: 'status-returned',
      active: 'status-active',
      low_stock: 'status-warning',
      out_of_stock: 'status-danger'
    };
    return colors[status] || 'status-default';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    setUserType(null);
    navigate('/');
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setShowAddProductModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages((prevImages) => [...prevImages, ...files]);
    setNewProductForm(prev => ({ ...prev, image: files[0] }));
  };

  const removeImage = (index) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setNewProductForm(prev => ({ ...prev, image: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateSellerProfile(profileForm);
      setSellerProfile(data);
      alert('Profile updated');
    } catch (e1) {
      console.error('Update profile failed', e1);
      alert('Failed to update profile');
    }
  };

  const triggerLogoPicker = () => {
    logoInputRef.current?.click();
  };

  const onLogoPicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await uploadSellerLogo(formData);
      setSellerProfile(data);
      alert('Logo updated');
    } catch (err) {
      console.error('Upload logo failed', err);
      alert('Failed to upload logo');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="premium-seller-dashboard">
      <aside className={`premium-sidebar ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-premium">
            <div className="brand-icon-wrapper">
              <Store className="brand-icon" />
              {/* <Crown className="crown-icon" /> */}
            </div>
            <div className="brand-text">
              <h2>Seller Dashboard</h2>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
            <X />
          </button>
        </div>

        <div className="seller-card">
          <div className="seller-avatar">
            <img src={sellerProfile?.logo ? getFullImageUrl(sellerProfile.logo) : 'https://via.placeholder.com/80?text=S'} alt={displayName} />
            {/* <div className="level-badge">
              <Gem className="gem-icon" />
              Seller
            </div>   */}
          </div>
          <h3 className="seller-name">{displayName}</h3>
          <p className="seller-username">{authUser?.email || 'Not provided'}</p>

          <div className="seller-badges">
            <span className="achievement-badge"><Award size={14} /> Active</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <div className="nav-section">
            <h4 className="nav-title">Main</h4>
            <button className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
              <div className="nav-icon"><BarChart3 size={20} /></div>
              <span>Dashboard</span>
              <ChevronRight className="nav-arrow" />
            </button>
            <button className={`nav-link ${activeView === 'products' ? 'active' : ''}`} onClick={() => setActiveView('products')}>
              <div className="nav-icon"><Package size={20} /></div>
              <span>My Products</span>
              <span className="nav-badge">{products.length}</span>
            </button>
            <button className={`nav-link ${activeView === 'orders' ? 'active' : ''}`} onClick={() => setActiveView('orders')}>
              <div className="nav-icon"><ShoppingBag size={20} /></div>
              <span>Orders</span>
              <span className="nav-badge warning">{orderStats.pending}</span>
            </button>
          </div>

          <div className="nav-section">
            <h4 className="nav-title">Analytics</h4>
            <button className={`nav-link ${activeView === 'revenue' ? 'active' : ''}`} onClick={() => setActiveView('revenue')}>
              <div className="nav-icon"><DollarSign size={20} /></div>
              <span>Revenue</span>
            </button>
            <button className={`nav-link ${activeView === 'customers' ? 'active' : ''}`} onClick={() => setActiveView('customers')}>
              <div className="nav-icon"><Users size={20} /></div>
              <span>Customers</span>
            </button>
            <button className={`nav-link ${activeView === 'performance' ? 'active' : ''}`} onClick={() => setActiveView('performance')}>
              <div className="nav-icon"><TrendingUp size={20} /></div>
              <span>Performance</span>
            </button>
          </div>

          <div className="nav-section">
            <h4 className="nav-title">Settings</h4>
            <button className={`nav-link ${activeView === 'profile' ? 'active' : ''}`} onClick={() => setActiveView('profile')}>
              <div className="nav-icon"><UserCheck size={20} /></div>
              <span>Profile</span>
            </button>
            <button className={`nav-link ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')}>
              <div className="nav-icon"><Settings size={20} /></div>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="storage-info">
            <div className="storage-header">
              <span>Storage Used</span>
              <span>75%</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`dashboard-main ${!showSidebar ? 'full-width' : ''}`}>
        <header className="premium-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setShowSidebar(!showSidebar)}>
              <Menu />
            </button>
            <div className="page-info">
              <h1>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
              <p>Welcome back! Here's what's happening with your store today.</p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-search">
              <Search size={20} />
              <input type="text" placeholder="Search products, orders..." />
            </div>

            <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell />
              <span className="notification-dot"></span>
            </button>

            <div className="header-profile">
              <img src={sellerProfile?.logo ? getFullImageUrl(sellerProfile.logo) : 'https://via.placeholder.com/40?text=S'} alt="Profile" />
              <div className="profile-info">
                <span className="profile-name">{displayName}</span>
                <span className="profile-level">Seller</span>
              </div>
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              {dashboardStats.map((stat, index) => (
                <div key={stat.title} className={`stat-card ${stat.gradient}`} data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="stat-header">
                    <div className="stat-icon-wrapper">
                      <stat.icon className="stat-icon" />
                    </div>
                    <div className={`stat-trend ${stat.trend}`}>
                      {stat.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="stat-body">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                    <p className="stat-subtitle">{stat.subtitle}</p>
                  </div>
                  <div className="stat-chart">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={stat.sparkData.map((value, i) => ({ value, index: i }))}>
                        <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.2)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="chart-section" data-aos="fade-up">
              <div className="section-header">
                <div className="section-title">
                  <h2>Revenue Overview</h2>
                  <p>Track your daily revenue and order trends</p>
                </div>
                <div className="section-actions">
                  <select className="period-select" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <button className="export-btn">
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>
              <div className="revenue-chart">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#revenueGradient)" strokeWidth={3} name="Revenue (₹)" />
                    <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#ordersGradient)" strokeWidth={3} name="Orders" yAxisId="right" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div> */}
          </div>
        )}

        {activeView === 'products' && (
          <div className="products-view">
            <div className="view-header">
              <div className="header-info">
                <h2>Product Management</h2>
                <p>Manage your product inventory and listings</p>
              </div>
              <div className="header-actions">
                <div className="filter-dropdown">
                  <Filter size={18} />
                  <select value={selectedProductFilter} onChange={(e) => setSelectedProductFilter(e.target.value)}>
                    <option value="all">All Products</option>
                    <option value="active">Active</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <button className="add-product-btn" onClick={handleAddNewProduct}>
                  <Plus size={20} />
                  Add New Product
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="loading-state">Loading products...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products
                  .filter(p => selectedProductFilter === 'all' ? true : (
                    selectedProductFilter === 'active' ? p.status === 'active' :
                    selectedProductFilter === 'low_stock' ? p.status === 'low_stock' :
                    p.status === 'out_of_stock'
                  ))
                  .map((product, index) => (
                  <div key={product._id} className="product-card" data-aos="fade-up" data-aos-delay={index * 50}>
                    <div className="product-image-container">
                      <img src={getFullImageUrl(product.image)} alt={product.name} className="product-image" onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }} />
                    </div>
                    <div className="product-content">
                      <div className="product-header">
                        <span className="product-sku">{product.sku}</span>
                        <span className={`stock-badge ${getStatusColor(product.status)}`}>
                          {product.status === 'active' ? `${product.stock} in stock` :
                            product.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      <div className="product-stats">
                        <div className="stat">
                          <Star size={16} />
                          <span>{product.rating} ({product.reviews})</span>
                        </div>
                        <div className="stat">
                          <ShoppingBag size={16} />
                          <span>{product.sold} sold</span>
                        </div>
                      </div>
                      <div className="product-pricing">
                        <div className="price-group">
                          <span className="current-price">₹{Number(product.price).toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="original-price">₹{Number(product.originalPrice).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="product-footer">
                        <span className="last-updated">{product.lastUpdated}</span>
                        <div className="product-actions">
                          <button className="action-btn" onClick={() => { setSelectedProduct(product); setShowProductModal(true); }}>
                            <Eye size={16} />
                          </button>
                          <button className="action-btn" onClick={() => console.log('Edit product:', product._id)}>
                            <Edit size={16} />
                          </button>
                          <button className="action-btn danger" onClick={() => handleDeleteProduct(product._id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't added any products yet.</p>
                <button className="add-product-btn" onClick={handleAddNewProduct}>
                  <Plus size={20} />
                  Add your first product
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'orders' && (
          <div className="orders-view">
            <div className="view-header">
              <div className="header-info">
                <h2>Order Management</h2>
                <p>Track and manage all your orders</p>
              </div>
              <div className="order-stats-bar">
                <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{orderStats.total}</span></div>
                <div className="stat-item pending"><span className="stat-label">Pending</span><span className="stat-value">{orderStats.pending}</span></div>
                <div className="stat-item processing"><span className="stat-label">Confirmed</span><span className="stat-value">{orderStats.confirmed}</span></div>
                <div className="stat-item shipped"><span className="stat-label">Shipped</span><span className="stat-value">{orderStats.shipped}</span></div>
                <div className="stat-item delivered"><span className="stat-label">Delivered</span><span className="stat-value">{orderStats.delivered}</span></div>
                <div className="stat-item cancelled"><span className="stat-label">Cancelled</span><span className="stat-value">{orderStats.cancelled}</span></div>
              </div>
            </div>
            <div className="order-tabs">
              <button className={`tab ${selectedOrderTab === 'all' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('all')}>All Orders</button>
              <button className={`tab ${selectedOrderTab === 'pending' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('pending')}>Pending<span className="tab-badge">{orderStats.pending}</span></button>
              <button className={`tab ${selectedOrderTab === 'confirmed' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('confirmed')}>Confirmed<span className="tab-badge">{orderStats.confirmed}</span></button>
              <button className={`tab ${selectedOrderTab === 'shipped' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('shipped')}>Shipped<span className="tab-badge">{orderStats.shipped}</span></button>
              <button className={`tab ${selectedOrderTab === 'delivered' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('delivered')}>Delivered</button>
              <button className={`tab ${selectedOrderTab === 'cancelled' ? 'active' : ''}`} onClick={() => setSelectedOrderTab('cancelled')}>Cancelled</button>
            </div>
            <div className="orders-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr><td colSpan="8">Loading orders...</td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan="8">No orders found.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="order-id-cell">
                          <span className="order-id">{String(order._id).slice(-8).toUpperCase()}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="avatar-fallback">{(order.customer?.name || 'U').charAt(0)}</div>
                            <div>
                              <p className="customer-name">{order.customer?.name || 'Unknown'}</p>
                              <p className="customer-phone">{order.customer?.phone || order.customer?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="products-cell">
                            {order.items.map((product, idx) => (
                              <p key={idx}>{product.name} <span className="qty">x{product.qty}</span></p>
                            ))}
                          </div>
                        </td>
                        <td className="amount-cell">₹{(order.totals?.total || 0).toLocaleString()}</td>
                        <td>
                          <span className="payment-badge">
                            <CreditCard size={14} />
                            {order.payment?.method || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="date-cell">{order.placedAt ? new Date(order.placedAt).toLocaleString() : ''}</td>
                        <td>
                          <div className="table-actions">
                            {order.status === 'pending' && (
                              <button className="table-action-btn edit" onClick={() => changeOrderStatus(order._id, 'confirmed')}>
                                Confirm
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button className="table-action-btn view" onClick={() => changeOrderStatus(order._id, 'shipped')}>
                                Ship
                              </button>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <button className="table-action-btn more" onClick={() => changeOrderStatus(order._id, 'cancelled')}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="profile-view">
            <div className="view-header">
              <h2>Profile Settings</h2>
              <p>Manage your account details and preferences</p>
            </div>

            <div className="profile-form">
              <div className="avatar-section">
                <img src={sellerProfile?.logo ? getFullImageUrl(sellerProfile.logo) : 'https://via.placeholder.com/80?text=S'} alt="Profile" />
                <button className="change-avatar" type="button" onClick={triggerLogoPicker}>
                  <Camera size={20} />
                  Change Photo
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onLogoPicked} />
              </div>
              <form className="form-grid" onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    value={profileForm.storeName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, storeName: e.target.value }))}
                    placeholder="Unknown"
                  />
                </div>
                <div className="form-group">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={profileForm.policies.supportEmail}
                    onChange={(e) => setProfileForm((p) => ({ ...p, policies: { ...p.policies, supportEmail: e.target.value } }))}
                    placeholder="Not provided"
                  />
                </div>
                <div className="form-group full">
                  <label>Store Bio</label>
                  <textarea
                    rows="4"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Not provided"
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" type="submit">Save Changes</button>
                  <button
                    className="cancel-btn"
                    type="button"
                    onClick={() =>
                      setProfileForm({
                        storeName: sellerProfile?.storeName || '',
                        bio: sellerProfile?.bio || '',
                        policies: { supportEmail: sellerProfile?.policies?.supportEmail || '' },
                      })
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showProductModal && selectedProduct && (
          <div className="premium-modal-overlay" onClick={() => setShowProductModal(false)}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Product Details</h2>
                <button className="close-btn" onClick={() => setShowProductModal(false)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <div className="product-detail-grid">
                  <div className="product-gallery">
                    <img src={getFullImageUrl(selectedProduct.image)} alt={selectedProduct.name} />
                  </div>
                  <div className="product-info">
                    <span className="sku">{selectedProduct.sku}</span>
                    <h3>{selectedProduct.name}</h3>
                    <p className="category">{selectedProduct.category}</p>

                    <div className="price-section">
                      <span className="current-price">₹{Number(selectedProduct.price).toLocaleString()}</span>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="original-price">₹{Number(selectedProduct.originalPrice).toLocaleString()}</span>
                      )}
                      {selectedProduct.discount > 0 && (
                        <span className="discount">{selectedProduct.discount}% OFF</span>
                      )}
                    </div>

                    <div className="stats-section">
                      <div className="stat-box">
                        <Package size={20} />
                        <div>
                          <p>Stock</p>
                          <h4>{selectedProduct.stock}</h4>
                        </div>
                      </div>
                      <div className="stat-box">
                        <ShoppingBag size={20} />
                        <div>
                          <p>Sold</p>
                          <h4>{selectedProduct.sold}</h4>
                        </div>
                      </div>
                      <div className="stat-box">
                        <Star size={20} />
                        <div>
                          <p>Rating</p>
                          <h4>{selectedProduct.rating}</h4>
                        </div>
                      </div>
                      <div className="stat-box">
                        <MessageCircle size={20} />
                        <div>
                          <p>Reviews</p>
                          <h4>{selectedProduct.reviews}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button className="btn-primary">
                        <Edit size={18} />
                        Edit Product
                      </button>
                      <button className="btn-secondary">
                        <Eye size={18} />
                        View in Store
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddProductModal && (
          <div className="premium-modal-overlay" onClick={() => setShowAddProductModal(false)}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Product</h2>
                <button className="close-btn" onClick={() => setShowAddProductModal(false)}>
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddProduct} className="product-add-form">
                  <div className="form-group">
                    <label htmlFor="product-title">Product Name</label>
                    <input type="text" id="product-title" name="name" value={newProductForm.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-description">Description</label>
                    <textarea id="product-description" name="description" value={newProductForm.description} onChange={handleChange} required></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-price">Price (₹)</label>
                    <input type="number" id="product-price" name="price" value={newProductForm.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-originalPrice">Original Price (₹)</label>
                    <input type="number" id="product-originalPrice" name="originalPrice" value={newProductForm.originalPrice} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-quantity">Initial Stock</label>
                    <input type="number" id="product-quantity" name="quantity" value={newProductForm.quantity} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-category">Category</label>
                    <select id="product-category" name="category" value={newProductForm.category} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Photography">Photography</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home & Living</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="product-brand">Brand</label>
                    <input type="text" id="product-brand" name="brand" value={newProductForm.brand} onChange={handleChange} />
                  </div>
                  <div className="form-group full">
                    <label>Product Images</label>
                    <div className="image-upload-area">
                      <input type="file" id="product-images" name="image" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      <label htmlFor="product-images" className="image-upload-box">
                        <Upload size={24} />
                        <p>Drag & drop images here or click to browse</p>
                        <span>Supports JPG, PNG, WEBP (Max 5MB each)</span>
                      </label>
                      {uploadedImages.length > 0 && (
                        <div className="uploaded-images">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="image-preview">
                              <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
                              <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      <Plus size={18} />
                      Create Product
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setShowAddProductModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showNotifications && (
          <div className="notifications-panel" data-aos="slide-left">
            <div className="panel-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X />
              </button>
            </div>
            <div className="notifications-list">
              <div className="notification-item unread">
                <div className="notification-icon order">
                  <ShoppingBag />
                </div>
                <div className="notification-content">
                  <h4>New Order Received</h4>
                  <p>Order received</p>
                  <span className="time">2 minutes ago</span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-icon stock">
                  <AlertCircle />
                </div>
                <div className="notification-content">
                  <h4>Stock Reminder</h4>
                  <p>Check low inventory</p>
                  <span className="time">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
