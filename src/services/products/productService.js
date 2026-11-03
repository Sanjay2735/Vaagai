import { apiClient } from '../api/client';
import { COLLECTION_PRODUCTS, findProductAnywhere } from '../../data/collectionData';

export const productService = {
  /**
   * Fetch all products with optional filtering
   */
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiClient(`/products?${query}`);
      return res.products || COLLECTION_PRODUCTS;
    } catch {
      // Fallback to offline catalog if backend unreachable
      return COLLECTION_PRODUCTS;
    }
  },

  /**
   * Fetch a single product by slug or id
   */
  async getProduct(slugOrId) {
    try {
      const res = await apiClient(`/products/${slugOrId}`);
      return res.product || findProductAnywhere(slugOrId);
    } catch {
      return findProductAnywhere(slugOrId);
    }
  },

  /**
   * Fetch craft categories
   */
  async getCategories() {
    try {
      const res = await apiClient('/products/categories');
      return res.categories || [];
    } catch {
      return [];
    }
  },
};

export default productService;

