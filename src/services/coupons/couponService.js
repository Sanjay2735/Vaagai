import { apiClient } from '../api/client';

export const couponService = {
  /**
   * Validate a promotional coupon code against order subtotal
   */
  async validate(code, cartTotal) {
    return apiClient('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim(), cartTotal }),
    });
  },
};

export default couponService;

