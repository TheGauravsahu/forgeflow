import { Router } from 'express';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth';
import {
  createForm,
  listForms,
  getPublicForm,
  getForm,
  updateForm,
  duplicateForm,
  deleteForm
} from '../controllers/formController';

const router = Router();

router.post('/', authenticateToken, createForm);
router.get('/', authenticateToken, listForms);
router.get('/public/:id', optionalAuthenticate, getPublicForm);
router.get('/:id', authenticateToken, getForm);
router.put('/:id', authenticateToken, updateForm);
router.post('/:id/duplicate', authenticateToken, duplicateForm);
router.delete('/:id', authenticateToken, deleteForm);

export const formsRouter: Router = router;
