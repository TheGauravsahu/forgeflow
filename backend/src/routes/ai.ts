import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  generateForm,
  generateTheme,
  analyzeSubmissions
} from '../controllers/aiController';

const router = Router();

router.post('/generate-form', authenticateToken, generateForm);
router.post('/generate-theme', authenticateToken, generateTheme);
router.post('/analyze-submissions', authenticateToken, analyzeSubmissions);

export const aiRouter: Router = router;
