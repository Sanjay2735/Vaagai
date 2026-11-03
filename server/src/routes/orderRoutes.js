import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestOrderReturn,
} from '../controllers/orderController.js';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Place order (Supports both logged in customers and guest checkout via optionalAuth)
router.post('/', optionalAuth, createOrder);

// Customer order history
router.get('/my', authenticateToken, getMyOrders);

// Track specific order
router.get('/:orderNumber', optionalAuth, getOrderByNumber);

// Post-purchase actions: Cancel & Return
router.post('/:orderNumber/cancel', optionalAuth, cancelOrder);
router.post('/:orderNumber/return', optionalAuth, requestOrderReturn);

// Admin-only management routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.patch('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;
