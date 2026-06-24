import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { callGemini } from '../services/gemini';
import { z } from 'zod';

const router = Router();

// Zod schemas
const generateFormSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required')
});

const generateThemeSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required')
});

const analyzeSubmissionsSchema = z.object({
  formId: z.string().min(1, 'Form ID is required')
});

// POST /api/ai/generate-form (Generate a form schema using AI - authenticated)
router.post('/generate-form', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const validation = generateFormSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors });
  }

  const { prompt } = validation.data;

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

User Request Prompt: "${prompt}"`;

  try {
    const result = await callGemini(systemPrompt, responseSchema);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Failed to generate form schema with Gemini:', error);
    return res.status(500).json({ error: error.message || 'AI form generation failed.' });
  }
});

// POST /api/ai/generate-theme (Generate a form theme styling using AI - authenticated)
router.post('/generate-theme', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const validation = generateThemeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors });
  }

  const { prompt } = validation.data;

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
Theme description prompt: "${prompt}"`;

  try {
    const result = await callGemini(systemPrompt, responseSchema);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Failed to generate theme with Gemini:', error);
    return res.status(500).json({ error: error.message || 'AI theme generation failed.' });
  }
});

// POST /api/ai/analyze-submissions (Analyze submissions for a form using AI - authenticated)
router.post('/analyze-submissions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

  const validation = analyzeSubmissionsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors });
  }

  const { formId } = validation.data;

  try {
    // 1. Fetch form
    const form = await db.form.findFirst({
      where: { id: formId, userId: req.user.userId }
    });
    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied.' });
    }

    // 2. Fetch submissions
    const submissions = await db.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' }
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        analysis: "### No Submissions Yet\nThere are no submissions to analyze for this form. Share your form to start collecting responses!"
      });
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

    const analysis = await callGemini(systemPrompt);
    return res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('Failed to analyze submissions with Gemini:', error);
    return res.status(500).json({ error: error.message || 'AI submission analysis failed.' });
  }
});

export const aiRouter: Router = router;
