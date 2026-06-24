import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { HelpCircle, Trash, Plus } from 'lucide-react';
import { FormField } from '../../types/shared';

const PropLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">{children}</label>
);

const PropInput = ({ value, onChange, placeholder, type = 'text', disabled = false }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full bg-surface-950 border border-surface-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 disabled:opacity-50"
  />
);

interface PropertiesPanelProps {
  selectedFieldId: string | null;
  selectedField: FormField | undefined;
  updateSelectedFieldProperty: (key: string, value: any) => void;
  fields: FormField[];
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
}

export function PropertiesPanel({
  selectedFieldId,
  selectedField,
  updateSelectedFieldProperty,
  fields,
  isRightSidebarOpen,
  setIsRightSidebarOpen
}: PropertiesPanelProps) {
  return (
    <>
      {/* RIGHT BACKDROP */}
      {isRightSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsRightSidebarOpen(false)} />
      )}

      {/* RIGHT: Property Editor */}
      <aside className={`w-72 bg-surface-900 border-l border-surface-800 flex flex-col overflow-hidden transition-transform duration-305 fixed inset-y-0 right-0 z-40 md:relative md:translate-x-0 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <h3 className="font-bold text-xs text-surface-200">Properties</h3>
          {selectedField && (
            <Badge variant="secondary" className="text-[9px] uppercase font-bold bg-brand-500/10 text-brand-400 border-brand-500/20">
              {selectedField.type}
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-4">
            {!selectedField ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center text-surface-500 animate-fade-in">
                <HelpCircle className="w-8 h-8 mb-2 text-surface-700" />
                <p className="text-xs max-w-[160px]">Select a field from the canvas to edit its properties</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Field ID */}
                <div>
                  <PropLabel>Field ID</PropLabel>
                  <PropInput value={selectedField.id} onChange={() => {}} disabled />
                </div>

                {/* Width */}
                <div>
                  <PropLabel>Layout Width</PropLabel>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['50', '100'].map(w => (
                      <button
                        key={w}
                        onClick={() => updateSelectedFieldProperty('width', w)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          selectedField.properties.width === w
                            ? 'bg-brand-500/15 border-brand-500/50 text-brand-400'
                            : 'bg-surface-950 border-surface-700 text-surface-400 hover:text-white'
                        }`}
                      >
                        {w}% Width
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-surface-800" />

                {/* Heading level */}
                {selectedField.type === 'heading' && (
                  <div>
                    <PropLabel>Heading Level</PropLabel>
                    <select
                      value={selectedField.properties.level || '2'}
                      onChange={(e) => updateSelectedFieldProperty('level', e.target.value)}
                      className="w-full bg-surface-950 border border-surface-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                    >
                      <option value="1">H1 — Largest</option>
                      <option value="2">H2 — Medium</option>
                      <option value="3">H3 — Small</option>
                      <option value="4">H4 — Smallest</option>
                    </select>
                  </div>
                )}

                {/* Markdown content */}
                {selectedField.type === 'markdown' && (
                  <div>
                    <PropLabel>Markdown Content</PropLabel>
                    <textarea
                      value={selectedField.properties.content || ''}
                      onChange={(e) => updateSelectedFieldProperty('content', e.target.value)}
                      className="w-full bg-surface-950 border border-surface-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50 h-28 resize-y font-mono"
                    />
                  </div>
                )}

                {!['divider', 'markdown', 'richtext'].includes(selectedField.type) && (
                  <>
                    <div>
                      <PropLabel>Label / Question</PropLabel>
                      <PropInput
                        value={selectedField.properties.label}
                        onChange={(e: any) => updateSelectedFieldProperty('label', e.target.value)}
                      />
                    </div>

                    <div>
                      <PropLabel>Description</PropLabel>
                      <PropInput
                        value={selectedField.properties.description || ''}
                        onChange={(e: any) => updateSelectedFieldProperty('description', e.target.value)}
                        placeholder="Optional subtitle..."
                      />
                    </div>

                    {['text', 'paragraph', 'number', 'email', 'password', 'phone', 'url'].includes(selectedField.type) && (
                      <div>
                        <PropLabel>Placeholder</PropLabel>
                        <PropInput
                          value={selectedField.properties.placeholder || ''}
                          onChange={(e: any) => updateSelectedFieldProperty('placeholder', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Required toggle */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="block text-xs font-semibold text-surface-200">Required</span>
                        <span className="text-[10px] text-surface-500">Must fill out this field</span>
                      </div>
                      <Switch
                        checked={selectedField.properties.required || false}
                        onCheckedChange={(v) => updateSelectedFieldProperty('required', v)}
                        className="data-[state=checked]:bg-brand-500"
                      />
                    </div>

                    <Separator className="bg-surface-800" />

                    {/* Visibility rules */}
                    <div>
                      <PropLabel>Conditional Visibility</PropLabel>
                      <div className="space-y-2">
                        {selectedField.properties.visibilityRules?.map((rule, idx) => (
                          <div key={idx} className="p-2.5 bg-surface-950 rounded-lg border border-surface-700 text-[10px] space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-surface-400">Rule #{idx + 1}</span>
                              <button
                                onClick={() => {
                                  const updatedRules = (selectedField.properties.visibilityRules || []).filter((_, rIdx) => rIdx !== idx);
                                  updateSelectedFieldProperty('visibilityRules', updatedRules);
                                }}
                                className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                            <select
                              value={rule.fieldId}
                              onChange={(e) => {
                                  const updatedRules = [...(selectedField.properties.visibilityRules || [])];
                                  updatedRules[idx] = { ...rule, fieldId: e.target.value };
                                  updateSelectedFieldProperty('visibilityRules', updatedRules);
                              }}
                              className="w-full bg-surface-900 border border-surface-700 text-white rounded p-1 text-[10px]"
                            >
                              <option value="">Select source field...</option>
                              {fields.filter(f => f.id !== selectedFieldId && !['heading', 'divider', 'markdown', 'richtext'].includes(f.type)).map(f => (
                                <option key={f.id} value={f.id}>{f.properties.label}</option>
                              ))}
                            </select>
                            <select
                              value={(rule as any).operator || ''}
                              onChange={(e) => {
                                  const updatedRules = [...(selectedField.properties.visibilityRules || [])];
                                  updatedRules[idx] = { ...rule, operator: e.target.value as any };
                                  updateSelectedFieldProperty('visibilityRules', updatedRules);
                              }}
                              className="w-full bg-surface-900 border border-surface-700 text-white rounded p-1 text-[10px]"
                            >
                              <option value="equals">Equals</option>
                              <option value="notEquals">Does Not Equal</option>
                              <option value="contains">Contains</option>
                              <option value="greaterThan">Greater Than</option>
                              <option value="lessThan">Less Than</option>
                              <option value="isEmpty">Is Empty</option>
                              <option value="isNotEmpty">Is Not Empty</option>
                            </select>
                            {!['isEmpty', 'isNotEmpty'].includes((rule as any).operator || '') && (
                              <input
                                type="text"
                                placeholder="Target value..."
                                value={rule.value}
                                onChange={(e) => {
                                    const updatedRules = [...(selectedField.properties.visibilityRules || [])];
                                    updatedRules[idx] = { ...rule, value: e.target.value };
                                    updateSelectedFieldProperty('visibilityRules', updatedRules);
                                }}
                                className="w-full bg-surface-900 border border-surface-700 text-white rounded p-1 text-[10px]"
                              />
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const updatedRules = [...(selectedField.properties.visibilityRules || [])];
                            updatedRules.push({ fieldId: '', condition: 'equals', value: '' });
                            updateSelectedFieldProperty('visibilityRules', updatedRules);
                          }}
                          className="w-full py-1.5 bg-surface-950 border border-dashed border-surface-700 hover:border-brand-500/40
                            text-brand-500 font-semibold rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Add Visibility Rule
                        </button>
                      </div>
                    </div>

                    <div>
                      <PropLabel>Help Text</PropLabel>
                      <PropInput
                        value={selectedField.properties.helpText || ''}
                        onChange={(e: any) => updateSelectedFieldProperty('helpText', e.target.value)}
                        placeholder="Shown below the field..."
                      />
                    </div>

                    {['text', 'paragraph', 'number', 'email', 'url', 'phone'].includes(selectedField.type) && (
                      <div>
                        <PropLabel>Default Value</PropLabel>
                        <PropInput
                          value={selectedField.properties.defaultValue || ''}
                          onChange={(e: any) => updateSelectedFieldProperty('defaultValue', e.target.value)}
                        />
                      </div>
                    )}

                    {['rating', 'slider', 'number', 'text', 'paragraph'].includes(selectedField.type) && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <PropLabel>{['text', 'paragraph'].includes(selectedField.type) ? 'Min Chars' : 'Min Value'}</PropLabel>
                          <PropInput
                            type="number"
                            value={selectedField.properties.min ?? ''}
                            onChange={(e: any) => updateSelectedFieldProperty('min', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <PropLabel>{['text', 'paragraph'].includes(selectedField.type) ? 'Max Chars' : 'Max Value'}</PropLabel>
                          <PropInput
                            type="number"
                            value={selectedField.properties.max ?? ''}
                            onChange={(e: any) => updateSelectedFieldProperty('max', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                      </div>
                    )}

                    {['text', 'paragraph'].includes(selectedField.type) && (
                      <div>
                        <PropLabel>Regex Pattern</PropLabel>
                        <PropInput
                          value={selectedField.properties.regexPattern || ''}
                          onChange={(e: any) => updateSelectedFieldProperty('regexPattern', e.target.value)}
                          placeholder="e.g. ^[A-Z]{3}$"
                        />
                      </div>
                    )}

                    <div>
                      <PropLabel>Custom Error Message</PropLabel>
                      <PropInput
                        value={selectedField.properties.customErrorMessage || ''}
                        onChange={(e: any) => updateSelectedFieldProperty('customErrorMessage', e.target.value)}
                        placeholder="e.g. Must format correctly"
                      />
                    </div>
                  </>
                )}

                {/* Options editor */}
                {['select', 'multiselect', 'radio', 'checkbox'].includes(selectedField.type) && (
                  <div>
                    <Separator className="bg-surface-800 mb-4" />
                    <PropLabel>Configure Choices</PropLabel>
                    <div className="space-y-2">
                      {selectedField.properties.options?.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Choice Label"
                            value={opt.label}
                            onChange={(e) => {
                              const updatedOptions = [...(selectedField.properties.options || [])];
                              updatedOptions[idx] = {
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')
                              };
                              updateSelectedFieldProperty('options', updatedOptions);
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-surface-950 border border-surface-700 text-white text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                          />
                          <button
                            onClick={() => {
                              const updatedOptions = (selectedField.properties.options || []).filter((_, oidx) => oidx !== idx);
                              updateSelectedFieldProperty('options', updatedOptions);
                            }}
                            className="p-1.5 bg-surface-950 border border-surface-700 hover:bg-surface-800 text-surface-500 hover:text-red-400 rounded-lg cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const updatedOptions = [...(selectedField.properties.options || [])];
                          const num = updatedOptions.length + 1;
                          updatedOptions.push({ label: `Option ${num}`, value: `option_${num}` });
                          updateSelectedFieldProperty('options', updatedOptions);
                        }}
                        className="w-full mt-1 py-1.5 bg-surface-950 hover:bg-surface-800 text-brand-500 hover:text-brand-400 font-semibold
                          border border-dashed border-brand-500/30 hover:border-brand-500/60 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
