import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { buildFormZodSchema, FormField } from '../types/shared';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { db } from '../db';


// Simple in-memory rate limit cache
const submissionRateLimitCache = new Map<string, { count: number; resetAt: number }>();

// List of common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'tempmail.com',
  'dispostable.com',
  'guerrillamail.com',
  'sharklasers.com',
  'getairmail.com',
  'burnermail.io',
  'trashmail.com'
]);


export const submissionRouter = router({
  submit: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/forms/submit/{formId}',
        tags: ['submission'],
        summary: 'Submit answers to a form'
      }
    })
    .input(z.object({
      formId: z.string(),
      data: z.any(),
      honeypot: z.string().optional()
    }))
    .output(z.object({
      success: z.boolean(),
      submissionId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Honeypot Check
      if (input.honeypot) {
        // Silently discard spam submission
        return {
          success: true,
          submissionId: 'spam_discarded'
        };
      }

      // 2. IP Rate Limiting (max 5 submissions per minute per IP per form)
      const rateLimitKey = `${ctx.ip}:${input.formId}`;
      const now = Date.now();
      const limit = submissionRateLimitCache.get(rateLimitKey);

      if (limit) {
        if (now < limit.resetAt) {
          if (limit.count >= 5) {
            throw new TRPCError({
              code: 'TOO_MANY_REQUESTS',
              message: 'Rate limit exceeded. Please try again in 1 minute.'
            });
          }
          limit.count += 1;
        } else {
          submissionRateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
        }
      } else {
        submissionRateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
      }

      // 3. Retrieve Form
      const form = await db.form.findFirst({
        where: {
          id: input.formId,
          published: true,
          isArchived: false
        }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This form does not exist or is not accepting submissions.'
        });
      }


      // 5. Disposable Email Domain Validation
      const formFields = (form.schema as any) as FormField[];
      for (const field of formFields) {
        if (field.type === 'email') {
          const emailVal = input.data[field.id];
          if (emailVal && typeof emailVal === 'string') {
            const domain = emailVal.split('@')[1]?.toLowerCase();
            if (domain && DISPOSABLE_DOMAINS.has(domain)) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Submissions using disposable email addresses are not permitted.'
              });
            }
          }
        }
      }

      // 6. Schema Zod Validation
      const formZodSchema = buildFormZodSchema(formFields);
      const parseResult = formZodSchema.safeParse(input.data);
      if (!parseResult.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Validation failed.',
          cause: parseResult.error.flatten().fieldErrors
        });
      }

      // 7. Save Submission
      const submission = await db.submission.create({
        data: {
          formId: input.formId,
          data: parseResult.data as any
        }
      });

      return {
        success: true,
        submissionId: submission.id
      };
    }),

  list: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/forms/{formId}/submissions',
        tags: ['submission'],
        summary: 'List submissions for a form'
      }
    })
    .input(z.object({
      formId: z.string(),
      take: z.number().default(50),
      skip: z.number().default(0)
    }))
    .output(z.object({
      submissions: z.array(z.object({
        id: z.string(),
        data: z.any(),
        createdAt: z.date()
      })),
      totalCount: z.number()
    }))
    .query(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: { id: input.formId, userId: ctx.user.userId }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found.'
        });
      }

      const [submissions, totalCount] = await Promise.all([
        db.submission.findMany({
          where: { formId: input.formId },
          orderBy: { createdAt: 'desc' },
          take: input.take,
          skip: input.skip
        }),
        db.submission.count({
          where: { formId: input.formId }
        })
      ]);

      return {
        submissions,
        totalCount
      };
    }),

  getAnalytics: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/forms/{formId}/analytics',
        tags: ['analytics'],
        summary: 'Get submission analytics for a form'
      }
    })
    .input(z.object({ formId: z.string() }))
    .output(z.object({
      totalSubmissions: z.number(),
      timeline: z.array(z.object({
        date: z.string(),
        count: z.number()
      })),
      fieldAnalytics: z.any()
    }))
    .query(async ({ input, ctx }) => {
      const form = await db.form.findFirst({
        where: { id: input.formId, userId: ctx.user.userId }
      });

      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found.'
        });
      }

      const submissions = await db.submission.findMany({
        where: { formId: input.formId },
        orderBy: { createdAt: 'asc' }
      });

      const totalSubmissions = submissions.length;

      const timelineMap = new Map<string, number>();
      submissions.forEach(sub => {
        const dateStr = sub.createdAt.toISOString().split('T')[0];
        timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
      });

      const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
        date,
        count
      }));

      const fields = (form.schema as any) as FormField[];
      const fieldAnalytics: Record<string, any> = {};

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
            const val = Number((sub.data as any)[id]);
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
        } else if (['select', 'radio', 'checkbox', 'multiselect'].includes(type)) {
          const distribution: Record<string, number> = {};
          
          if (field.properties.options) {
            field.properties.options.forEach((opt: any) => {
              distribution[opt.value] = 0;
            });
          }

          submissions.forEach(sub => {
            const val = (sub.data as any)[id];
            if (val === undefined || val === null) return;

            if (Array.isArray(val)) {
              val.forEach(v => {
                const key = String(v);
                distribution[key] = (distribution[key] || 0) + 1;
              });
            } else {
              const key = String(val);
              distribution[key] = (distribution[key] || 0) + 1;
            }
          });

          fieldAnalytics[id] = {
            type,
            label,
            distribution,
            responsesCount: submissions.filter(sub => (sub.data as any)[id] !== undefined).length
          };
        } else if (['toggle'].includes(type)) {
          let trueCount = 0;
          let falseCount = 0;
          submissions.forEach(sub => {
            const val = (sub.data as any)[id];
            if (val === true) trueCount++;
            if (val === false) falseCount++;
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
