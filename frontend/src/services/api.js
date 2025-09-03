// frontend/src/services/api.js
import axios from "axios";

// =============================
// 1. Set API Base URL Dynamically
// =============================
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create a single axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================
// 2. Interceptor to Attach JWT Token
// =============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================
// 3. Utility: Build Full Image URL
// =============================
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-image.jpg";
  let p = String(imagePath).trim();

  // Replace Windows-style backslashes
  p = p.replace(/\\/g, "/");

  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(p)) return p;

  // Remove unwanted '/backend' prefix if added accidentally
  p = p.replace(/^\/backend/, "");

  // Ensure it starts with '/'
  if (!p.startsWith("/")) p = `/${p}`;

  return `${API_URL}${p}`;
};

// =============================
// 4. AUTH APIs
// =============================
export const signupCustomer = (data) => api.post("/auth/customer/signup", data);
export const loginCustomer = (data) => api.post("/auth/customer/login", data);
export const signupSeller = (data) => api.post("/auth/seller/signup", data);
export const loginSeller = (data) => api.post("/auth/seller/login", data);

// =============================
// 5. PRODUCT APIs
// =============================
export const fetchAllProducts = async () => {
  const response = await api.get("/products");
  return { data: response.data };
};

export const fetchMyProducts = () => api.get("/products/my-products");

export const addProduct = (productFormData) =>
  api.post("/products", productFormData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (productId) =>
  api.delete(`/products/${productId}`);

export const updateProduct = (productId, updatedDataOrFormData) =>
  api.put(`/products/${productId}`, updatedDataOrFormData, {
    headers:
      updatedDataOrFormData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });

// =============================
// 6. CART, WISHLIST, PROFILE, ORDERS
// =============================

// Cart APIs
export const getCart = () => api.get("/features/cart");
export const addToCart = (productId, quantity = 1) =>
  api.post("/features/cart", { productId, quantity });
export const removeFromCart = (productId) =>
  api.delete(`/features/cart/${productId}`);
export const clearCart = () => api.delete("/features/cart");

// Wishlist APIs
export const getWishlist = () => api.get("/features/wishlist");
export const addToWishlist = (productId) =>
  api.post("/features/wishlist", { productId });
export const removeFromWishlistApi = (productId) =>
  api.delete(`/features/wishlist/${productId}`);

// Seller Profile APIs
export const getSellerProfile = () => api.get("/features/seller-profile");
export const updateSellerProfile = (profileData) =>
  api.post("/features/seller-profile", profileData);

export const uploadSellerLogo = (formData) =>
  api.post("/features/seller-profile/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Orders APIs
export const placeOrderFromCart = (payment) =>
  api.post("/orders", { source: "cart", payment });

export const placeDirectOrder = ({
  productId,
  qty = 1,
  payment,
  shippingAddress,
}) =>
  api.post("/orders", {
    source: "direct",
    items: [{ productId, qty }],
    payment,
    shippingAddress,
  });

export const cancelMyOrder = (orderId) =>
  api.put(`/orders/${orderId}/cancel`);

export const getMyOrders = () => api.get("/orders/my");

// Seller Orders
export const getSellerOrders = () => api.get("/orders/seller");
export const updateOrderStatus = (orderId, status) =>
  api.put(`/orders/${orderId}/status`, { status });
