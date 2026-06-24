"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("@trpc/server/adapters/express");
const trpc_openapi_1 = require("trpc-openapi");
const express_api_reference_1 = require("@scalar/express-api-reference");
const _app_1 = require("./routers/_app");
const context_1 = require("./context");
const db_1 = require("./db");
const auth_1 = require("./auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
// tRPC Express Adapter binding
app.use('/trpc', (0, express_2.createExpressMiddleware)({
    router: _app_1.appRouter,
    createContext: context_1.createContext,
}));
// OpenAPI Express Adapter binding
app.use('/api', (0, trpc_openapi_1.createOpenApiExpressMiddleware)({
    router: _app_1.appRouter,
    createContext: context_1.createContext,
}));
// Generate OpenAPI Spec
const openApiDocument = (0, trpc_openapi_1.generateOpenApiDocument)(_app_1.appRouter, {
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
app.use('/docs', (0, express_api_reference_1.apiReference)({
    spec: {
        content: openApiDocument,
    },
    theme: 'kepler'
}));
// Direct CSV Export Endpoint
app.get('/api/forms/:formId/export-csv', async (req, res) => {
    const { formId } = req.params;
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. JWT token required.' });
    }
    const session = (0, auth_1.verifyToken)(token);
    if (!session) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
    try {
        const form = await db_1.db.form.findFirst({
            where: { id: formId, userId: session.userId }
        });
        if (!form) {
            return res.status(404).json({ error: 'Form not found or access denied.' });
        }
        const submissions = await db_1.db.submission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' }
        });
        const fields = form.schema;
        const activeFields = fields.filter(f => !['heading', 'divider', 'markdown', 'richtext'].includes(f.type));
        // Construct CSV Header row
        const headers = ['Submission ID', 'Submitted At', ...activeFields.map(f => f.properties.label || f.id)];
        // Construct CSV Data rows
        const rows = submissions.map(sub => {
            const data = sub.data;
            const values = activeFields.map(f => {
                const val = data[f.id];
                if (val === undefined || val === null)
                    return '';
                if (Array.isArray(val))
                    return `"${val.join(', ').replace(/"/g, '""')}"`;
                if (typeof val === 'object')
                    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            return [sub.id, sub.createdAt.toISOString(), ...values];
        });
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="form_${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions.csv"`);
        return res.send(csvContent);
    }
    catch (error) {
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
