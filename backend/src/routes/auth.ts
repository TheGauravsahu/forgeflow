import { Router } from 'express';
import { authenticateToken, rateLimit } from '../middleware/auth';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser
} from '../controllers/authController';

const router = Router();
const authRateLimit = rateLimit(10, 60000);

router.post('/register', authRateLimit, registerUser);
router.post('/login', authRateLimit, loginUser);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/update', authenticateToken, updateUser);

export const authRouter: Router = router;
