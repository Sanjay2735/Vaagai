import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
  getCustomerWishlist,
  addToCustomerWishlist,
  removeFromCustomerWishlist,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

// Saved Addresses
router.get('/addresses', authenticateToken, getCustomerAddresses);
router.post('/addresses', authenticateToken, addCustomerAddress);
router.delete('/addresses/:id', authenticateToken, deleteCustomerAddress);

// Synchronized Customer Wishlist
router.get('/wishlist', authenticateToken, getCustomerWishlist);
router.post('/wishlist', authenticateToken, addToCustomerWishlist);
router.delete('/wishlist/:productId', authenticateToken, removeFromCustomerWishlist);

export default router;
