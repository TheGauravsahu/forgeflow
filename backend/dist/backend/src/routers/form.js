"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const db_1 = require("../db");
exports.formRouter = (0, trpc_1.router)({
    create: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/forms',
            tags: ['form'],
            summary: 'Create a new form'
        }
    })
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional(),
        folderId: zod_1.z.string().nullable().optional()
    }))
        .output(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        schema: zod_1.z.any(),
        settings: zod_1.z.any(),
        folderId: zod_1.z.string().nullable(),
        published: zod_1.z.boolean(),
        createdAt: zod_1.z.date()
    }))
        .mutation(async ({ input, ctx }) => {
        const form = await db_1.db.form.create({
            data: {
                title: input.title,
                description: input.description || null,
                schema: [],
                settings: {
                    successMessage: 'Thank you! Your submission has been received.',
                    theme: {
                        primaryColor: '#6366f1',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        fontFamily: 'Inter'
                    }
                },
                userId: ctx.user.userId,
                folderId: input.folderId || null
            }
        });
        return form;
    }),
    list: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/forms',
            tags: ['form'],
            summary: 'List user forms'
        }
    })
        .input(zod_1.z.object({
        folderId: zod_1.z.string().nullable().optional(),
        isArchived: zod_1.z.boolean().default(false),
        search: zod_1.z.string().optional()
    }))
        .output(zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        published: zod_1.z.boolean(),
        isArchived: zod_1.z.boolean(),
        folderId: zod_1.z.string().nullable(),
        createdAt: zod_1.z.date(),
        updatedAt: zod_1.z.date(),
        _count: zod_1.z.object({ submissions: zod_1.z.number() })
    })))
        .query(async ({ input, ctx }) => {
        const where = {
            userId: ctx.user.userId,
            isArchived: input.isArchived
        };
        if (input.folderId !== undefined) {
            where.folderId = input.folderId;
        }
        if (input.search) {
            where.title = {
                contains: input.search,
                mode: 'insensitive'
            };
        }
        const forms = await db_1.db.form.findMany({
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
    get: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/forms/{id}',
            tags: ['form'],
            summary: 'Get form by ID (authorized)'
        }
    })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .output(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        schema: zod_1.z.any(),
        settings: zod_1.z.any(),
        published: zod_1.z.boolean(),
        isArchived: zod_1.z.boolean(),
        folderId: zod_1.z.string().nullable(),
        createdAt: zod_1.z.date(),
        updatedAt: zod_1.z.date()
    }))
        .query(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: {
                id: input.id,
                userId: ctx.user.userId
            }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found or you do not have permission to view it.'
            });
        }
        return form;
    }),
    getPublic: trpc_1.publicProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/forms/public/{id}',
            tags: ['form'],
            summary: 'Get published form details (unauthorized)'
        }
    })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .output(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        schema: zod_1.z.any(),
        settings: zod_1.z.any(),
        published: zod_1.z.boolean()
    }))
        .query(async ({ input }) => {
        const form = await db_1.db.form.findFirst({
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
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found or is not published.'
            });
        }
        return form;
    }),
    update: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'PATCH',
            path: '/forms/{id}',
            tags: ['form'],
            summary: 'Update form schema or details'
        }
    })
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().nullable().optional(),
        schema: zod_1.z.any().optional(),
        settings: zod_1.z.any().optional(),
        published: zod_1.z.boolean().optional(),
        isArchived: zod_1.z.boolean().optional(),
        folderId: zod_1.z.string().nullable().optional()
    }))
        .output(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        schema: zod_1.z.any(),
        settings: zod_1.z.any(),
        published: zod_1.z.boolean(),
        isArchived: zod_1.z.boolean(),
        folderId: zod_1.z.string().nullable(),
        updatedAt: zod_1.z.date()
    }))
        .mutation(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: { id: input.id, userId: ctx.user.userId }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found or permission denied.'
            });
        }
        const updateData = {};
        if (input.title !== undefined)
            updateData.title = input.title;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.schema !== undefined) {
            const validatedSchema = zod_1.z.array(zod_1.z.any()).safeParse(input.schema);
            if (!validatedSchema.success) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid schema format.'
                });
            }
            updateData.schema = input.schema;
        }
        if (input.settings !== undefined)
            updateData.settings = input.settings;
        if (input.published !== undefined)
            updateData.published = input.published;
        if (input.isArchived !== undefined)
            updateData.isArchived = input.isArchived;
        if (input.folderId !== undefined)
            updateData.folderId = input.folderId;
        const updatedForm = await db_1.db.form.update({
            where: { id: input.id },
            data: updateData
        });
        if (input.schema !== undefined) {
            const lastVersion = await db_1.db.formVersion.findFirst({
                where: { formId: input.id },
                orderBy: { version: 'desc' }
            });
            const nextVersionNumber = lastVersion ? lastVersion.version + 1 : 1;
            await db_1.db.formVersion.create({
                data: {
                    formId: input.id,
                    version: nextVersionNumber,
                    schema: input.schema
                }
            });
        }
        return updatedForm;
    }),
    duplicate: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/forms/{id}/duplicate',
            tags: ['form'],
            summary: 'Duplicate form'
        }
    })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .output(zod_1.z.object({ id: zod_1.z.string(), title: zod_1.z.string() }))
        .mutation(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: { id: input.id, userId: ctx.user.userId }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found.'
            });
        }
        const duplicatedForm = await db_1.db.form.create({
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
    delete: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'DELETE',
            path: '/forms/{id}',
            tags: ['form'],
            summary: 'Delete form permanently'
        }
    })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .output(zod_1.z.object({ success: zod_1.z.boolean() }))
        .mutation(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: { id: input.id, userId: ctx.user.userId }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found.'
            });
        }
        await db_1.db.form.delete({
            where: { id: input.id }
        });
        return { success: true };
    }),
    createFolder: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/folders',
            tags: ['folder'],
            summary: 'Create a new folder'
        }
    })
        .input(zod_1.z.object({ name: zod_1.z.string().min(1) }))
        .output(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }))
        .mutation(async ({ input, ctx }) => {
        const existing = await db_1.db.folder.findFirst({
            where: { name: input.name, userId: ctx.user.userId }
        });
        if (existing) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'A folder with this name already exists.'
            });
        }
        const folder = await db_1.db.folder.create({
            data: {
                name: input.name,
                userId: ctx.user.userId
            }
        });
        return folder;
    }),
    getFolders: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/folders',
            tags: ['folder'],
            summary: 'List user folders'
        }
    })
        .input(zod_1.z.void())
        .output(zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        _count: zod_1.z.object({ forms: zod_1.z.number() })
    })))
        .query(async ({ ctx }) => {
        const folders = await db_1.db.folder.findMany({
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
    deleteFolder: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'DELETE',
            path: '/folders/{id}',
            tags: ['folder'],
            summary: 'Delete folder'
        }
    })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .output(zod_1.z.object({ success: zod_1.z.boolean() }))
        .mutation(async ({ input, ctx }) => {
        const folder = await db_1.db.folder.findFirst({
            where: { id: input.id, userId: ctx.user.userId }
        });
        if (!folder) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Folder not found.'
            });
        }
        await db_1.db.folder.delete({
            where: { id: input.id }
        });
        return { success: true };
    })
});
