import { apiClient } from '../api/client';

export const orderService = {
  /**
   * Place an order through checkout
   */
  async createOrder(orderPayload) {
    return apiClient('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  /**
   * Fetch authenticated customer's past orders
   */
  async getMyOrders() {
    const res = await apiClient('/orders/my');
    return res.orders || [];
  },

  /**
   * Track order by reference code
   */
  async trackOrder(orderNumber, email = '') {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await apiClient(`/orders/${encodeURIComponent(orderNumber)}${query}`);
    return res.order;
  },

  /**
   * Cancel an eligible order
   */
  async cancelOrder(orderNumber, reason) {
    return apiClient(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Submit return claim for delivered order
   */
  async requestReturn(orderNumber, payload) {
    return apiClient(`/orders/${encodeURIComponent(orderNumber)}/return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default orderService;

