import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createFolder,
  listFolders,
  deleteFolder
} from '../controllers/formController';

const router = Router();

router.post('/', authenticateToken, createFolder);
router.get('/', authenticateToken, listFolders);
router.delete('/:id', authenticateToken, deleteFolder);

export const foldersRouter: Router = router;
