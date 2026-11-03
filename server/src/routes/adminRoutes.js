import { Router } from 'express';
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

// Public Admin Auth with brute-force rate limiter
router.post('/auth/login', loginRateLimiter, admin.adminLogin);
router.post('/auth/forgot-password', admin.forgotPassword);
router.post('/auth/reset-password', admin.resetPassword);

// Live Real-Time Server-Sent Events (SSE) Stream
router.get('/realtime', admin.handleRealtimeSSE);

// Protected Admin Auth Check
router.get('/auth/me', authenticateToken, requireAdmin, admin.getAdminMe);

// 1. Dashboard Overview
router.get('/overview', authenticateToken, requireAdmin, admin.getOverview);

// 2. Product Management
router.get('/products', authenticateToken, requireAdmin, admin.getAdminProducts);
router.get('/products/:id', authenticateToken, requireAdmin, admin.getAdminProductById);
router.post(
  '/products',
  authenticateToken,
  requireRole('super_admin', 'product_manager'),
  admin.createAdminProduct
);
router.put(
  '/products/:id',
  authenticateToken,
  requireRole('super_admin', 'product_manager'),
  admin.updateAdminProduct
);
router.delete(
  '/products/:id',
  authenticateToken,
  requireRole('super_admin', 'product_manager'),
  admin.deleteAdminProduct
);
router.post(
  '/products/bulk',
  authenticateToken,
  requireRole('super_admin', 'product_manager'),
  admin.bulkUpdateProducts
);

// 3. Category Management
router.get('/categories', authenticateToken, requireAdmin, admin.getAdminCategories);
router.post('/categories', authenticateToken, requireRole('super_admin', 'product_manager'), admin.createAdminCategory);
router.put('/categories/:id', authenticateToken, requireRole('super_admin', 'product_manager'), admin.updateAdminCategory);
router.delete('/categories/:id', authenticateToken, requireRole('super_admin'), admin.deleteAdminCategory);

// 4. Collections Management
router.get('/collections', authenticateToken, requireAdmin, admin.getAdminCollections);
router.post('/collections', authenticateToken, requireRole('super_admin', 'product_manager'), admin.createAdminCollection);
router.put('/collections/:id', authenticateToken, requireRole('super_admin', 'product_manager'), admin.updateAdminCollection);
router.delete('/collections/:id', authenticateToken, requireRole('super_admin'), admin.deleteAdminCollection);

// 5. Order Management
router.get('/orders', authenticateToken, requireAdmin, admin.getAdminOrders);
router.get('/orders/:id', authenticateToken, requireAdmin, admin.getAdminOrderById);
router.patch('/orders/:id/status', authenticateToken, requireRole('super_admin', 'order_manager'), admin.updateAdminOrderStatus);
router.patch('/orders/:id/shipping', authenticateToken, requireRole('super_admin', 'order_manager'), admin.updateAdminOrderShipping);
router.put('/orders/:id/shipping', authenticateToken, requireRole('super_admin', 'order_manager'), admin.updateAdminOrderShipping);

// 6. Inventory Management
router.get('/inventory', authenticateToken, requireAdmin, admin.getAdminInventory);
router.post('/inventory/adjust', authenticateToken, requireRole('super_admin', 'product_manager', 'order_manager'), admin.adjustInventory);
router.get('/inventory/logs', authenticateToken, requireAdmin, admin.getInventoryLogs);

// 7. Customers
router.get('/customers', authenticateToken, requireAdmin, admin.getAdminCustomers);

// 8. Coupons
router.get('/coupons', authenticateToken, requireAdmin, admin.getAdminCoupons);
router.post('/coupons', authenticateToken, requireRole('super_admin', 'product_manager'), admin.createAdminCoupon);
router.put('/coupons/:id', authenticateToken, requireRole('super_admin', 'product_manager'), admin.updateAdminCoupon);
router.delete('/coupons/:id', authenticateToken, requireRole('super_admin'), admin.deleteAdminCoupon);

// 9. Homepage & Content CMS
router.get('/content/:section', authenticateToken, requireAdmin, admin.getContentSection);
router.put('/content/:section', authenticateToken, requireRole('super_admin', 'content_manager'), admin.updateContentSection);

// 10. Reviews Moderation
router.get('/reviews', authenticateToken, requireAdmin, admin.getAdminReviews);
router.patch('/reviews/:id/status', authenticateToken, requireRole('super_admin', 'content_manager'), admin.updateReviewStatus);
router.delete('/reviews/:id', authenticateToken, requireRole('super_admin'), admin.deleteReview);

// 11. Staff & Permissions
router.get('/staff', authenticateToken, requireRole('super_admin'), admin.getStaff);
router.post('/staff', authenticateToken, requireRole('super_admin'), admin.createStaff);
router.put('/staff/:id', authenticateToken, requireRole('super_admin'), admin.updateStaff);
router.delete('/staff/:id', authenticateToken, requireRole('super_admin'), admin.deleteStaff);

// 12. Activity Logs
router.get('/activity-logs', authenticateToken, requireRole('super_admin'), admin.getActivityLogs);

// 13. Returns & Refunds
router.get('/returns', authenticateToken, requireRole('super_admin', 'order_manager'), admin.getAdminReturns);
router.patch('/returns/:id/status', authenticateToken, requireRole('super_admin', 'order_manager'), admin.updateAdminReturnStatus);

// 14. Settings
router.get('/settings', authenticateToken, requireAdmin, admin.getStoreSettings);
router.put('/settings', authenticateToken, requireRole('super_admin'), admin.updateStoreSettings);

export default router;

