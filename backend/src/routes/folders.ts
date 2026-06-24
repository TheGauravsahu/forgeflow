import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Zod schemas
const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required')
});

// POST /api/folders (Create folder - authenticated)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const result = createFolderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const { name } = result.data;

  try {
    const existing = await db.folder.findFirst({
      where: { name, userId: req.user.userId }
    });

    if (existing) {
      return res.status(409).json({ error: 'A folder with this name already exists.' });
    }

    const folder = await db.folder.create({
      data: {
        name,
        userId: req.user.userId
      }
    });

    return res.status(201).json(folder);
  } catch (error) {
    console.error('Create Folder Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/folders (List folders - authenticated)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  try {
    const folders = await db.folder.findMany({
      where: { userId: req.user.userId },
      include: {
        _count: {
          select: { forms: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json(folders);
  } catch (error) {
    console.error('List Folders Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/folders/:id (Delete folder - authenticated)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;

  try {
    const folder = await db.folder.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    await db.folder.delete({
      where: { id }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete Folder Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export const foldersRouter: Router = router;
