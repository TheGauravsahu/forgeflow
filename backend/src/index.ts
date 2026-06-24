import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from 'trpc-openapi';
import { apiReference } from '@scalar/express-api-reference';
import { appRouter, AppRouter } from './routers/_app';
import { createContext } from './context';
import { db } from './db';
import { verifyToken } from './auth';
import { FormField } from './types/shared';

export type { AppRouter };

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// tRPC Express Adapter binding
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// OpenAPI Express Adapter binding
app.use(
  '/api',
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Generate OpenAPI Spec
const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'ForgeFlow API',
  version: '1.0.0',
  baseUrl: `http://localhost:${PORT}/api`,
  tags: ['auth', 'form', 'folder', 'submission', 'analytics']
});

// Serve OpenAPI Spec
app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

// Scalar API Reference Dashboard
app.use(
  '/docs',
  apiReference({
    spec: {
      content: openApiDocument,
    },
    theme: 'kepler'
  })
);

// Direct CSV Export Endpoint
app.get('/api/forms/:formId/export-csv', async (req, res) => {
  const { formId } = req.params;
  const token = (req.query.token as string) || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. JWT token required.' });
  }

  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  try {
    const form = await db.form.findFirst({
      where: { id: formId, userId: session.userId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied.' });
    }

    const submissions = await db.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' }
    });

    const fields = (form.schema as any) as FormField[];
    const activeFields = fields.filter(f => !['heading', 'divider', 'markdown', 'richtext'].includes(f.type));

    // Construct CSV Header row
    const headers = ['Submission ID', 'Submitted At', ...activeFields.map(f => f.properties.label || f.id)];

    // Construct CSV Data rows
    const rows = submissions.map(sub => {
      const data = sub.data as Record<string, any>;
      const values = activeFields.map(f => {
        const val = data[f.id];
        if (val === undefined || val === null) return '';
        if (Array.isArray(val)) return `"${val.join(', ').replace(/"/g, '""')}"`;
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [sub.id, sub.createdAt.toISOString(), ...values];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form_${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('CSV Export Error:', error);
    return res.status(500).json({ error: 'Internal server error while exporting CSV.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 API Document running on http://localhost:${PORT}/docs`);
  console.log(`🔍 OpenAPI configuration available on http://localhost:${PORT}/openapi.json`);
});
