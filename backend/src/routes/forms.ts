import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Zod validation schemas
const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  folderId: z.string().nullable().optional(),
  schema: z.array(z.any()).optional(),
  settings: z.any().optional()
});

const updateFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  schema: z.any().optional(),
  settings: z.any().optional(),
  published: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  folderId: z.string().nullable().optional()
});

// POST /api/forms (Create form - authenticated)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const result = createFormSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const input = result.data;

  try {
    const form = await db.form.create({
      data: {
        title: input.title,
        description: input.description || null,
        schema: input.schema || [],
        settings: input.settings || {
          successMessage: 'Thank you! Your submission has been received.',
          theme: {
            primaryColor: '#f59e0b',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            fontFamily: 'Geist'
          }
        },
        userId: req.user.userId,
        folderId: input.folderId || null
      }
    });

    return res.status(201).json(form);
  } catch (error: any) {
    console.error('Create Form Error:', error);
    return res.status(500).json({ error: 'Internal server error while creating form.' });
  }
});

// GET /api/forms (List user forms - authenticated)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const folderId = req.query.folderId as string | undefined;
  const isArchived = req.query.isArchived === 'true';
  const search = req.query.search as string | undefined;

  const where: any = {
    userId: req.user.userId,
    isArchived
  };

  if (folderId !== undefined) {
    where.folderId = folderId === 'root' || folderId === 'null' ? null : folderId;
  }

  if (search) {
    where.title = {
      contains: search,
      mode: 'insensitive'
    };
  }

  try {
    const forms = await db.form.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return res.status(200).json(forms);
  } catch (error: any) {
    console.error('List Forms Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/forms/public/:id (Get public form details - unauthorized/optional auth)
router.get('/public/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const form = await db.form.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        schema: true,
        settings: true,
        published: true,
        isArchived: true,
        userId: true
      }
    });

    if (!form || form.isArchived) {
      return res.status(404).json({ error: 'Form not found or is archived.' });
    }

    if (!form.published) {
      const isOwner = req.user && req.user.userId === form.userId;
      if (!isOwner) {
        return res.status(404).json({ error: 'Form not published.' });
      }
    }

    return res.status(200).json(form);
  } catch (error: any) {
    console.error('Get Public Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/forms/:id (Get form by ID - authenticated)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;

  try {
    const form = await db.form.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied.' });
    }

    return res.status(200).json(form);
  } catch (error: any) {
    console.error('Get Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/forms/:id (Update form - authenticated)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;

  const result = updateFormSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
  }

  const input = result.data;

  try {
    const form = await db.form.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or permission denied.' });
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.schema !== undefined) {
      const validatedSchema = z.array(z.any()).safeParse(input.schema);
      if (!validatedSchema.success) {
        return res.status(400).json({ error: 'Invalid schema format.' });
      }
      updateData.schema = input.schema;
    }
    if (input.settings !== undefined) updateData.settings = input.settings;
    if (input.published !== undefined) updateData.published = input.published;
    if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;
    if (input.folderId !== undefined) updateData.folderId = input.folderId;

    const updatedForm = await db.form.update({
      where: { id },
      data: updateData
    });

    if (input.schema !== undefined) {
      const lastVersion = await db.formVersion.findFirst({
        where: { formId: id },
        orderBy: { version: 'desc' }
      });

      const nextVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

      await db.formVersion.create({
        data: {
          formId: id,
          version: nextVersionNumber,
          schema: input.schema
        }
      });
    }

    return res.status(200).json(updatedForm);
  } catch (error: any) {
    console.error('Update Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/forms/:id/duplicate (Duplicate Form - authenticated)
router.post('/:id/duplicate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;

  try {
    const form = await db.form.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const duplicatedForm = await db.form.create({
      data: {
        title: `${form.title} (Copy)`,
        description: form.description,
        schema: form.schema || [],
        settings: form.settings || {},
        userId: req.user.userId,
        folderId: form.folderId
      }
    });

    return res.status(201).json({
      id: duplicatedForm.id,
      title: duplicatedForm.title
    });
  } catch (error: any) {
    console.error('Duplicate Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/forms/:id (Delete Form - authenticated)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;

  try {
    const form = await db.form.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    await db.form.delete({
      where: { id }
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Delete Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export const formsRouter: Router = router;
