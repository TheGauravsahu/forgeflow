import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  submitForm,
  listSubmissions,
  getAnalytics
} from '../controllers/submissionController';

const router = Router();

router.post('/submit/:formId', submitForm);
router.get('/:formId', authenticateToken, listSubmissions);
router.get('/:formId/analytics', authenticateToken, getAnalytics);

export const submissionsRouter: Router = router;
