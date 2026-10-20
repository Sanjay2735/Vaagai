import { Router } from 'express';
import { submitInquiry, getInquiries } from '../controllers/contactController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submitInquiry);
router.get('/inquiries', authenticateToken, requireAdmin, getInquiries);

export default router;
