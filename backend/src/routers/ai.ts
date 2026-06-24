import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { callGemini } from '../services/gemini';
import { db } from '../db';

export const aiRouter = router({
  generateForm: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/ai/generate-form',
        tags: ['ai'],
        summary: 'Generate a form schema using AI'
      }
    })
    .input(z.object({
      prompt: z.string().min(1, 'Prompt is required')
    }))
    .output(z.object({
      title: z.string(),
      description: z.string(),
      fields: z.array(z.any()),
      settings: z.any()
    }))
    .mutation(async ({ input }) => {
      const responseSchema = {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          settings: {
            type: 'OBJECT',
            properties: {
              submitButtonText: { type: 'STRING' }
            },
            required: ['submitButtonText']
          },
          fields: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                type: {
                  type: 'STRING',
                  enum: [
                    'text', 'paragraph', 'number', 'email', 'password', 'phone', 'url', 'date', 'time',
                    'checkbox', 'radio', 'select', 'multiselect', 'toggle', 'rating', 'slider'
                  ]
                },
                properties: {
                  type: 'OBJECT',
                  properties: {
                    label: { type: 'STRING' },
                    placeholder: { type: 'STRING' },
                    required: { type: 'BOOLEAN' },
                    options: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          label: { type: 'STRING' },
                          value: { type: 'STRING' }
                        },
                        required: ['label', 'value']
                      }
                    }
                  },
                  required: ['label']
                }
              },
              required: ['id', 'type', 'properties']
            }
          }
        },
        required: ['title', 'description', 'fields', 'settings']
      };

      const systemPrompt = `You are an expert AI form designer. Based on the user's prompt, generate a fully structured form schema.
Guidelines:
1. Come up with a professional and engaging title and description.
2. Choose logical form field types.
3. For select, radio, checkbox, or multiselect fields, provide a realistic and useful list of options (at least 3-4 options per field).
4. Assign a unique and short string for each field's id (e.g. 'full_name', 'email_address', 'rating').
5. Mark crucial fields (like name, email, rating, feedback) as required: true.
6. The submit button text should match the purpose of the form (e.g., 'Submit Feedback', 'Apply Now').

User Request Prompt: "${input.prompt}"`;

      try {
        const result = await callGemini(systemPrompt, responseSchema);
        return result;
      } catch (error: any) {
        console.error('Failed to generate form schema with Gemini:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'AI form generation failed.'
        });
      }
    }),

  generateTheme: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/ai/generate-theme',
        tags: ['ai'],
        summary: 'Generate a form theme styling using AI'
      }
    })
    .input(z.object({
      prompt: z.string().min(1, 'Prompt is required')
    }))
    .output(z.object({
      primaryColor: z.string(),
      backgroundColor: z.string(),
      borderRadius: z.string(),
      fontFamily: z.string()
    }))
    .mutation(async ({ input }) => {
      const responseSchema = {
        type: 'OBJECT',
        properties: {
          primaryColor: { type: 'STRING', description: 'Hex color code, e.g. #f59e0b' },
          backgroundColor: { type: 'STRING', description: 'Hex color code, e.g. #ffffff' },
          borderRadius: { type: 'STRING', description: 'CSS border radius, e.g. 0.5rem, 12px, 0px' },
          fontFamily: { type: 'STRING', enum: ['Geist', 'Inter', 'Roboto', 'Outfit', 'Playfair Display', 'JetBrains Mono'] }
        },
        required: ['primaryColor', 'backgroundColor', 'borderRadius', 'fontFamily']
      };

      const systemPrompt = `You are a web design expert. Suggest a cohesive color palette and style theme matching the style description prompt.
The theme must look premium and modern. Provide hex colors for primary (accent) and background, a fitting border radius, and font.
Theme description prompt: "${input.prompt}"`;

      try {
        const result = await callGemini(systemPrompt, responseSchema);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'AI theme generation failed.'
        });
      }
    }),

  analyzeSubmissions: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/ai/analyze-submissions',
        tags: ['ai'],
        summary: 'Analyze submissions for a form using AI'
      }
    })
    .input(z.object({
      formId: z.string()
    }))
    .output(z.object({
      analysis: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Fetch form
      const form = await db.form.findFirst({
        where: { id: input.formId, userId: ctx.user.userId }
      });
      if (!form) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Form not found or access denied.'
        });
      }

      // 2. Fetch submissions
      const submissions = await db.submission.findMany({
        where: { formId: input.formId },
        orderBy: { createdAt: 'desc' }
      });

      if (submissions.length === 0) {
        return {
          analysis: "### No Submissions Yet\nThere are no submissions to analyze for this form. Share your form to start collecting responses!"
        };
      }

      // 3. Compile submission content
      const compiledSubmissions = submissions.map((sub, i) => {
        return `Submission #${i + 1} (${sub.createdAt.toISOString()}):\n${JSON.stringify(sub.data, null, 2)}`;
      }).join('\n\n');

      const systemPrompt = `You are an expert data analyst. Read the following submissions collected for the form titled "${form.title}" (Description: ${form.description || 'None'}).
Analyze the responses and provide a beautiful, readable summary report in Markdown format.

Include:
1. **Summary Overview**: High-level recap of the submissions (volume, overall sentiment, etc.).
2. **Key Insights & Trends**: What do the responses tell us? Highlight ratings, checkbox selections, or recurring comments.
3. **Strengths & Weaknesses**: What is working well and what isn't?
4. **Actionable Recommendations**: 3-4 clear, bulleted recommendations based on the data.

Write the report in a highly professional, constructive, and premium tone. Use headings, bullet points, and emphasis where needed.

Submissions data:\n${compiledSubmissions}`;

      try {
        const analysis = await callGemini(systemPrompt);
        return { analysis };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'AI submission analysis failed.'
        });
      }
    })
});
