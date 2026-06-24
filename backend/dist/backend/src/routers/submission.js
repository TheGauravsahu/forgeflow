"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const shared_1 = require("@forgeflow/shared");
const trpc_1 = require("../trpc");
const db_1 = require("../db");
exports.submissionRouter = (0, trpc_1.router)({
    submit: trpc_1.publicProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/forms/submit/{formId}',
            tags: ['submission'],
            summary: 'Submit answers to a form'
        }
    })
        .input(zod_1.z.object({
        formId: zod_1.z.string(),
        data: zod_1.z.any()
    }))
        .output(zod_1.z.object({
        success: zod_1.z.boolean(),
        submissionId: zod_1.z.string()
    }))
        .mutation(async ({ input }) => {
        const form = await db_1.db.form.findFirst({
            where: {
                id: input.formId,
                published: true,
                isArchived: false
            }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'This form does not exist or is not accepting submissions.'
            });
        }
        const fields = form.schema;
        const formZodSchema = (0, shared_1.buildFormZodSchema)(fields);
        const parseResult = formZodSchema.safeParse(input.data);
        if (!parseResult.success) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Validation failed.',
                cause: parseResult.error.flatten().fieldErrors
            });
        }
        const submission = await db_1.db.submission.create({
            data: {
                formId: input.formId,
                data: parseResult.data
            }
        });
        return {
            success: true,
            submissionId: submission.id
        };
    }),
    list: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/forms/{formId}/submissions',
            tags: ['submission'],
            summary: 'List submissions for a form'
        }
    })
        .input(zod_1.z.object({
        formId: zod_1.z.string(),
        take: zod_1.z.number().default(50),
        skip: zod_1.z.number().default(0)
    }))
        .output(zod_1.z.object({
        submissions: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            data: zod_1.z.any(),
            createdAt: zod_1.z.date()
        })),
        totalCount: zod_1.z.number()
    }))
        .query(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: { id: input.formId, userId: ctx.user.userId }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found.'
            });
        }
        const [submissions, totalCount] = await Promise.all([
            db_1.db.submission.findMany({
                where: { formId: input.formId },
                orderBy: { createdAt: 'desc' },
                take: input.take,
                skip: input.skip
            }),
            db_1.db.submission.count({
                where: { formId: input.formId }
            })
        ]);
        return {
            submissions,
            totalCount
        };
    }),
    getAnalytics: trpc_1.protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/forms/{formId}/analytics',
            tags: ['analytics'],
            summary: 'Get submission analytics for a form'
        }
    })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .output(zod_1.z.object({
        totalSubmissions: zod_1.z.number(),
        timeline: zod_1.z.array(zod_1.z.object({
            date: zod_1.z.string(),
            count: zod_1.z.number()
        })),
        fieldAnalytics: zod_1.z.any()
    }))
        .query(async ({ input, ctx }) => {
        const form = await db_1.db.form.findFirst({
            where: { id: input.formId, userId: ctx.user.userId }
        });
        if (!form) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Form not found.'
            });
        }
        const submissions = await db_1.db.submission.findMany({
            where: { formId: input.formId },
            orderBy: { createdAt: 'asc' }
        });
        const totalSubmissions = submissions.length;
        const timelineMap = new Map();
        submissions.forEach(sub => {
            const dateStr = sub.createdAt.toISOString().split('T')[0];
            timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
        });
        const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
            date,
            count
        }));
        const fields = form.schema;
        const fieldAnalytics = {};
        fields.forEach(field => {
            if (['heading', 'divider', 'markdown', 'richtext'].includes(field.type)) {
                return;
            }
            const id = field.id;
            const type = field.type;
            const label = field.properties.label;
            if (['rating', 'slider', 'number'].includes(type)) {
                let sum = 0;
                let count = 0;
                submissions.forEach(sub => {
                    const val = Number(sub.data[id]);
                    if (!isNaN(val) && val !== null && val !== undefined) {
                        sum += val;
                        count++;
                    }
                });
                fieldAnalytics[id] = {
                    type,
                    label,
                    average: count > 0 ? Number((sum / count).toFixed(2)) : 0,
                    responsesCount: count
                };
            }
            else if (['select', 'radio', 'checkbox', 'multiselect'].includes(type)) {
                const distribution = {};
                if (field.properties.options) {
                    field.properties.options.forEach((opt) => {
                        distribution[opt.value] = 0;
                    });
                }
                submissions.forEach(sub => {
                    const val = sub.data[id];
                    if (val === undefined || val === null)
                        return;
                    if (Array.isArray(val)) {
                        val.forEach(v => {
                            const key = String(v);
                            distribution[key] = (distribution[key] || 0) + 1;
                        });
                    }
                    else {
                        const key = String(val);
                        distribution[key] = (distribution[key] || 0) + 1;
                    }
                });
                fieldAnalytics[id] = {
                    type,
                    label,
                    distribution,
                    responsesCount: submissions.filter(sub => sub.data[id] !== undefined).length
                };
            }
            else if (['toggle'].includes(type)) {
                let trueCount = 0;
                let falseCount = 0;
                submissions.forEach(sub => {
                    const val = sub.data[id];
                    if (val === true)
                        trueCount++;
                    if (val === false)
                        falseCount++;
                });
                fieldAnalytics[id] = {
                    type,
                    label,
                    distribution: {
                        'true': trueCount,
                        'false': falseCount
                    },
                    responsesCount: trueCount + falseCount
                };
            }
        });
        return {
            totalSubmissions,
            timeline,
            fieldAnalytics
        };
    })
});
