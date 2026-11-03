/**
 * VAAGAI Admin Panel API Client Service
 */

const API_BASE = '/api/admin';

function getAuthHeader() {
  const token = localStorage.getItem('vaagai_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const adminApi = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async resetPassword(resetCode, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetCode, newPassword }),
    });
    return handleResponse(res);
  },

  /**
   * Connect to real-time Server-Sent Events (SSE) stream
   */
  subscribeRealtime(onEvent, onError) {
    const token = localStorage.getItem('vaagai_admin_token') || sessionStorage.getItem('vaagai_admin_token');
    if (!token) return null;

    const eventSource = new EventSource(`${API_BASE}/realtime?token=${encodeURIComponent(token)}`);

    eventSource.addEventListener('handshake', (e) => {
      try {
        if (onEvent) onEvent({ type: 'handshake', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.addEventListener('order:created', (e) => {
      try {
        if (onEvent) onEvent({ type: 'order:created', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.addEventListener('order:status_updated', (e) => {
      try {
        if (onEvent) onEvent({ type: 'order:status_updated', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.addEventListener('inventory:adjusted', (e) => {
      try {
        if (onEvent) onEvent({ type: 'inventory:adjusted', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.addEventListener('product:created', (e) => {
      try {
        if (onEvent) onEvent({ type: 'product:created', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.addEventListener('product:updated', (e) => {
      try {
        if (onEvent) onEvent({ type: 'product:updated', data: JSON.parse(e.data) });
      } catch {}
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return eventSource;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Overview
  async getOverview(range = '30d') {
    const res = await fetch(`${API_BASE}/overview?range=${range}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async bulkUpdateProducts(productIds, action, value) {
    const res = await fetch(`${API_BASE}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productIds, action, value }),
    });
    return handleResponse(res);
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateOrderStatus(id, orderStatus, paymentStatus, note) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ orderStatus, paymentStatus, note }),
    });
    return handleResponse(res);
  },

  async updateOrderShipping(id, carrier, trackingNumber, trackingUrl) {
    const res = await fetch(`${API_BASE}/orders/${id}/shipping`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ carrier, trackingNumber, trackingUrl }),
    });
    return handleResponse(res);
  },

  // Inventory
  async getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inventory?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async adjustInventory(productId, changeAmount, reason) {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId, changeAmount, reason }),
    });
    return handleResponse(res);
  },

  async getInventoryLogs(productId) {
    const query = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE}/inventory/logs${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Customers
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/customers?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createCategory(cat) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(cat),
    });
    return handleResponse(res);
  },

  async updateCategory(id, cat) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(cat),
    });
    return handleResponse(res);
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Collections
  async getCollections() {
    const res = await fetch(`${API_BASE}/collections`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createCollection(col) {
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(col),
    });
    return handleResponse(res);
  },

  async updateCollection(id, col) {
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(col),
    });
    return handleResponse(res);
  },

  async deleteCollection(id) {
    const res = await fetch(`${API_BASE}/collections/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createCoupon(coupon) {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(coupon),
    });
    return handleResponse(res);
  },

  async updateCoupon(id, coupon) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(coupon),
    });
    return handleResponse(res);
  },

  async deleteCoupon(id) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Content CMS
  async getContentSection(section) {
    const res = await fetch(`${API_BASE}/content/${section}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateContentSection(section, content) {
    const res = await fetch(`${API_BASE}/content/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // Reviews
  async getReviews(status = 'all') {
    const res = await fetch(`${API_BASE}/reviews?status=${status}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateReviewStatus(id, status) {
    const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deleteReview(id) {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Staff & Permissions
  async getStaff() {
    const res = await fetch(`${API_BASE}/staff`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createStaff(staffData) {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(staffData),
    });
    return handleResponse(res);
  },

  async updateStaff(id, staffData) {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(staffData),
    });
    return handleResponse(res);
  },

  async deleteStaff(id) {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Activity Logs
  async getActivityLogs() {
    const res = await fetch(`${API_BASE}/activity-logs`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Returns & Refunds
  async getReturns(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/returns${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateReturnStatus(id, updateData) {
    const res = await fetch(`${API_BASE}/returns/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};

