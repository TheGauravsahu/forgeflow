import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAdminStats, deleteUserByAdmin } from '../controllers/adminController';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getAdminStats);
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUserByAdmin);

export const adminRouter: Router = router;
