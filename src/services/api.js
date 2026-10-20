/**
 * Vaagai Luxury Sarees - Frontend API Client Service
 * Connects smoothly to the Express + PostgreSQL backend via the Vite proxy.
 * Includes graceful fallback to offline catalog if backend is not yet started.
 */

const API_BASE = '/api';
const TOKEN_KEY = 'vaagai_auth_token_v1';

/**
 * Retrieve stored auth token
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store auth token
 */
export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota
  }
}

/**
 * Universal fetch wrapper with authorization header injection
 */
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -------------------------------------------------------------
// Products & Categories
// -------------------------------------------------------------

/**
 * Fetch products with optional query parameters (search, filter, sort)
 */
export async function fetchProducts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';
  return request(endpoint);
}

/**
 * Fetch single product by id or slug
 */
export async function fetchProductByIdOrSlug(idOrSlug) {
  return request(`/products/${idOrSlug}`);
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  return request('/products/categories');
}

// -------------------------------------------------------------
// Orders & Checkout
// -------------------------------------------------------------

/**
 * Place a new order
 * @param {Object} orderData - Shipping details and items array
 */
export async function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/**
 * Fetch order tracking details by order number
 */
export async function fetchOrderByNumber(orderNumber, email) {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  return request(`/orders/${orderNumber}${query}`);
}

/**
 * Fetch authenticated customer's past orders
 */
export async function fetchMyOrders() {
  return request('/orders/my');
}

// -------------------------------------------------------------
// Newsletter & Bespoke Consultations
// -------------------------------------------------------------

/**
 * Subscribe email to newsletter
 */
export async function subscribeNewsletter(email) {
  return request('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Submit bespoke inquiry or contact message
 */
export async function submitContactInquiry(inquiryData) {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  });
}

// -------------------------------------------------------------
// Authentication
// -------------------------------------------------------------

/**
 * Log in customer or admin
 */
export async function loginUser(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Register new customer
 */
export async function registerUser(userData) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Get current authenticated user profile
 */
export async function fetchCurrentUser() {
  return request('/auth/me');
}

/**
 * Log out
 */
export function logoutUser() {
  setAuthToken(null);
}

// -------------------------------------------------------------
// Product Reviews
// -------------------------------------------------------------

/**
 * Fetch reviews for a product
 */
export async function fetchProductReviews(productId) {
  return request(`/reviews/${productId}`);
}

/**
 * Submit review for a product
 */
export async function submitProductReview(reviewData) {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

/**
 * Health check
 */
export async function checkBackendHealth() {
  return request('/health');
}

export default {
  fetchProducts,
  fetchProductByIdOrSlug,
  fetchCategories,
  createOrder,
  fetchOrderByNumber,
  fetchMyOrders,
  subscribeNewsletter,
  submitContactInquiry,
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  fetchProductReviews,
  submitProductReview,
  checkBackendHealth,
};
