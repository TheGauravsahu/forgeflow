import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { ChevronDown, Star, Upload, ImageIcon, Check, X, AlertCircle } from 'lucide-react';
import { FormField } from '../../types/shared';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SignatureCanvas as SignaturePad } from './SignatureCanvas';

interface PublicFormFieldProps {
  field: FormField;
  register: any;
  control: any;
  errors: any;
  primaryColor: string;
  inputCls: (hasError: boolean, extra?: string) => string;
  inputBorderRadius: React.CSSProperties;
  handleFileUpload: (fieldId: string, file: File | null) => void;
  colSpan: string;
}

export function PublicFormField({
  field,
  register,
  control,
  errors,
  primaryColor,
  inputCls,
  inputBorderRadius,
  handleFileUpload,
  colSpan
}: PublicFormFieldProps) {
  const isRequired = field.properties.required;
  const fieldError = errors[field.id];
  const hasError = !!fieldError;

  return (
    <div className={`${colSpan} flex flex-col gap-1.5`}>
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
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-[0.95] cursor-pointer"
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
                      className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
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
}
