import { z } from 'zod';

export type FieldType =
  | 'text'
  | 'paragraph'
  | 'number'
  | 'email'
  | 'password'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'rating'
  | 'slider'
  | 'file'
  | 'image'
  | 'signature'
  | 'hidden'
  | 'heading'
  | 'divider'
  | 'markdown'
  | 'richtext';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface VisibilityRule {
  fieldId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

export interface FormFieldProperties {
  label: string;
  placeholder?: string;
  required?: boolean;
  width?: string;
  defaultValue?: any;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  level?: string; // for heading
  content?: string; // for markdown/richtext
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  visibilityRules?: VisibilityRule[];
}

export interface FormField {
  id: string;
  type: FieldType;
  properties: FormFieldProperties;
}

export interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  themeColor?: string;
  backgroundColor?: string;
}

export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional().nullable()
});

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export function buildFormZodSchema(fields: FormField[]) {
  const shape: Record<string, any> = {};

  for (const field of fields) {
    if (['heading', 'divider', 'markdown', 'richtext'].includes(field.type)) {
      continue;
    }

    let schema: any;

    if (field.type === 'number') {
      schema = z.preprocess(
        (val) => {
          if (val === '' || val === undefined || val === null) return undefined;
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        },
        z.number({ invalid_type_error: 'Must be a number' })
      );
    } else if (field.type === 'checkbox') {
      if (field.properties.options && field.properties.options.length > 0) {
        schema = z.array(z.string());
      } else {
        schema = z.boolean();
      }
    } else if (field.type === 'multiselect') {
      schema = z.array(z.string());
    } else if (field.type === 'toggle') {
      schema = z.boolean();
    } else if (field.type === 'rating' || field.type === 'slider') {
      schema = z.number();
    } else if (field.type === 'email') {
      schema = z.string().email('Invalid email address');
    } else if (field.type === 'url') {
      schema = z.string();
    } else {
      schema = z.string();
    }

    // Min / Max constraints
    if (field.type === 'number') {
      if (field.properties.min !== undefined) {
        schema = schema.refine((val: number) => val === undefined || val >= field.properties.min!, `Must be at least ${field.properties.min}`);
      }
      if (field.properties.max !== undefined) {
        schema = schema.refine((val: number) => val === undefined || val <= field.properties.max!, `Must be at most ${field.properties.max}`);
      }
    } else if (['text', 'paragraph', 'password', 'phone'].includes(field.type)) {
      if (field.properties.min !== undefined) {
        schema = schema.refine((val: string) => val === undefined || val.length >= field.properties.min!, `Must be at least ${field.properties.min} characters`);
      }
      if (field.properties.max !== undefined) {
        schema = schema.refine((val: string) => val === undefined || val.length <= field.properties.max!, `Must be at most ${field.properties.max} characters`);
      }
    }

    // Required constraint
    if (field.properties.required) {
      if (field.type === 'checkbox' && !field.properties.options?.length) {
        schema = schema.refine((val: boolean) => val === true, 'This field is required');
      } else if (field.type === 'multiselect' || (field.type === 'checkbox' && field.properties.options?.length)) {
        schema = schema.refine((val: string[]) => val && val.length > 0, 'Select at least one option');
      } else if (field.type === 'number') {
        schema = schema.refine((val: any) => val !== undefined && val !== null && !isNaN(val), 'This field is required');
      } else if (field.type === 'url') {
        schema = schema.refine((val: string) => val && val.trim() !== '', 'This field is required')
                       .refine((val: string) => {
                         try {
                           new URL(val);
                           return true;
                         } catch {
                           return false;
                         }
                       }, 'Invalid URL');
      } else {
        schema = schema.refine((val: string) => val && val.trim() !== '', 'This field is required');
      }
    } else {
      // Optional defaults / pre-processors
      if (field.type === 'checkbox' && !field.properties.options?.length) {
        schema = schema.optional().default(false);
      } else if (field.type === 'toggle') {
        schema = schema.optional().default(false);
      } else if (field.type === 'multiselect' || (field.type === 'checkbox' && field.properties.options?.length)) {
        schema = schema.optional().default([]);
      } else if (field.type === 'number') {
        schema = z.preprocess(
          (val) => {
            if (val === '' || val === undefined || val === null) return undefined;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
          },
          z.number().optional()
        );
      } else if (field.type === 'url') {
        schema = schema.optional().nullable().or(z.literal('')).refine((val: any) => {
          if (!val || val.trim() === '') return true;
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        }, 'Invalid URL');
      } else {
        schema = schema.optional().nullable().or(z.literal(''));
      }
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}
