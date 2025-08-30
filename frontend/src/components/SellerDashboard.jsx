// frontend/src/components/SellerDashboard.jsx

import React, { useState, useEffect } from 'react';
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

// Import the API service functions
import { fetchMyProducts, addProduct, deleteProduct, getFullImageUrl } from '../services/api';

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
    
    // State for image uploads in the new product form
    const [uploadedImages, setUploadedImages] = useState([]);
    
    // State for products, loading status, and errors
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState(null);
    
    // State for the new product form data
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

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic'
        });
    }, []);

    // Fetch products for the seller when the products view is active
    useEffect(() => {
        if (activeView === 'products') {
            const getMyProducts = async () => {
                setLoadingProducts(true);
                try {
                    const { data } = await fetchMyProducts();
                    const transformedProducts = data.map(product => ({
                        ...product,
                        name: product.title,
                        sku: product._id.slice(-6).toUpperCase(), // Use part of ID as a simple SKU
                        stock: product.quantity,
                        sold: Math.floor(Math.random() * product.quantity), // Placeholder sold count
                        reviews: Math.floor(Math.random() * 50), // Placeholder reviews
                        rating: (Math.random() * 1 + 4).toFixed(1), // Placeholder rating
                        lastUpdated: new Date(product.updatedAt).toLocaleDateString(),
                        status: product.quantity > 50 ? 'active' : product.quantity > 0 ? 'low_stock' : 'out_of_stock',
                        trending: Math.random() > 0.7, // Random for demo
                        discount: product.discount,
                    }));
                    setProducts(transformedProducts);
                } catch (err) {
                    console.error("Failed to fetch seller's products", err);
                    setError("Failed to load products. Please try again.");
                } finally {
                    setLoadingProducts(false);
                }
            };
            getMyProducts();
        }
    }, [activeView]);

    const sellerInfo = {
        name: "Elite Store Pro",
        username: "@elitestore",
        verified: true,
        premiumSeller: true,
        rating: 4.9,
        level: "Diamond",
        joinDate: "Jan 2023",
        totalRevenue: "₹45,67,890",
        monthlyRevenue: "₹3,45,678",
        totalOrders: 3456,
        completionRate: 98.5,
        followers: 12453,
        badges: ["Top Seller", "Fast Shipper", "Quality Assured"],
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    };

    const dashboardStats = [
        {
            title: "Today's Revenue",
            value: "₹45,678",
            change: "+18.5%",
            trend: "up",
            icon: IndianRupee,
            gradient: "gradient-1",
            subtitle: "32 orders today",
            sparkData: [10, 25, 15, 30, 45, 35, 50]
        },
        {
            title: "Pending Orders",
            value: "24",
            change: "-5",
            trend: "down",
            icon: Clock,
            gradient: "gradient-2",
            subtitle: "Process within 2 hours",
            sparkData: [30, 25, 20, 15, 10, 8, 5]
        },
        {
            title: "Delivered Today",
            value: "156",
            change: "+12.3%",
            trend: "up",
            icon: PackageCheck,
            gradient: "gradient-3",
            subtitle: "98.5% success rate",
            sparkData: [20, 30, 35, 45, 50, 55, 60]
        },
        {
            title: "Customer Rating",
            value: "4.9",
            change: "+0.2",
            trend: "up",
            icon: Star,
            gradient: "gradient-4",
            subtitle: "From 234 reviews",
            sparkData: [40, 42, 45, 43, 47, 48, 49]
        }
    ];

    const orderStats = {
        total: 3456,
        pending: 24,
        processing: 45,
        shipped: 123,
        delivered: 3234,
        cancelled: 30,
        returned: 12
    };

    const recentOrders = [
        // Hardcoded for the dashboard overview
    ];

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

    // Function to handle adding a new product via the API
    // SellerDashboard.jsx (or wherever you handle adding products)



// In your SellerDashboard.jsx

