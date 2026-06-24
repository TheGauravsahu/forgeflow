import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { db } from '../db';

export const formRouter = router({
  create: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/forms',
        tags: ['form'],
        summary: 'Create a new form'
      }
    })
    .input(z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      folderId: z.string().nullable().optional(),
      schema: z.array(z.any()).optional(),
      settings: z.any().optional()
    }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      schema: z.any(),
      settings: z.any(),
      folderId: z.string().nullable(),
      published: z.boolean(),
      createdAt: z.date()
    }))
    .mutation(async ({ input, ctx }) => {
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
          userId: ctx.user.userId,
          folderId: input.folderId || null
        }
      });
      return form;
    }),

  list: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/forms',
        tags: ['form'],
        summary: 'List user forms'
      }
    })
    .input(z.object({
      folderId: z.string().optional(),
      isArchived: z.boolean().default(false),
      search: z.string().optional()
    }))
    .output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      published: z.boolean(),
      isArchived: z.boolean(),
      folderId: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      _count: z.object({ submissions: z.number() })
    })))
    .query(async ({ input, ctx }) => {
      const where: any = {
        userId: ctx.user.userId,
        isArchived: input.isArchived
      };

      if (input.folderId !== undefined) {
        where.folderId = input.folderId === 'root' || input.folderId === 'null' ? null : input.folderId;
      }

      if (input.search) {
        where.title = {
          contains: input.search,
          mode: 'insensitive'
        };
      }

      const forms = await db.form.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { submissions: true }
          }
        }
      });
      return forms;
    }),

  get: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/forms/{id}',
        tags: ['form'],
        summary: 'Get form by ID (authorized)'
      }
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      schema: z.any(),
      settings: z.any(),
      published: z.boolean(),
      isArchived: z.boolean(),
      folderId: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    }))
    .query(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.userId
        }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found or you do not have permission to view it.'
        });
      }

      return form;
    }),

  getPublic: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/forms/public/{id}',
        tags: ['form'],
        summary: 'Get published form details (unauthorized)'
      }
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      schema: z.any(),
      settings: z.any(),
      published: z.boolean()
    }))
    .query(async ({ input }) => {
      const form = await db.form.findFirst({
        where: {
          id: input.id,
          published: true,
          isArchived: false
        },
        select: {
          id: true,
          title: true,
          description: true,
          schema: true,
          settings: true,
          published: true
        }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found or is not published.'
        });
      }

      return form;
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/forms/{id}',
        tags: ['form'],
        summary: 'Update form schema or details'
      }
    })
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      schema: z.any().optional(),
      settings: z.any().optional(),
      published: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      folderId: z.string().nullable().optional()
    }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      schema: z.any(),
      settings: z.any(),
      published: z.boolean(),
      isArchived: z.boolean(),
      folderId: z.string().nullable(),
      updatedAt: z.date()
    }))
    .mutation(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: { id: input.id, userId: ctx.user.userId }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found or permission denied.'
        });
      }

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.schema !== undefined) {
        const validatedSchema = z.array(z.any()).safeParse(input.schema);
        if (!validatedSchema.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid schema format.'
          });
        }
        updateData.schema = input.schema;
      }
      if (input.settings !== undefined) updateData.settings = input.settings;
      if (input.published !== undefined) updateData.published = input.published;
      if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;
      if (input.folderId !== undefined) updateData.folderId = input.folderId;

      const updatedForm = await db.form.update({
        where: { id: input.id },
        data: updateData
      });

      if (input.schema !== undefined) {
        const lastVersion = await db.formVersion.findFirst({
          where: { formId: input.id },
          orderBy: { version: 'desc' }
        });

        const nextVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

        await db.formVersion.create({
          data: {
            formId: input.id,
            version: nextVersionNumber,
            schema: input.schema
          }
        });
      }

      return updatedForm;
    }),

  duplicate: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/forms/{id}/duplicate',
        tags: ['form'],
        summary: 'Duplicate form'
      }
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: { id: input.id, userId: ctx.user.userId }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found.'
        });
      }

      const duplicatedForm = await db.form.create({
        data: {
          title: `${form.title} (Copy)`,
          description: form.description,
          schema: form.schema || [],
          settings: form.settings || {},
          userId: ctx.user.userId,
          folderId: form.folderId
        }
      });

      return {
        id: duplicatedForm.id,
        title: duplicatedForm.title
      };
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/forms/{id}',
        tags: ['form'],
        summary: 'Delete form permanently'
      }
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: { id: input.id, userId: ctx.user.userId }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found.'
        });
      }

      await db.form.delete({
        where: { id: input.id }
      });

      return { success: true };
    }),

  createFolder: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/folders',
        tags: ['folder'],
        summary: 'Create a new folder'
      }
    })
    .input(z.object({ name: z.string().min(1) }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await db.folder.findFirst({
        where: { name: input.name, userId: ctx.user.userId }
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A folder with this name already exists.'
        });
      }

      const folder = await db.folder.create({
        data: {
          name: input.name,
          userId: ctx.user.userId
        }
      });
      return folder;
    }),

  getFolders: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/folders',
        tags: ['folder'],
        summary: 'List user folders'
      }
    })
    .input(z.void())
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      _count: z.object({ forms: z.number() })
    })))
    .query(async ({ ctx }) => {
      const folders = await db.folder.findMany({
        where: { userId: ctx.user.userId },
        include: {
          _count: {
            select: { forms: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      return folders;
    }),

  deleteFolder: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/folders/{id}',
        tags: ['folder'],
        summary: 'Delete folder'
      }
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const folder = await db.folder.findFirst({
        where: { id: input.id, userId: ctx.user.userId }
      });

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found.'
        });
      }

      await db.folder.delete({
        where: { id: input.id }
      });

      return { success: true };
    })
});
