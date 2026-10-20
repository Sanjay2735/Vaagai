import { Router } from 'express';
import { subscribe, getSubscribers } from '../controllers/newsletterController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/subscribe', subscribe);
router.get('/subscribers', authenticateToken, requireAdmin, getSubscribers);

export default router;