const handleAddProduct = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  // Get the file from the FormData
  const imageFile = formData.get('image');

  // --- ADD THIS VALIDATION BLOCK ---
  if (!imageFile || imageFile.size === 0) {
    alert("Please select an image for the product."); // Or show a more elegant error message
    return; // Stop the function here
  }
  // --------------------------------

  console.log('FINAL FORMDATA:');
  formData.forEach((value, key) => console.log(key + ':', value));

  try {
    const response = await addProduct(formData);
    console.log('✅ Product added:', response.data);
    e.target.reset();
    fetchMyProducts();
  } catch (error) {
    console.error('❌ Add Product Error:', error);
    // You can also display the specific error from the backend
    if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.message}`);
    }
  }
};


    // Function to handle deleting a product via the API
    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(productId);
                console.log("Product deleted successfully.");
                // Re-fetch products to update the list
                setActiveView('dashboard');
                setTimeout(() => setActiveView('products'), 100);
            } catch (err) {
                console.error("Error deleting product:", err);
                setError("Failed to delete product. Please try again.");
            }
        }
    };
    
    // UI utility functions (unchanged)
    const getStatusIcon = (status) => {
        switch(status) {
            case 'pending': return <Clock className="status-icon" />;
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

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };
        return colors[priority] || 'priority-default';
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

    return (
        <div className="premium-seller-dashboard">
            <aside className={`premium-sidebar ${showSidebar ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-premium">
                        <div className="brand-icon-wrapper">
                            <Store className="brand-icon" />
                            <Crown className="crown-icon" />
                        </div>
                        <div className="brand-text">
                            <h2>Seller Dashboard</h2>
                            {/* <span className="premium-badge">Premium</span> */}
                        </div>
                    </div>
                    <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
                        <X />
                    </button>
                </div>

                <div className="seller-card">
                    <div className="seller-avatar">
                        <img src={sellerInfo.image} alt={sellerInfo.name} />
                        <div className="level-badge">
                            <Gem className="gem-icon" />
                            {sellerInfo.level}
                        </div>
                    </div>
                    <h3 className="seller-name">{sellerInfo.name}</h3>
                    <p className="seller-username">{sellerInfo.username}</p>
                    
                    <div className="seller-metrics">
                        <div className="metric">
                            <span className="metric-value">{sellerInfo.rating}</span>
                            <span className="metric-label">Rating</span>
                        </div>
                        <div className="metric">
                            <span className="metric-value">{sellerInfo.completionRate}%</span>
                            <span className="metric-label">Success</span>
                        </div>
                        <div className="metric">
                            <span className="metric-value">{sellerInfo.followers}</span>
                            <span className="metric-label">Followers</span>
                        </div>
                    </div>

                    <div className="seller-badges">
                        {sellerInfo.badges.map((badge, index) => (
                            <span key={index} className="achievement-badge">
                                <Award size={14} />
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                <nav className="sidebar-navigation">
                    <div className="nav-section">
                        <h4 className="nav-title">Main</h4>
                        <button 
                            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveView('dashboard')}
                        >
                            <div className="nav-icon">
                                <BarChart3 size={20} />
                            </div>
                            <span>Dashboard</span>
                            <ChevronRight className="nav-arrow" />
                        </button>
                        <button 
                            className={`nav-link ${activeView === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveView('products')}
                        >
                            <div className="nav-icon">
                                <Package size={20} />
                            </div>
                            <span>My Products</span>
                            <span className="nav-badge">{products.length}</span>
                        </button>
                        <button 
                            className={`nav-link ${activeView === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveView('orders')}
                        >
                            <div className="nav-icon">
                                <ShoppingBag size={20} />
                            </div>
                            <span>Orders</span>
                            <span className="nav-badge warning">{orderStats.pending}</span>
                        </button>
                    </div>

                    <div className="nav-section">
                        <h4 className="nav-title">Analytics</h4>
                        <button 
                            className={`nav-link ${activeView === 'revenue' ? 'active' : ''}`}
                            onClick={() => setActiveView('revenue')}
                        >
                            <div className="nav-icon">
                                <DollarSign size={20} />
                            </div>
                            <span>Revenue</span>
                        </button>
                        <button 
                            className={`nav-link ${activeView === 'customers' ? 'active' : ''}`}
                            onClick={() => setActiveView('customers')}
                        >
                            <div className="nav-icon">
                                <Users size={20} />
                            </div>
                            <span>Customers</span>
                        </button>
                        <button 
                            className={`nav-link ${activeView === 'performance' ? 'active' : ''}`}
                            onClick={() => setActiveView('performance')}
                        >
                            <div className="nav-icon">
                                <TrendingUp size={20} />
                            </div>
                            <span>Performance</span>
                        </button>
                    </div>

                    <div className="nav-section">
                        <h4 className="nav-title">Settings</h4>
                        <button 
                            className={`nav-link ${activeView === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveView('profile')}
                        >
                            <div className="nav-icon">
                                <UserCheck size={20} />
                            </div>
                            <span>Profile</span>
                        </button>
                        <button 
                            className={`nav-link ${activeView === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveView('settings')}
                        >
                            <div className="nav-icon">
                                <Settings size={20} />
                            </div>
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
                        <div className="storage-bar">
                            <div className="storage-progress" style={{ width: '75%' }}></div>
                        </div>
                        <p className="storage-text">7.5 GB of 10 GB used</p>
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
                            <img src={sellerInfo.image} alt="Profile" />
                            <div className="profile-info">
                                <span className="profile-name">{sellerInfo.name}</span>
                                <span className="profile-level">{sellerInfo.level} Seller</span>
                            </div>
                        </div>
                    </div>
                </header>

                {activeView === 'dashboard' && (
                    <div className="dashboard-content">
                        <div className="stats-grid">
                            {dashboardStats.map((stat, index) => (
                                <div 
                                    key={stat.title} 
                                    className={`stat-card ${stat.gradient}`}
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
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
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="rgba(255,255,255,0.8)" 
                                                    fill="rgba(255,255,255,0.2)" 
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-section" data-aos="fade-up">
                            <div className="section-header">
                                <div className="section-title">
                                    <h2>Revenue Overview</h2>
                                    <p>Track your daily revenue and order trends</p>
                                </div>
                                <div className="section-actions">
                                    <select 
                                        className="period-select"
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                    >
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
                                        <Tooltip 
                                            contentStyle={{ 
                                                background: 'rgba(255, 255, 255, 0.95)', 
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#6366f1" 
                                            fillOpacity={1} 
                                            fill="url(#revenueGradient)" 
                                            strokeWidth={3}
                                            name="Revenue (₹)"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="orders" 
                                            stroke="#10b981" 
                                            fillOpacity={1} 
                                            fill="url(#ordersGradient)" 
                                            strokeWidth={3}
                                            name="Orders"
                                            yAxisId="right"
                                        />
                                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="orders-section" data-aos="fade-up">
                            {/* NOTE: You would replace this with real data in a production app */}
                            {/* This is a placeholder for the dashboard overview */}
                        </div>
                        <div className="performance-section" data-aos="fade-up">
                            <div className="section-header">
                                <div className="section-title">
                                    <h2>Performance Metrics</h2>
                                    <p>Your store performance at a glance</p>
                                </div>
                            </div>
                            <div className="performance-grid">
                                {performanceData.map((metric, index) => (
                                    <div 
                                        key={metric.metric} 
                                        className="performance-card"
                                        data-aos="zoom-in"
                                        data-aos-delay={index * 100}
                                    >
                                        <h4>{metric.metric}</h4>
                                        <div className="performance-chart">
                                            <ResponsiveContainer width="100%" height={120}>
                                                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[metric]}>
                                                    <RadialBar
                                                        dataKey="value"
                                                        cornerRadius={10}
                                                        fill={metric.color}
                                                        background
                                                    />
                                                </RadialBarChart>
                                            </ResponsiveContainer>
                                            <div className="performance-value">
                                                <span className="value">{metric.value}%</span>
                                                <span className="target">Target: {metric.target}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                    <select 
                                        value={selectedProductFilter}
                                        onChange={(e) => setSelectedProductFilter(e.target.value)}
                                    >
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
                                {products.map((product, index) => (
                                    <div 
                                        key={product._id} 
                                        className="product-card"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 50}
                                    >
                                        <div className="product-image-container">
                                            <img 
                                                src={getFullImageUrl(product.image)} 
                                                alt={product.name} 
                                                className="product-image" 
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                                            />
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
                                                    <span className="current-price">₹{product.price.toLocaleString()}</span>
                                                    {product.originalPrice > product.price && (
                                                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="product-footer">
                                                <span className="last-updated">{product.lastUpdated}</span>
                                                <div className="product-actions">
                                                    <button 
                                                        className="action-btn" 
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setShowProductModal(true);
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        className="action-btn"
                                                        onClick={() => console.log('Edit product:', product._id)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        className="action-btn danger" 
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                    >
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
                                <div className="stat-item">
                                    <span className="stat-label">Total</span>
                                    <span className="stat-value">{orderStats.total}</span>
                                </div>
                                <div className="stat-item pending">
                                    <span className="stat-label">Pending</span>
                                    <span className="stat-value">{orderStats.pending}</span>
                                </div>
                                <div className="stat-item processing">
                                    <span className="stat-label">Processing</span>
                                    <span className="stat-value">{orderStats.processing}</span>
                                </div>
                                <div className="stat-item shipped">
                                    <span className="stat-label">Shipped</span>
                                    <span className="stat-value">{orderStats.shipped}</span>
                                </div>
                                <div className="stat-item delivered">
                                    <span className="stat-label">Delivered</span>
                                    <span className="stat-value">{orderStats.delivered}</span>
                                </div>
                            </div>
                        </div>
                        <div className="order-tabs">
                            <button 
                                className={`tab ${selectedOrderTab === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedOrderTab('all')}
                            >
                                All Orders
                            </button>
                            <button 
                                className={`tab ${selectedOrderTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setSelectedOrderTab('pending')}
                            >
                                Pending
                                <span className="tab-badge">{orderStats.pending}</span>
                            </button>
                            <button 
                                className={`tab ${selectedOrderTab === 'processing' ? 'active' : ''}`}
                                onClick={() => setSelectedOrderTab('processing')}
                            >
                                Processing
                                <span className="tab-badge">{orderStats.processing}</span>
                            </button>
                            <button 
                                className={`tab ${selectedOrderTab === 'shipped' ? 'active' : ''}`}
                                onClick={() => setSelectedOrderTab('shipped')}
                            >
                                Shipped
                                <span className="tab-badge">{orderStats.shipped}</span>
                            </button>
                            <button 
                                className={`tab ${selectedOrderTab === 'delivered' ? 'active' : ''}`}
                                onClick={() => setSelectedOrderTab('delivered')}
                            >
                                Delivered
                            </button>
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
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="order-id-cell">
                                                <span className="order-id">{order.id}</span>
                                                <span className={`priority-indicator ${getPriorityColor(order.priority)}`}></span>
                                            </td>
                                            <td>
                                                <div className="customer-cell">
                                                    <img src={order.customer.image} alt={order.customer.name} />
                                                    <div>
                                                        <p className="customer-name">{order.customer.name}</p>
                                                        <p className="customer-phone">{order.customer.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="products-cell">
                                                    {order.products.map((product, idx) => (
                                                        <p key={idx}>
                                                            {product.name} <span className="qty">x{product.quantity}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="amount-cell">₹{order.total.toLocaleString()}</td>
                                            <td>
                                                <span className="payment-badge">
                                                    <CreditCard size={14} />
                                                    {order.paymentMethod}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">{order.date}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="table-action-btn view">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="table-action-btn edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="table-action-btn more">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'revenue' && (
                    <div className="revenue-view">
                        <div className="view-header">
                            <div className="header-info">
                                <h2>Revenue Analytics</h2>
                                <p>Detailed insights into your earnings</p>
                            </div>
                            <div className="revenue-summary">
                                <div className="summary-item">
                                    <span className="label">Today</span>
                                    <span className="value">₹45,678</span>
                                    <span className="change up">+12.5%</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">This Week</span>
                                    <span className="value">₹3,45,678</span>
                                    <span className="change up">+18.3%</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">This Month</span>
                                    <span className="value">₹12,45,678</span>
                                    <span className="change up">+22.7%</span>
                                </div>
                            </div>
                        </div>
                        <div className="analytics-grid">
                            <div className="analytics-card large" data-aos="fade-up">
                                <h3>Revenue Trend</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                background: 'rgba(255, 255, 255, 0.95)', 
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#6366f1" 
                                            strokeWidth={3}
                                            fill="url(#revenueLineGradient)"
                                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="analytics-card" data-aos="fade-up" data-aos-delay="100">
                                <h3>Top Products by Revenue</h3>
                                <div className="top-products-list">
                                    {products.slice(0, 5).map((product, index) => (
                                        <div key={product.id} className="top-product-item">
                                            <span className="rank">{index + 1}</span>
                                            <img src={product.image} alt={product.name} />
                                            <div className="product-info">
                                                <h4>{product.name}</h4>
                                                <p>{product.sold} units sold</p>
                                            </div>
                                            <div className="revenue-info">
                                                <span className="revenue">₹{(product.price * product.sold).toLocaleString()}</span>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress" 
                                                        style={{ width: `${(product.sold / 1000) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="analytics-card" data-aos="fade-up" data-aos-delay="200">
                                <h3>Revenue by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RePieChart>
                                        <Pie
                                            data={[
                                                { name: 'Electronics', value: 45, color: '#6366f1' },
                                                { name: 'Fashion', value: 25, color: '#10b981' },
                                                { name: 'Home', value: 20, color: '#f59e0b' },
                                                { name: 'Others', value: 10, color: '#ef4444' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Electronics', value: 45, color: '#6366f1' },
                                                { name: 'Fashion', value: 25, color: '#10b981' },
                                                { name: 'Home', value: 20, color: '#f59e0b' },
                                                { name: 'Others', value: 10, color: '#ef4444' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
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
                                <img src={sellerInfo.image} alt="Profile" />
                                <button className="change-avatar">
                                    <Camera size={20} />
                                    Change Photo
                                </button>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Store Name</label>
                                    <input type="text" defaultValue={sellerInfo.name} />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" defaultValue={sellerInfo.username} />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" defaultValue="store@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="form-group full">
                                    <label>Store Description</label>
                                    <textarea rows="4" defaultValue="Premium electronics store offering the latest gadgets and accessories."></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Store Category</label>
                                    <select defaultValue="electronics">
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="home">Home & Living</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" defaultValue="Mumbai, India" />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="save-btn">Save Changes</button>
                                <button className="cancel-btn">Cancel</button>
                            </div>
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
                                            <span className="current-price">₹{selectedProduct.price.toLocaleString()}</span>
                                            {selectedProduct.originalPrice > selectedProduct.price && (
                                                <span className="original-price">₹{selectedProduct.originalPrice.toLocaleString()}</span>
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
                                        <input type="text" id="product-title" name="name" value={newProductForm.title} onChange={handleChange} required />
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
                                            <input 
                                                type="file" 
                                                id="product-images" 
                                                name="image"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
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
                                                            <button 
                                                                type="button" 
                                                                className="remove-image"
                                                                onClick={() => removeImage(index)}
                                                            >
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
                                        <button 
                                            type="button" 
                                            className="btn-secondary" 
                                            onClick={() => setShowAddProductModal(false)}
                                        >
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
                                    <p>Order #ORD-2024-005 from Rajesh Kumar</p>
                                    <span className="time">2 minutes ago</span>
                                </div>
                            </div>
                            <div className="notification-item unread">
                                <div className="notification-icon review">
                                    <Star />
                                </div>
                                <div className="notification-content">
                                    <h4>New 5-Star Review</h4>
                                    <p>Customer loved your Premium Headphones</p>
                                    <span className="time">15 minutes ago</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <div className="notification-icon stock">
                                    <AlertCircle />
                                </div>
                                <div className="notification-content">
                                    <h4>Low Stock Alert</h4>
                                    <p>Smart Watch Ultra has only 5 units left</p>
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