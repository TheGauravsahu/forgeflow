"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInputSchema = exports.RegisterInputSchema = exports.FormSchemaDef = exports.FormSettingsSchema = exports.FormFieldSchema = exports.FieldPropertiesSchema = exports.FieldOptionSchema = exports.VisibilityRuleSchema = exports.FieldTypeSchema = void 0;
exports.buildFieldZodSchema = buildFieldZodSchema;
exports.buildFormZodSchema = buildFormZodSchema;
const zod_1 = require("zod");
exports.FieldTypeSchema = zod_1.z.enum([
    'text',
    'paragraph',
    'number',
    'email',
    'password',
    'phone',
    'url',
    'date',
    'time',
    'checkbox',
    'radio',
    'select',
    'multiselect',
    'rating',
    'slider',
    'toggle',
    'file',
    'image',
    'signature',
    'heading',
    'divider',
    'markdown',
    'richtext',
    'hidden'
]);
// Visibility Rule Schema
exports.VisibilityRuleSchema = zod_1.z.object({
    fieldId: zod_1.z.string(),
    operator: zod_1.z.enum(['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty']),
    value: zod_1.z.string()
});
// Field Option Schema
exports.FieldOptionSchema = zod_1.z.object({
    label: zod_1.z.string(),
    value: zod_1.z.string()
});
// Field Properties Schema
exports.FieldPropertiesSchema = zod_1.z.object({
    label: zod_1.z.string().default('Field Label'),
    description: zod_1.z.string().optional(),
    placeholder: zod_1.z.string().optional(),
    required: zod_1.z.boolean().default(false),
    defaultValue: zod_1.z.any().optional(),
    min: zod_1.z.number().optional(), // For text length, number value, dates, slider, rating
    max: zod_1.z.number().optional(), // For text length, number value, dates, slider, rating
    regexPattern: zod_1.z.string().optional(),
    customErrorMessage: zod_1.z.string().optional(),
    width: zod_1.z.enum(['50', '100']).default('100'),
    visibilityRules: zod_1.z.array(exports.VisibilityRuleSchema).default([]),
    helpText: zod_1.z.string().optional(),
    // Choice fields
    options: zod_1.z.array(exports.FieldOptionSchema).optional(),
    // File upload config
    maxSizeMB: zod_1.z.number().optional(),
    allowedFileTypes: zod_1.z.array(zod_1.z.string()).optional(),
    // Heading config
    level: zod_1.z.enum(['1', '2', '3', '4']).default('2'),
    // Content block config (markdown, richtext, divider)
    content: zod_1.z.string().optional(),
    // Rating/Slider config
    step: zod_1.z.number().optional(),
    minLabel: zod_1.z.string().optional(),
    maxLabel: zod_1.z.string().optional()
});
// Form Field Schema
exports.FormFieldSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.FieldTypeSchema,
    properties: exports.FieldPropertiesSchema
});
// Form Settings Schema
exports.FormSettingsSchema = zod_1.z.object({
    redirectUrl: zod_1.z.string().optional(),
    successMessage: zod_1.z.string().default('Thank you! Your submission has been received.'),
    theme: zod_1.z.object({
        primaryColor: zod_1.z.string().default('#0f172a'),
        backgroundColor: zod_1.z.string().default('#ffffff'),
        borderRadius: zod_1.z.string().default('0.5rem'),
        fontFamily: zod_1.z.string().default('Inter')
    }).default({
        primaryColor: '#0f172a',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        fontFamily: 'Inter'
    })
});
// Complete Form Schema
exports.FormSchemaDef = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    fields: zod_1.z.array(exports.FormFieldSchema).default([]),
    settings: exports.FormSettingsSchema.default({
        successMessage: 'Thank you! Your submission has been received.',
        theme: {
            primaryColor: '#0f172a',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            fontFamily: 'Inter'
        }
    })
});
// Auth Schema for custom auth API calls
exports.RegisterInputSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required')
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
// Submissions Validation Helpers
function buildFieldZodSchema(field) {
    let schema = zod_1.z.any();
    switch (field.type) {
        case 'text':
        case 'paragraph':
        case 'phone':
        case 'signature':
            let strSchema = zod_1.z.string();
            if (field.properties.required) {
                strSchema = strSchema.min(1, field.properties.customErrorMessage || `${field.properties.label} is required`);
            }
            else {
                strSchema = strSchema.optional().or(zod_1.z.literal(''));
            }
            if (field.properties.min !== undefined) {
                strSchema = strSchema.min(field.properties.min, field.properties.customErrorMessage || `${field.properties.label} must be at least ${field.properties.min} characters`);
            }
            if (field.properties.max !== undefined) {
                strSchema = strSchema.max(field.properties.max, field.properties.customErrorMessage || `${field.properties.label} must be at most ${field.properties.max} characters`);
            }
            if (field.properties.regexPattern) {
                try {
                    const regex = new RegExp(field.properties.regexPattern);
                    strSchema = strSchema.regex(regex, field.properties.customErrorMessage || `${field.properties.label} format is invalid`);
                }
                catch (e) {
                    // Ignore invalid regex configuration
                }
            }
            schema = strSchema;
            break;
        case 'email':
            let emailSchema = zod_1.z.string();
            if (field.properties.required) {
                emailSchema = emailSchema.min(1, `${field.properties.label} is required`);
            }
            else {
                emailSchema = emailSchema.optional().or(zod_1.z.literal(''));
            }
            emailSchema = emailSchema.email(field.properties.customErrorMessage || 'Invalid email format');
            schema = emailSchema;
            break;
        case 'url':
            let urlSchema = zod_1.z.string();
            if (field.properties.required) {
                urlSchema = urlSchema.min(1, `${field.properties.label} is required`);
            }
            else {
                urlSchema = urlSchema.optional().or(zod_1.z.literal(''));
            }
            urlSchema = urlSchema.url(field.properties.customErrorMessage || 'Invalid URL format');
            schema = urlSchema;
            break;
        case 'password':
            let passSchema = zod_1.z.string();
            if (field.properties.required) {
                passSchema = passSchema.min(1, `${field.properties.label} is required`);
            }
            else {
                passSchema = passSchema.optional().or(zod_1.z.literal(''));
            }
            if (field.properties.min !== undefined) {
                passSchema = passSchema.min(field.properties.min, `${field.properties.label} must be at least ${field.properties.min} characters`);
            }
            schema = passSchema;
            break;
        case 'number':
        case 'slider':
        case 'rating':
            let numSchema = zod_1.z.preprocess((val) => {
                if (val === '' || val === null || val === undefined) {
                    return undefined;
                }
                const num = Number(val);
                return isNaN(num) ? val : num;
            }, field.properties.required ? zod_1.z.number({
                required_error: `${field.properties.label} is required`,
                invalid_type_error: `${field.properties.label} must be a number`
            }) : zod_1.z.number().optional());
            if (field.properties.min !== undefined) {
                numSchema = numSchema.refine((val) => val === undefined || val >= field.properties.min, {
                    message: field.properties.customErrorMessage || `${field.properties.label} must be at least ${field.properties.min}`
                });
            }
            if (field.properties.max !== undefined) {
                numSchema = numSchema.refine((val) => val === undefined || val <= field.properties.max, {
                    message: field.properties.customErrorMessage || `${field.properties.label} must be at most ${field.properties.max}`
                });
            }
            schema = numSchema;
            break;
        case 'date':
        case 'time':
            let dateSchema = zod_1.z.string();
            if (field.properties.required) {
                dateSchema = dateSchema.min(1, `${field.properties.label} is required`);
            }
            else {
                dateSchema = dateSchema.optional().or(zod_1.z.literal(''));
            }
            schema = dateSchema;
            break;
        case 'checkbox':
        case 'toggle':
            if (field.properties.options && field.properties.options.length > 0) {
                const baseArr = zod_1.z.array(zod_1.z.string());
                schema = field.properties.required
                    ? baseArr.min(1, field.properties.customErrorMessage || `Select at least one option`)
                    : baseArr.default([]);
            }
            else {
                const baseBool = zod_1.z.boolean();
                schema = field.properties.required
                    ? baseBool.refine((v) => v === true, {
                        message: field.properties.customErrorMessage || `${field.properties.label} must be checked`
                    })
                    : baseBool.default(false);
            }
            break;
        case 'radio':
        case 'select':
            let selSchema = zod_1.z.string();
            if (field.properties.required) {
                selSchema = selSchema.min(1, field.properties.customErrorMessage || `${field.properties.label} is required`);
            }
            else {
                selSchema = selSchema.optional().or(zod_1.z.literal(''));
            }
            schema = selSchema;
            break;
        case 'multiselect':
            const baseMulti = zod_1.z.array(zod_1.z.string());
            schema = field.properties.required
                ? baseMulti.min(1, field.properties.customErrorMessage || `Select at least one option`)
                : baseMulti.default([]);
            break;
        case 'file':
        case 'image':
            let fileSchema = zod_1.z.string();
            if (field.properties.required) {
                fileSchema = fileSchema.min(1, field.properties.customErrorMessage || `${field.properties.label} is required`);
            }
            else {
                fileSchema = fileSchema.optional().or(zod_1.z.literal(''));
            }
            schema = fileSchema;
            break;
        case 'hidden':
            schema = zod_1.z.string().optional();
            break;
        default:
            schema = zod_1.z.any().optional();
            break;
    }
    return schema;
}
function buildFormZodSchema(fields) {
    const shape = {};
    for (const field of fields) {
        if (['heading', 'divider', 'markdown', 'richtext'].includes(field.type)) {
            continue;
        }
        shape[field.id] = buildFieldZodSchema(field);
    }
    return zod_1.z.object(shape);
}
