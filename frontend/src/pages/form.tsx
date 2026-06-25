import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormZodSchema, FormField, FormSettings } from '../types/shared';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import {
  Check,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { PublicFormField } from '../components/form/PublicFormField';

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

  const [honeypot, setHoneypot] = useState('');
  const toast = useToastStore();

  // Fetch Form spec (public route)
  const { data: form, isLoading, error } = api.form.getPublic.useQuery(
    { id: formId },
    { enabled: !!formId, retry: false }
  );

  const submitMutation = api.submission.submit.useMutation();

  // Create full validation schema
  const fields = ((form?.schema as unknown) as FormField[]) || [];
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

  // Offline Draft support
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (form && !draftLoaded) {
      try {
        const savedDraft = localStorage.getItem(`forgeflow_draft_${formId}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          Object.keys(parsed).forEach(key => {
            setValue(key, parsed[key]);
          });
          toast.success('Your previously saved draft has been loaded.', 'Draft Restored');
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
      setDraftLoaded(true);
    }
  }, [form, formId, setValue, draftLoaded, toast]);

  useEffect(() => {
    if (!draftLoaded || !form) return;
    const timer = setTimeout(() => {
      try {
        const activeValues: Record<string, any> = {};
        Object.keys(formValues).forEach(key => {
          if (formValues[key] !== undefined && formValues[key] !== null && formValues[key] !== '') {
            activeValues[key] = formValues[key];
          }
        });
        if (Object.keys(activeValues).length > 0) {
          localStorage.setItem(`forgeflow_draft_${formId}`, JSON.stringify(activeValues));
        }
      } catch (e) {
        console.error('Failed to autosave draft:', e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [formValues, formId, draftLoaded, form]);

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
        honeypot
      });
      toast.success('Your answers have been submitted successfully.', 'Submission Received');
      try {
        localStorage.removeItem(`forgeflow_draft_${formId}`);
      } catch (_) {}
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.', 'Submission Error');
      setSubmissionError(err.message || 'Submission failed. Please check your answers and try again.');
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

  const theme = settings.theme || {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    fontFamily: 'Inter'
  };

  const primaryColor = theme.primaryColor || '#6366f1';
  const borderRadius = theme.borderRadius || '0.75rem';
  const fontFamily = theme.fontFamily
    ? `"${theme.fontFamily}", Geist, "Plus Jakarta Sans", Inter, system-ui, sans-serif`
    : 'Geist, "Plus Jakarta Sans", Inter, system-ui, sans-serif';

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
            <div className="space-y-4">
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

              {/* Progress Bar */}
              {(() => {
                const totalInputs = fields.filter(f => !['heading', 'divider', 'markdown', 'richtext', 'hidden'].includes(f.type));
                const filledInputsCount = totalInputs.filter(field => {
                  const val = formValues[field.id];
                  return val !== undefined && val !== null && val !== '' && (Array.isArray(val) ? val.length > 0 : true);
                }).length;
                const progressPercent = totalInputs.length > 0 ? Math.round((filledInputsCount / totalInputs.length) * 100) : 0;
                
                if (totalInputs.length === 0) return null;
                return (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-stone-500">
                      <span>Form Completion Progress</span>
                      <span>{progressPercent}% Complete</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: primaryColor
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
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
                  return (
                    <PublicFormField
                      key={field.id}
                      field={field}
                      register={register}
                      control={control}
                      errors={errors}
                      primaryColor={primaryColor}
                      inputCls={inputCls}
                      inputBorderRadius={inputBorderRadius}
                      handleFileUpload={handleFileUpload}
                      colSpan={colSpan}
                    />
                  );
                })}
              </div>

              {/* ── Submission error banner ── */}
              {submissionError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{submissionError}</span>
                </div>
              )}

              {/* ── Submit & Save Buttons ── */}
              <div className="pt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitMutation.isLoading}
                  className="flex-1 flex justify-center items-center gap-2 text-white px-6 py-3.5 font-semibold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const activeValues: Record<string, any> = {};
                      Object.keys(formValues).forEach(key => {
                        if (formValues[key] !== undefined && formValues[key] !== null && formValues[key] !== '') {
                          activeValues[key] = formValues[key];
                        }
                      });
                      localStorage.setItem(`forgeflow_draft_${formId}`, JSON.stringify(activeValues));
                      toast.success('Your progress has been saved locally. You can resume it at any time.', 'Draft Saved');
                    } catch (e) {
                      toast.error('Failed to save progress locally.', 'Draft Failed');
                    }
                  }}
                  className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-all border border-stone-200 cursor-pointer"
                >
                  Save & Resume Later
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
