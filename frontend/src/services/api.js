// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// --- Axios Instances ---
const authAPI = axios.create({
  baseURL: `${API_URL}/api/auth`,
});

const productAPI = axios.create({
  baseURL: `${API_URL}/api/products`,
});

const featuresAPI = axios.create({
  baseURL: `${API_URL}/api/features`,
});

const ordersAPI = axios.create({
  baseURL: `${API_URL}/api/orders`,
});

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

// --- Interceptor to add JWT token ---
const addAuthToken = (req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
};

productAPI.interceptors.request.use(addAuthToken);
featuresAPI.interceptors.request.use(addAuthToken);
ordersAPI.interceptors.request.use(addAuthToken);

// =================================================================
// AUTHENTICATION API CALLS
// =================================================================
export const signupCustomer = (data) => authAPI.post('/customer/signup', data);
export const loginCustomer = (data) => authAPI.post('/customer/login', data);
export const signupSeller = (data) => authAPI.post('/seller/signup', data);
export const loginSeller = (data) => authAPI.post('/seller/login', data);

// =================================================================
// PRODUCT MANAGEMENT API CALLS
// =================================================================
export const fetchAllProducts = async () => {
  const response = await productAPI.get('/');
  return { data: response.data };
};

export const fetchMyProducts = () => productAPI.get('/my-products');
export const addProduct = (productData) => productAPI.post('/', productData);
export const deleteProduct = (productId) => productAPI.delete(`/${productId}`);
export const updateProduct = (productId, updatedData) => productAPI.put(`/${productId}`, updatedData);

// =================================================================
// CART, WISHLIST, PROFILE, AND ORDERS API CALLS
// =================================================================
// Cart
export const getCart = () => featuresAPI.get('/cart');
export const addToCart = (productId, quantity = 1) => featuresAPI.post('/cart', { productId, quantity });
export const removeFromCart = (productId) => featuresAPI.delete(`/cart/${productId}`);
export const clearCart = () => featuresAPI.delete('/cart');

// Wishlist
export const getWishlist = () => featuresAPI.get('/wishlist');
export const addToWishlist = (productId) => featuresAPI.post('/wishlist', { productId });
export const removeFromWishlistApi = (productId) => featuresAPI.delete(`/wishlist/${productId}`);

// Seller Profile
export const getSellerProfile = () => featuresAPI.get('/seller-profile');
export const updateSellerProfile = (profileData) => featuresAPI.post('/seller-profile', profileData);

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
// Cancel an order (customer)
export const cancelMyOrder = (orderId) => ordersAPI.put(`/${orderId}/cancel`);

export const getMyOrders = () => ordersAPI.get('/my');


// Export the helper
export { getFullImageUrl };
