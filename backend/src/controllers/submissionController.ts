import { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { buildFormZodSchema, FormField } from '../types/shared';
import { z } from 'zod';

// Simple in-memory rate limit cache for form submissions
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

export const submitForm = async (req: Request, res: Response) => {
  const { formId } = req.params;
  const { data, honeypot } = req.body;

  // 1. Honeypot Check
  if (honeypot) {
    return res.status(200).json({
      success: true,
      submissionId: 'spam_discarded'
    });
  }

  // 2. IP Rate Limiting (max 5 submissions per minute per IP per form)
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const rateLimitKey = `${ip}:${formId}`;
  const now = Date.now();
  const limit = submissionRateLimitCache.get(rateLimitKey);

  if (limit) {
    if (now < limit.resetAt) {
      if (limit.count >= 5) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again in 1 minute.' });
      }
      limit.count += 1;
    } else {
      submissionRateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
    }
  } else {
    submissionRateLimitCache.set(rateLimitKey, { count: 1, resetAt: now + 60000 });
  }

  try {
    // 3. Retrieve Form
    const form = await db.form.findFirst({
      where: {
        id: formId,
        published: true,
        isArchived: false
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'This form does not exist or is not accepting submissions.' });
    }

    // 4. Disposable Email Domain Validation
    const formFields = (form.schema as any) as FormField[];
    for (const field of formFields) {
      if (field.type === 'email') {
        const emailVal = data?.[field.id];
        if (emailVal && typeof emailVal === 'string') {
          const domain = emailVal.split('@')[1]?.toLowerCase();
          if (domain && DISPOSABLE_DOMAINS.has(domain)) {
            return res.status(400).json({ error: 'Submissions using disposable email addresses are not permitted.' });
          }
        }
      }
    }

    // 5. Schema Zod Validation
    const formZodSchema = buildFormZodSchema(formFields);
    const parseResult = formZodSchema.safeParse(data);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed.', details: parseResult.error.flatten().fieldErrors });
    }

    // 6. Save Submission
    const submission = await db.submission.create({
      data: {
        formId,
        data: parseResult.data as any
      }
    });

    return res.status(201).json({
      success: true,
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Submit Form Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const listSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { formId } = req.params;

  const take = Number(req.query.take) || 50;
  const skip = Number(req.query.skip) || 0;

  try {
    const form = await db.form.findFirst({
      where: { id: formId, userId: req.user.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const [submissions, totalCount] = await Promise.all([
      db.submission.findMany({
        where: { formId },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      db.submission.count({
        where: { formId }
      })
    ]);

    return res.status(200).json({
      submissions,
      totalCount
    });
  } catch (error) {
    console.error('List Submissions Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const { formId } = req.params;

  try {
    const form = await db.form.findFirst({
      where: { id: formId, userId: req.user.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const submissions = await db.submission.findMany({
      where: { formId },
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

    return res.status(200).json({
      totalSubmissions,
      timeline,
      fieldAnalytics
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
