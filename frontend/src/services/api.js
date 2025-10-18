// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- Axios Instances ---
const authAPI = axios.create({ baseURL: `${API_URL}/api/auth` });
const productAPI = axios.create({ baseURL: `${API_URL}/api/products` });
const featuresAPI = axios.create({ baseURL: `${API_URL}/api/features` });
const ordersAPI = axios.create({ baseURL: `${API_URL}/api/orders` });

// Add JWT header
const addAuthToken = (req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
};

// Updated image URL handler for Cloudinary with better debugging
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://dummyimage.com/400x400/cccccc/666666.png&text=No+Image';
  }
  
  // Cloudinary URLs are already complete
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For relative paths
  if (imagePath.startsWith('/')) {
    return `${API_URL}${imagePath}`;
  }
  
  // For paths starting with uploads/
  if (imagePath.startsWith('uploads/')) {
    return `${API_URL}/${imagePath}`;
  }
  
  // Default case
  return `${API_URL}/uploads/${imagePath}`;
};

// Apply interceptors
productAPI.interceptors.request.use(addAuthToken);
featuresAPI.interceptors.request.use(addAuthToken);
ordersAPI.interceptors.request.use(addAuthToken);

// Add response interceptor for better error handling
const handleResponseError = (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

authAPI.interceptors.response.use(response => response, handleResponseError);
productAPI.interceptors.response.use(response => response, handleResponseError);
featuresAPI.interceptors.response.use(response => response, handleResponseError);
ordersAPI.interceptors.response.use(response => response, handleResponseError);

// === Auth APIs ===
export const signupCustomer = (data) => authAPI.post('/customer/signup', data);
export const loginCustomer = (data) => authAPI.post('/customer/login', data);
export const signupSeller = (data) => authAPI.post('/seller/signup', data);
export const loginSeller = (data) => authAPI.post('/seller/login', data);

// === Products ===
export const fetchAllProducts = async () => {
  try {
    const res = await productAPI.get('/');
    console.log('=== fetchAllProducts Response ===');
    console.log('Products data:', res.data);
    return { data: res.data };
  } catch (error) {
    console.error('fetchAllProducts error:', error);
    throw error;
  }
};

export const fetchMyProducts = () => productAPI.get('/my-products');

// Force multipart for add/update with files
export const addProduct = (productFormData) =>
  productAPI.post('/', productFormData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (productId) => productAPI.delete(`/${productId}`);

export const updateProduct = (productId, updatedDataOrFormData) =>
  productAPI.put(`/${productId}`, updatedDataOrFormData, {
    headers:
      updatedDataOrFormData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
  });

// === Cart APIs ===
export const getCart = async () => {
  try {
    const res = await featuresAPI.get('/cart');
    console.log('=== getCart Response ===');
    console.log('Cart data:', res.data);
    return res;
  } catch (error) {
    console.error('getCart error:', error);
    throw error;
  }
};

export const addToCart = (productId, quantity = 1) => 
  featuresAPI.post('/cart', { productId, quantity });

export const removeFromCart = (productId) => 
  featuresAPI.delete(`/cart/${productId}`);

export const clearCart = () => 
  featuresAPI.delete('/cart');

// === Wishlist APIs ===
export const getWishlist = async () => {
  try {
    const res = await featuresAPI.get('/wishlist');
    console.log('=== getWishlist Response ===');
    console.log('Wishlist data:', res.data);
    return res;
  } catch (error) {
    console.error('getWishlist error:', error);
    throw error;
  }
};

export const addToWishlist = (productId) => 
  featuresAPI.post('/wishlist', { productId });

export const removeFromWishlistApi = (productId) => 
  featuresAPI.delete(`/wishlist/${productId}`);

// === Seller Profile APIs ===
export const getSellerProfile = () => featuresAPI.get('/seller-profile');

export const updateSellerProfile = (profileData) => 
  featuresAPI.post('/seller-profile', profileData);

// Logo upload (multipart)
export const uploadSellerLogo = (formData) =>
  featuresAPI.post('/seller-profile/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// === Order APIs ===
export const placeOrderFromCart = (payment) =>
  ordersAPI.post('/', { source: 'cart', payment });

export const placeDirectOrder = ({ productId, qty = 1, payment, shippingAddress }) =>
  ordersAPI.post('/', {
    source: 'direct',
    items: [{ productId, qty }],
    payment,
    shippingAddress,
  });

export const cancelMyOrder = (orderId) => 
  ordersAPI.put(`/${orderId}/cancel`);

export const getMyOrders = () => ordersAPI.get('/my');

// === Seller Order APIs ===
export const getSellerOrders = () => ordersAPI.get('/seller');

export const updateOrderStatus = (orderId, status) => 
  ordersAPI.put(`/${orderId}/status`, { status });

// === Additional Helper APIs (if needed) ===
export const getOrders = getMyOrders; // Alias for compatibility
export const getSellerStats = () => featuresAPI.get('/seller-stats');
export const getProductById = (id) => productAPI.get(`/${id}`);

// Export default for backward compatibility
export default {
  authAPI,
  productAPI,
  featuresAPI,
  ordersAPI
};
