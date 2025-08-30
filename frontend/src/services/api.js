import axios from 'axios';

// Define the base URL of your backend server
// For production, it's best to use an environment variable like process.env.REACT_APP_API_URL
const API_URL = 'http://localhost:5000';

// --- Axios Instances ---
const authAPI = axios.create({
  baseURL: `${API_URL}/api/auth`,
});

const productAPI = axios.create({
  baseURL: `${API_URL}/api/products`,
});

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

// --- Interceptor to add JWT token to protected product routes ---
productAPI.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

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

/**
 * Fetches ALL products for the public-facing pages.
 */
export const fetchAllProducts = async () => {
  try {
    const response = await productAPI.get('/');
    const productsWithFullUrls = response.data.map((product) => ({
      ...product,
      image: getFullImageUrl(product.image),
    }));
    return { data: productsWithFullUrls };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches only the products belonging to the currently logged-in seller.
 */
export const fetchMyProducts = async () => {
  try {
    const response = await productAPI.get('/my-products');
    const productsWithFullUrls = response.data.map((product) => ({
      ...product,
      image: getFullImageUrl(product.image),
    }));
    return { data: productsWithFullUrls };
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

/**
 * Adds a new product. (For the Seller Dashboard)
 * @param {FormData} productData - The product data, including the image file.
 */
// Removed manual headers - Axios sets them automatically for FormData
export const addProduct = (productData) => productAPI.post('/', productData);

/**
 * Deletes a product by its ID. (For the Seller Dashboard)
 * @param {string} productId - The ID of the product to delete.
 */
export const deleteProduct = (productId) => productAPI.delete(`/${productId}`);

/**
 * Updates an existing product. (For Seller Dashboard "Edit" functionality)
 * @param {string} productId - The ID of the product to update.
 * @param {FormData} updatedData - The new product data.
 */
// Removed manual headers - Axios sets them automatically for FormData
export const updateProduct = (productId, updatedData) =>
  productAPI.put(`/${productId}`, updatedData);


// Export the helper function
export { getFullImageUrl };