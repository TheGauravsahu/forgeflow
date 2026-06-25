import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

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

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required')
});

// Forms
export const createForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const listForms = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const getPublicForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const getForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const updateForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const duplicateForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const deleteForm = async (req: AuthenticatedRequest, res: Response) => {
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
};

// Folders
export const createFolder = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const listFolders = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const listVersions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id } = req.params;
  try {
    const form = await db.form.findFirst({
      where: { id, userId: req.user.userId }
    });
    if (!form) return res.status(404).json({ error: 'Form not found.' });

    const versions = await db.formVersion.findMany({
      where: { formId: id },
      orderBy: { version: 'desc' }
    });
    return res.status(200).json(versions);
  } catch (error) {
    console.error('List Versions Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const rollbackVersion = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { id, versionId } = req.params;
  try {
    const form = await db.form.findFirst({
      where: { id, userId: req.user.userId }
    });
    if (!form) return res.status(404).json({ error: 'Form not found.' });

    const targetVersion = await db.formVersion.findFirst({
      where: { id: versionId, formId: id }
    });
    if (!targetVersion) return res.status(404).json({ error: 'Version not found.' });

    const updatedForm = await db.form.update({
      where: { id },
      data: { schema: targetVersion.schema as any }
    });

    const lastVersion = await db.formVersion.findFirst({
      where: { formId: id },
      orderBy: { version: 'desc' }
    });
    const nextVersionNumber = lastVersion ? lastVersion.version + 1 : 1;
    await db.formVersion.create({
      data: {
        formId: id,
        version: nextVersionNumber,
        schema: targetVersion.schema as any
      }
    });

    return res.status(200).json(updatedForm);
  } catch (error) {
    console.error('Rollback Version Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
