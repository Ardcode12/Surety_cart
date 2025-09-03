// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// --- Axios Instances ---
const authAPI = axios.create({ baseURL: `${API_URL}/api/auth` });
const productAPI = axios.create({ baseURL: `${API_URL}/api/products` });
const featuresAPI = axios.create({ baseURL: `${API_URL}/api/features` });
const ordersAPI = axios.create({ baseURL: `${API_URL}/api/orders` });

// Normalize and build full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  let p = String(imagePath).trim();

  // Fix Windows backslashes
  p = p.replace(/\\/g, '/');

  // If full URL, return as is
  if (/^https?:\/\//i.test(p)) return p;

  // Ensure it starts with /uploads
  if (!p.startsWith('/')) p = `/${p}`;
  // In case someone stored '/backend/uploads/...'
  p = p.replace(/^\/backend/, '');

  return `${API_URL}${p}`;
};

// --- Interceptor to add JWT token ---
const addAuthToken = (req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
};

productAPI.interceptors.request.use(addAuthToken);
featuresAPI.interceptors.request.use(addAuthToken);
ordersAPI.interceptors.request.use(addAuthToken);

// =================================================================
// AUTH
// =================================================================
export const signupCustomer = (data) => authAPI.post('/customer/signup', data);
export const loginCustomer = (data) => authAPI.post('/customer/login', data);
export const signupSeller = (data) => authAPI.post('/seller/signup', data);
export const loginSeller = (data) => authAPI.post('/seller/login', data);

// =================================================================
// PRODUCTS
// =================================================================
export const fetchAllProducts = async () => {
  const response = await productAPI.get('/');
  return { data: response.data };
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

// =================================================================
// CART, WISHLIST, PROFILE, ORDERS
// =================================================================
export const getCart = () => featuresAPI.get('/cart');
export const addToCart = (productId, quantity = 1) => featuresAPI.post('/cart', { productId, quantity });
export const removeFromCart = (productId) => featuresAPI.delete(`/cart/${productId}`);
export const clearCart = () => featuresAPI.delete('/cart');

export const getWishlist = () => featuresAPI.get('/wishlist');
export const addToWishlist = (productId) => featuresAPI.post('/wishlist', { productId });
export const removeFromWishlistApi = (productId) => featuresAPI.delete(`/wishlist/${productId}`);

// Seller Profile
export const getSellerProfile = () => featuresAPI.get('/seller-profile');
export const updateSellerProfile = (profileData) => featuresAPI.post('/seller-profile', profileData);

// Logo upload (multipart)
export const uploadSellerLogo = (formData) =>
  featuresAPI.post('/seller-profile/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Orders
export const placeOrderFromCart = (payment) =>
  ordersAPI.post('/', { source: 'cart', payment });

export const placeDirectOrder = ({ productId, qty = 1, payment, shippingAddress }) =>
  ordersAPI.post('/', {
    source: 'direct',
    items: [{ productId, qty }],
    payment,
    shippingAddress,
  });

export const cancelMyOrder = (orderId) => ordersAPI.put(`/${orderId}/cancel`);
export const getMyOrders = () => ordersAPI.get('/my');

// Seller orders
export const getSellerOrders = () => ordersAPI.get('/seller');
export const updateOrderStatus = (orderId, status) => ordersAPI.put(`/${orderId}/status`, { status });

// Export helper
export { getFullImageUrl };
