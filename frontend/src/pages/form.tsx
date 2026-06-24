import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormZodSchema, FormField, FormSettings } from '../types/shared';
import { trpc } from '../lib/trpc';
import {
  Star,
  Upload,
  Image as ImageIcon,
  PenTool,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ChevronDown,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// ─── Custom Simple Markdown Parser ───────────────────────────────────────────
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-slate-700">
      {lines.map((line, idx) => {
        let content = line.trim();
        if (content.startsWith('# ')) {
          return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2 text-slate-900">{content.slice(2)}</h1>;
        }
        if (content.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-bold mt-3 mb-2 text-slate-800">{content.slice(3)}</h2>;
        }
        if (content.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-bold mt-2 mb-1 text-slate-800">{content.slice(4)}</h3>;
        }
        if (content.startsWith('- ') || content.startsWith('* ')) {
          return <li key={idx} className="list-disc ml-5 text-slate-600">{content.slice(2)}</li>;
        }
        // Bold parsing (simple)
        const parts = content.split('**');
        if (parts.length > 1) {
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-slate-900">{part}</strong> : part)}
            </p>
          );
        }
        return <p key={idx} className="leading-relaxed">{content || <br />}</p>;
      })}
    </div>
  );
}

// ─── Signature Pad Component ─────────────────────────────────────────────────
function SignaturePad({
  value,
  onChange,
  primaryColor
}: {
  value: string;
  onChange: (val: string) => void;
  primaryColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!value);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Check if it is a touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = primaryColor || '#000000';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = (e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange('');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && value) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = value;
      }
    }
  }, [value]);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full h-[150px] border-b border-dashed border-stone-200 cursor-crosshair bg-stone-50/60 touch-none block"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex justify-between items-center px-3 py-2">
        <span className="text-xs text-stone-400 flex items-center gap-1.5">
          <PenTool className="w-3 h-3" /> Draw your signature above
        </span>
        {hasDrawn && (
          <button
            onClick={clearCanvas}
            className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-0.5 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Evaluation helper for Visibility Rules ──────────────────────────────────
function isFieldVisible(field: FormField, formValues: any) {
  const rules = field.properties.visibilityRules;
  if (!rules || rules.length === 0) return true;

  return rules.every(rule => {
    const val = formValues[rule.fieldId];
    const targetVal = rule.value;

    switch (rule.operator) {
      case 'equals':
        return String(val ?? '') === targetVal;
      case 'notEquals':
        return String(val ?? '') !== targetVal;
      case 'contains':
        return String(val ?? '').toLowerCase().includes(targetVal.toLowerCase());
      case 'greaterThan':
        return Number(val) > Number(targetVal);
      case 'lessThan':
        return Number(val) < Number(targetVal);
      case 'isEmpty':
        return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      case 'isNotEmpty':
        return val !== undefined && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0);
      default:
        return true;
    }
  });
}

// ─── Shared input className builder ─────────────────────────────────────────
function inputCls(hasError: boolean, extra = '') {
  return [
    'w-full bg-white border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400',
    'focus:outline-none transition-all duration-150',
    hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-stone-200 hover:border-stone-300 focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400',
    extra
  ].join(' ');
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicFormPage() {
  const { id } = useParams<{ id: string }>();
  const formId = id || '';

  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Fetch Form spec (public route)
  const { data: form, isLoading, error } = trpc.form.getPublic.useQuery(
    { id: formId },
    { enabled: !!formId, retry: false }
  );

  // Fetch Captcha challenge
  const captchaQuery = trpc.submission.getCaptcha.useQuery(undefined, {
    enabled: !!formId,
    refetchOnWindowFocus: false,
    retry: false
  });

  const submitMutation = trpc.submission.submit.useMutation();

  // Create full validation schema
  const fields = (form?.schema as FormField[]) || [];
  const formZodSchema = buildFormZodSchema(fields);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(formZodSchema),
    mode: 'onTouched'
  });

  const formValues = watch();

  const handleFileUpload = (fieldId: string, file: File | null) => {
    if (!file) {
      setValue(fieldId, '');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue(fieldId, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: any) => {
    setSubmissionError(null);
    try {
      // Filter data to only include visible fields
      const filteredData: Record<string, any> = {};
      fields.forEach(f => {
        if (!['heading', 'divider', 'markdown', 'richtext'].includes(f.type)) {
          if (isFieldVisible(f, data)) {
            filteredData[f.id] = data[f.id];
          }
        }
      });

      await submitMutation.mutateAsync({
        formId,
        data: filteredData,
        captchaToken: captchaQuery.data?.token,
        captchaAnswer,
        honeypot
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmissionError(err.message || 'Submission failed. Please check your answers and try again.');
      captchaQuery.refetch();
      setCaptchaAnswer('');
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafaf9' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-stone-100">
            <Loader2 className="w-7 h-7 animate-spin text-stone-500" />
          </div>
          <p className="text-sm text-stone-500 font-medium tracking-wide">Loading form…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found state ────────────────────────────────────────────────
  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#fafaf9' }}>
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 mb-1.5">Form Not Available</h1>
            <p className="text-sm text-stone-500 leading-relaxed">
              This form could not be loaded. It may be archived, unpublished, or the link is incorrect.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-stone-800 transition-colors shadow-sm"
          >
            Go to ForgeFlow
          </a>
        </div>
      </div>
    );
  }

  const settings = (form.settings as FormSettings) || {
    successMessage: 'Thank you! Your submission has been received.',
    theme: {
      primaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      fontFamily: 'Inter'
    }
  };

  const { theme } = settings;

  const primaryColor = theme.primaryColor || '#6366f1';
  const borderRadius = theme.borderRadius || '0.75rem';
  const fontFamily = theme.fontFamily || 'Inter, system-ui, sans-serif';

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: primaryColor,
    borderRadius,
    fontFamily
  };

  const inputBorderRadius: React.CSSProperties = { borderRadius };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#fafaf9', fontFamily }}>
        <div className="max-w-lg w-full bg-white border border-stone-200 rounded-2xl p-10 shadow-xl text-center space-y-6">
          {/* Animated checkmark circle */}
          <div className="relative mx-auto w-20 h-20">
            <div
              className="absolute inset-0 rounded-full opacity-20 animate-ping"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-stone-900">Submission Received!</h1>
            <p className="text-stone-500 leading-relaxed text-sm">
              {settings.successMessage}
            </p>
          </div>
          {settings.redirectUrl && (
            <a
              href={settings.redirectUrl.startsWith('http') ? settings.redirectUrl : `https://${settings.redirectUrl}`}
              className="inline-flex items-center justify-center px-6 py-2.5 text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity duration-150"
              style={primaryBtnStyle}
            >
              Continue →
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Main form render ───────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: '#fafaf9', fontFamily }}
    >
      {/* Form card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">

          {/* Accent top bar */}
          <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

          <div className="p-8 sm:p-10 space-y-8">

            {/* ── Form Header ── */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-stone-500 text-sm leading-relaxed whitespace-pre-wrap">
                  {form.description}
                </p>
              )}
            </div>

            <div className="border-t border-stone-100" />

            {/* ── Fields ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
              {/* Honeypot field (hidden from screen readers & users) */}
              <div className="absolute opacity-0 -z-50 pointer-events-none select-none" aria-hidden="true">
                <label htmlFor="website_url_val">Leave this field blank</label>
                <input
                  id="website_url_val"
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                {fields.map(field => {
                  const visible = isFieldVisible(field, formValues);
                  if (!visible) return null;

                  const isHalfWidth = field.properties.width === '50';
                  const colSpan = isHalfWidth ? 'col-span-2 sm:col-span-1' : 'col-span-2';

                  // ── 1. Layout-only elements ──────────────────────────────
                  if (field.type === 'heading') {
                    const level = field.properties.level || '2';
                    return (
                      <div key={field.id} className={colSpan}>
                        {level === '1' && (
                          <h1 className="text-3xl font-bold text-stone-900 mt-4 mb-1">{field.properties.label}</h1>
                        )}
                        {level === '2' && (
                          <h2 className="text-2xl font-bold text-stone-800 mt-3 mb-1">{field.properties.label}</h2>
                        )}
                        {level === '3' && (
                          <h3 className="text-xl font-semibold text-stone-800 mt-2 mb-1">{field.properties.label}</h3>
                        )}
                        {level === '4' && (
                          <h4 className="text-lg font-semibold text-stone-700 mt-1 mb-0.5">{field.properties.label}</h4>
                        )}
                        {field.properties.description && (
                          <p className="text-sm text-stone-400 mt-0.5">{field.properties.description}</p>
                        )}
                      </div>
                    );
                  }

                  if (field.type === 'divider') {
                    return (
                      <div key={field.id} className={`${colSpan} py-2`}>
                        <div className="border-t border-stone-100" />
                      </div>
                    );
                  }

                  if (field.type === 'markdown') {
                    return (
                      <div key={field.id} className={`${colSpan} prose-sm`}>
                        {renderMarkdown(field.properties.content || '')}
                      </div>
                    );
                  }

                  if (field.type === 'richtext') {
                    return (
                      <div
                        key={field.id}
                        className={`${colSpan} text-stone-700 text-sm leading-relaxed`}
                        dangerouslySetInnerHTML={{ __html: field.properties.content || '' }}
                      />
                    );
                  }

                  if (field.type === 'hidden') {
                    return (
                      <input
                        key={field.id}
                        type="hidden"
                        value={field.properties.defaultValue || ''}
                        {...register(field.id)}
                      />
                    );
                  }

                  // ── 2. Interactive input fields ──────────────────────────
                  const isRequired = field.properties.required;
                  const fieldError = errors[field.id];
                  const hasError = !!fieldError;

                  return (
                    <div key={field.id} className={`${colSpan} flex flex-col gap-1.5`}>

                      {/* Label */}
                      <Label className="text-sm font-semibold text-stone-700 flex items-center gap-1 select-none">
                        {field.properties.label}
                        {isRequired && (
                          <span className="text-red-500 ml-0.5 leading-none">*</span>
                        )}
                      </Label>

                      {/* Description */}
                      {field.properties.description && (
                        <span className="text-xs text-stone-400 -mt-0.5">
                          {field.properties.description}
                        </span>
                      )}

                      {/* ── text ── */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.properties.placeholder}
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── paragraph ── */}
                      {field.type === 'paragraph' && (
                        <textarea
                          placeholder={field.properties.placeholder}
                          defaultValue={field.properties.defaultValue}
                          rows={4}
                          className={inputCls(hasError, 'rounded-xl resize-y min-h-[96px]')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── number ── */}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={field.properties.placeholder}
                          defaultValue={field.properties.defaultValue}
                          step={field.properties.step || 'any'}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id, { valueAsNumber: true })}
                        />
                      )}

                      {/* ── email ── */}
                      {field.type === 'email' && (
                        <input
                          type="email"
                          placeholder={field.properties.placeholder}
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── password ── */}
                      {field.type === 'password' && (
                        <input
                          type="password"
                          placeholder={field.properties.placeholder}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── phone ── */}
                      {field.type === 'phone' && (
                        <input
                          type="tel"
                          placeholder={field.properties.placeholder || '+1 (555) 000-0000'}
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── url ── */}
                      {field.type === 'url' && (
                        <input
                          type="url"
                          placeholder={field.properties.placeholder || 'https://example.com'}
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── date ── */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── time ── */}
                      {field.type === 'time' && (
                        <input
                          type="time"
                          defaultValue={field.properties.defaultValue}
                          className={inputCls(hasError, 'rounded-xl')}
                          style={inputBorderRadius}
                          {...register(field.id)}
                        />
                      )}

                      {/* ── select ── */}
                      {field.type === 'select' && (
                        <div className="relative">
                          <select
                            className={[
                              'w-full bg-white border px-3.5 pr-10 py-2.5 text-sm text-stone-900 appearance-none',
                              'focus:outline-none transition-all duration-150 rounded-xl',
                              hasError
                                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                : 'border-stone-200 hover:border-stone-300 focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400'
                            ].join(' ')}
                            style={inputBorderRadius}
                            {...register(field.id)}
                          >
                            <option value="">{field.properties.placeholder || 'Select an option…'}</option>
                            {field.properties.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}

                      {/* ── radio ── */}
                      {field.type === 'radio' && (
                        <div className="flex flex-col gap-2.5 mt-0.5">
                          {field.properties.options?.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer group"
                            >
                              <input
                                type="radio"
                                value={opt.value}
                                className="w-4 h-4 border-stone-300 cursor-pointer"
                                style={{ accentColor: primaryColor }}
                                {...register(field.id)}
                              />
                              <span className="group-hover:text-stone-900 transition-colors">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* ── checkbox ── */}
                      {field.type === 'checkbox' && (
                        <div className="flex flex-col gap-2.5 mt-0.5">
                          {field.properties.options && field.properties.options.length > 0 ? (
                            field.properties.options.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  value={opt.value}
                                  className="w-4 h-4 rounded border-stone-300 cursor-pointer"
                                  style={{ accentColor: primaryColor }}
                                  {...register(field.id)}
                                />
                                <span className="group-hover:text-stone-900 transition-colors">{opt.label}</span>
                              </label>
                            ))
                          ) : (
                            <label className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-stone-300 cursor-pointer"
                                style={{ accentColor: primaryColor }}
                                {...register(field.id)}
                              />
                              <span className="group-hover:text-stone-900 transition-colors">
                                {field.properties.placeholder || 'I agree'}
                              </span>
                            </label>
                          )}
                        </div>
                      )}

                      {/* ── multiselect ── */}
                      {field.type === 'multiselect' && (
                        <div
                          className={[
                            'flex flex-col gap-2 mt-0.5 bg-white border p-3 rounded-xl max-h-[168px] overflow-y-auto',
                            hasError ? 'border-red-400' : 'border-stone-200'
                          ].join(' ')}
                        >
                          {field.properties.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer group">
                              <input
                                type="checkbox"
                                value={opt.value}
                                className="w-4 h-4 rounded border-stone-300 cursor-pointer"
                                style={{ accentColor: primaryColor }}
                                {...register(field.id)}
                              />
                              <span className="group-hover:text-stone-900 transition-colors">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* ── toggle ── */}
                      {field.type === 'toggle' && (
                        <Controller
                          name={field.id}
                          control={control}
                          defaultValue={false}
                          render={({ field: { value, onChange } }) => (
                            <div className="flex items-center gap-3 mt-0.5">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={value}
                                onClick={() => onChange(!value)}
                                className={`w-12 h-6 flex items-center rounded-full px-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                  value ? '' : 'bg-stone-200'
                                }`}
                                style={value ? { backgroundColor: primaryColor } : {}}
                              >
                                <div
                                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                                    value ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span className="text-xs text-stone-500">
                                {value ? 'On' : 'Off'}
                              </span>
                            </div>
                          )}
                        />
                      )}

                      {/* ── rating ── */}
                      {field.type === 'rating' && (
                        <Controller
                          name={field.id}
                          control={control}
                          defaultValue={0}
                          render={({ field: { value, onChange } }) => {
                            const maxStars = field.properties.max || 5;
                            return (
                              <div className="flex flex-col gap-1.5 mt-0.5">
                                <div className="flex items-center gap-1.5">
                                  {Array.from({ length: maxStars }).map((_, starIdx) => {
                                    const starVal = starIdx + 1;
                                    const isFilled = starVal <= (value || 0);
                                    return (
                                      <button
                                        key={starIdx}
                                        type="button"
                                        onClick={() => onChange(starVal)}
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                      >
                                        <Star
                                          className={`w-7 h-7 transition-colors ${
                                            isFilled
                                              ? 'fill-amber-400 text-amber-400'
                                              : 'text-stone-300 hover:text-amber-300'
                                          }`}
                                        />
                                      </button>
                                    );
                                  })}
                                  {value > 0 && (
                                    <span className="ml-1.5 text-xs font-semibold text-stone-500">
                                      {value}/{maxStars}
                                    </span>
                                  )}
                                </div>
                                {(field.properties.minLabel || field.properties.maxLabel) && (
                                  <div className="flex justify-between text-xs text-stone-400" style={{ width: `${maxStars * 36}px` }}>
                                    <span>{field.properties.minLabel}</span>
                                    <span>{field.properties.maxLabel}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />
                      )}

                      {/* ── slider ── */}
                      {field.type === 'slider' && (
                        <Controller
                          name={field.id}
                          control={control}
                          defaultValue={field.properties.min || 0}
                          render={({ field: { value, onChange } }) => (
                            <div className="space-y-2 mt-1.5">
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min={field.properties.min ?? 0}
                                  max={field.properties.max ?? 100}
                                  step={field.properties.step ?? 1}
                                  value={value ?? field.properties.min ?? 0}
                                  onChange={(e) => onChange(Number(e.target.value))}
                                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-stone-200"
                                  style={{ accentColor: primaryColor }}
                                />
                                <Badge variant="secondary" className="min-w-[40px] justify-center text-xs font-bold text-stone-700">
                                  {value ?? field.properties.min ?? 0}
                                </Badge>
                              </div>
                              {(field.properties.minLabel || field.properties.maxLabel) && (
                                <div className="flex justify-between text-xs text-stone-400">
                                  <span>{field.properties.minLabel}</span>
                                  <span>{field.properties.maxLabel}</span>
                                </div>
                              )}
                            </div>
                          )}
                        />
                      )}

                      {/* ── file / image ── */}
                      {(field.type === 'file' || field.type === 'image') && (
                        <Controller
                          name={field.id}
                          control={control}
                          defaultValue=""
                          render={({ field: { value, onChange } }) => {
                            const fileInputRef = useRef<HTMLInputElement>(null);
                            return (
                              <div className="space-y-2 mt-0.5">
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className={[
                                    'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150',
                                    'flex flex-col items-center justify-center gap-2 group',
                                    hasError
                                      ? 'border-red-300 bg-red-50/40'
                                      : 'border-stone-200 bg-stone-50/50 hover:border-stone-400 hover:bg-stone-50'
                                  ].join(' ')}
                                >
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept={
                                      field.type === 'image'
                                        ? 'image/*'
                                        : field.properties.allowedFileTypes?.join(',') || '*'
                                    }
                                    onChange={(e) => {
                                      const fileList = e.target.files;
                                      if (fileList && fileList.length > 0) {
                                        handleFileUpload(field.id, fileList[0]);
                                      }
                                    }}
                                  />
                                  <div className="w-10 h-10 rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors flex items-center justify-center">
                                    {field.type === 'image' ? (
                                      <ImageIcon className="w-5 h-5 text-stone-500" />
                                    ) : (
                                      <Upload className="w-5 h-5 text-stone-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-stone-700">
                                      Click to upload {field.type === 'image' ? 'an image' : 'a file'}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                      Max size: {field.properties.maxSizeMB || 5} MB
                                    </p>
                                  </div>
                                </div>
                                {value && (
                                  <div className="border border-stone-100 p-3 rounded-xl bg-white flex items-center justify-between shadow-sm">
                                    {field.type === 'image' && value.startsWith('data:image/') ? (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={value}
                                          alt="Upload preview"
                                          className="w-11 h-11 object-cover rounded-lg border border-stone-100"
                                        />
                                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" /> Image uploaded
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> File uploaded successfully
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => onChange('')}
                                      className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-0.5 transition-colors"
                                    >
                                      <X className="w-3 h-3" /> Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />
                      )}

                      {/* ── signature ── */}
                      {field.type === 'signature' && (
                        <Controller
                          name={field.id}
                          control={control}
                          defaultValue=""
                          render={({ field: { value, onChange } }) => (
                            <SignaturePad
                              value={value}
                              onChange={onChange}
                              primaryColor={primaryColor}
                            />
                          )}
                        />
                      )}

                      {/* Help text */}
                      {field.properties.helpText && (
                        <span className="text-xs text-stone-400 leading-relaxed">
                          {field.properties.helpText}
                        </span>
                      )}

                      {/* Inline field error */}
                      {fieldError && (
                        <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {String(fieldError.message)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── CAPTCHA Spam Protection ── */}
              {captchaQuery.data && (
                <div className="mt-8 p-5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Lock className="w-4 h-4 text-stone-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Spam Protection Verification</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs text-stone-400">Please answer this question to submit:</span>
                      <p className="text-sm font-bold text-stone-800 mt-0.5">{captchaQuery.data.question}</p>
                    </div>
                    <div className="w-32">
                      <input
                        type="text"
                        required
                        placeholder="Answer"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className={inputCls(false, 'w-full text-center')}
                        style={inputBorderRadius}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Submission error banner ── */}
              {submissionError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{submissionError}</span>
                </div>
              )}

              {/* ── Submit button ── */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={submitMutation.isLoading}
                  className="w-full flex justify-center items-center gap-2 text-white px-6 py-3.5 font-semibold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={primaryBtnStyle}
                >
                  {submitMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Response'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-400 mt-6">
          Powered by{' '}
          <span className="font-bold text-stone-500">ForgeFlow</span> Form Builder
        </p>
      </div>
    </div>
  );
}
