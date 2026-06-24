import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { FormField, FieldType } from '../types/shared';

// dnd-kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// shadcn UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import {
  ArrowLeft,
  Settings,
  Eye,
  CheckCircle,
  HelpCircle,
  Trash,
  Plus,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Lock,
  Phone,
  Link2,
  Calendar,
  Clock,
  CheckSquare,
  Radio as RadioIcon,
  ChevronDown,
  Sliders,
  ToggleLeft,
  Upload,
  Image as ImageIcon,
  PenTool,
  Heading as HeadingIcon,
  Minus,
  FileCode,
  FileText,
  EyeOff,
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react';

interface PaletteItem {
  type: FieldType;
  label: string;
  icon: any;
  category: 'input' | 'choice' | 'advanced' | 'layout';
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'text', label: 'Short Text', icon: Type, category: 'input' },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, category: 'input' },
  { type: 'number', label: 'Number', icon: Hash, category: 'input' },
  { type: 'email', label: 'Email', icon: Mail, category: 'input' },
  { type: 'password', label: 'Password', icon: Lock, category: 'input' },
  { type: 'phone', label: 'Phone', icon: Phone, category: 'input' },
  { type: 'url', label: 'URL', icon: Link2, category: 'input' },
  { type: 'date', label: 'Date', icon: Calendar, category: 'input' },
  { type: 'time', label: 'Time', icon: Clock, category: 'input' },

  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'choice' },
  { type: 'radio', label: 'Radio Option', icon: RadioIcon, category: 'choice' },
  { type: 'select', label: 'Dropdown', icon: ChevronDown, category: 'choice' },
  { type: 'multiselect', label: 'Multi-Select', icon: FileText, category: 'choice' },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft, category: 'choice' },

  { type: 'rating', label: 'Rating', icon: Sliders, category: 'advanced' },
  { type: 'slider', label: 'Slider', icon: Sliders, category: 'advanced' },
  { type: 'file', label: 'File Upload', icon: Upload, category: 'advanced' },
  { type: 'image', label: 'Image Upload', icon: ImageIcon, category: 'advanced' },
  { type: 'signature', label: 'Signature', icon: PenTool, category: 'advanced' },
  { type: 'hidden', label: 'Hidden', icon: EyeOff, category: 'advanced' },

  { type: 'heading', label: 'Heading', icon: HeadingIcon, category: 'layout' },
  { type: 'divider', label: 'Divider', icon: Minus, category: 'layout' },
  { type: 'markdown', label: 'Markdown', icon: FileCode, category: 'layout' },
  { type: 'richtext', label: 'Rich Text', icon: AlignLeft, category: 'layout' }
];

export default function BuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const formId = id || '';

  useEffect(() => {
    const token = localStorage.getItem('forgeflow_token');
    if (!token) navigate('/auth');
  }, [navigate]);

  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // AI Theme generation state
  const [aiThemePrompt, setAiThemePrompt] = useState('');
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [aiThemeError, setAiThemeError] = useState<string | null>(null);

  // Responsiveness state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('My Custom Form');
  const [formDesc, setFormDesc] = useState('');
  const [formPublished, setFormPublished] = useState(false);
  const [formSettings, setFormSettings] = useState({
    successMessage: 'Thank you! Your submission has been received.',
    theme: {
      primaryColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      fontFamily: 'Plus Jakarta Sans'
    }
  });

  const query = trpc.form.get.useQuery({ id: formId }, { enabled: !!formId });
  const updateFormMutation = trpc.form.update.useMutation();

  useEffect(() => {
    if (query.data && !isLoaded) {
      setFields(((query.data.schema as unknown) as FormField[]) || []);
      setFormTitle(query.data.title);
      setFormDesc(query.data.description || '');
      setFormPublished(query.data.published);
      if (query.data.settings) setFormSettings(query.data.settings as any);
      setIsLoaded(true);
    }
  }, [query.data, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        await updateFormMutation.mutateAsync({
          id: formId,
          title: formTitle,
          description: formDesc,
          schema: fields,
          settings: formSettings,
          published: formPublished
        });
      } catch (e) {
        console.error('Error autosaving form:', e);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [fields, formTitle, formDesc, formSettings, formPublished, formId, isLoaded]);

  const generateThemeMutation = trpc.ai.generateTheme.useMutation();

  const handleGenerateThemeAI = async () => {
    if (!aiThemePrompt.trim()) return;
    setIsGeneratingTheme(true);
    setAiThemeError(null);
    try {
      const themeResult = await generateThemeMutation.mutateAsync({
        prompt: aiThemePrompt
      });
      setFormSettings({
        ...formSettings,
        theme: {
          primaryColor: themeResult.primaryColor,
          backgroundColor: themeResult.backgroundColor,
          borderRadius: themeResult.borderRadius,
          fontFamily: themeResult.fontFamily
        }
      });
      setAiThemePrompt('');
    } catch (err: any) {
      console.error(err);
      setAiThemeError(err.message || 'AI theme generation failed. Please check GEMINI_API_KEY config.');
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addField = (type: FieldType) => {
    const newId = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = {
      id: newId,
      type,
      properties: {
        label: PALETTE_ITEMS.find(p => p.type === type)?.label || 'Field Label',
        placeholder: ['text', 'paragraph', 'number', 'email', 'password', 'phone', 'url'].includes(type)
          ? 'Enter value...' : undefined,
        required: false,
        width: '100',
        visibilityRules: [],
        options: ['select', 'multiselect', 'radio', 'checkbox'].includes(type)
          ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }]
          : undefined,
        min: type === 'rating' ? 1 : type === 'slider' ? 0 : undefined,
        max: type === 'rating' ? 5 : type === 'slider' ? 100 : undefined,
        level: type === 'heading' ? '2' : undefined,
        content: type === 'markdown' ? '### Markdown Header\nEdit content properties on the right sidebar.' : undefined
      }
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newId);
  };

  const removeField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const updateSelectedFieldProperty = (key: string, value: any) => {
    if (!selectedFieldId) return;
    setFields(fields.map(field => {
      if (field.id === selectedFieldId) {
        return { ...field, properties: { ...field.properties, [key]: value } };
      }
      return field;
    }));
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const renderCanvasFieldPreview = (field: FormField) => {
    const props = field.properties;
    switch (field.type) {
      case 'heading':
        const HeaderTag = `h${props.level || 2}` as any;
        return (
          <div className="py-1">
            <HeaderTag className="text-white font-extrabold tracking-tight" style={{
              fontSize: props.level === '1' ? '1.875rem' : props.level === '2' ? '1.5rem' : props.level === '3' ? '1.25rem' : '1.125rem'
            }}>
              {props.label}
            </HeaderTag>
          </div>
        );
      case 'divider':
        return <div className="border-t border-surface-700 my-2" />;
      case 'markdown':
        return (
          <div className="text-xs text-surface-400 font-mono bg-surface-950 p-2.5 rounded-lg border border-surface-700 whitespace-pre-wrap">
            {props.content || 'Markdown Content...'}
          </div>
        );
      case 'richtext':
        return (
          <div className="p-3 bg-surface-950 rounded-lg border border-surface-700 text-surface-400 text-xs italic">
            [Rich Text Block Preview]
          </div>
        );
      default:
        return (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm font-semibold text-surface-100">{props.label || 'Field Label'}</span>
              {props.required && <span className="text-brand-400 text-xs font-bold">*</span>}
            </div>
            {props.description && <p className="text-xs text-surface-400 mb-2">{props.description}</p>}
            <input
              type="text"
              disabled
              placeholder={props.placeholder || 'Enter value...'}
              className="w-full bg-surface-950 border border-surface-700 text-surface-400 rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
            {props.helpText && <span className="text-[10px] text-surface-500 mt-1 block">{props.helpText}</span>}
          </div>
        );
    }
  };

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
      className={`w-full px-3 py-1.5 bg-surface-950 border border-surface-700 text-white text-xs rounded-lg 
        focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed text-surface-500' : ''}`}
    />
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white font-sans overflow-hidden">

      {/* HEADER */}
      <header className="h-14 bg-surface-900 border-b border-surface-800 px-5 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-surface-800 text-surface-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Separator orientation="vertical" className="h-5 bg-surface-700" />

          <div className="flex flex-col">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-surface-600 focus:border-brand-500 focus:outline-none text-sm font-bold text-white transition-colors py-0.5 max-w-[280px]"
            />
            <span className="text-[10px] text-surface-500 flex items-center gap-1 mt-0.5">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
                  <span className="text-brand-400/70">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>All saved</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Palette / Properties Toggle Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLeftSidebarOpen(!isLeftSidebarOpen);
              setIsRightSidebarOpen(false);
            }}
            className={`md:hidden text-xs border-surface-700 gap-1.5 cursor-pointer ${
              isLeftSidebarOpen ? 'bg-brand-500/20 text-brand-400 border-brand-500/50' : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Fields
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsRightSidebarOpen(!isRightSidebarOpen);
              setIsLeftSidebarOpen(false);
            }}
            className={`md:hidden text-xs border-surface-700 gap-1.5 cursor-pointer ${
              isRightSidebarOpen ? 'bg-brand-500/20 text-brand-400 border-brand-500/50' : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Properties
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsThemeOpen(true)}
            className="text-xs border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200 gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/form/${formId}`)}
            className="text-xs border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200 gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => setFormPublished(!formPublished)}
            className={`text-xs font-semibold gap-1.5 ${
              formPublished
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : 'bg-brand-500 hover:bg-brand-400 text-surface-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {formPublished ? 'Published' : 'Publish'}
          </Button>
        </div>
      </header>

      {/* BODY: 3-column layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Field Palette */}
        {/* LEFT BACKDROP */}
        {isLeftSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsLeftSidebarOpen(false)} />
        )}

        {/* LEFT: Field Palette */}
        <aside className={`w-64 bg-surface-900 border-r border-surface-800 flex flex-col overflow-hidden transition-transform duration-305 fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-bold text-xs text-surface-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Field Palette
            </h3>
            <p className="text-[10px] text-surface-500 mt-0.5">Click to add fields to your form</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-5">
              {(['input', 'choice', 'advanced', 'layout'] as const).map(category => {
                const items = PALETTE_ITEMS.filter(i => i.category === category);
                const labels: Record<string, string> = {
                  input: 'Input Fields', choice: 'Choice Fields', advanced: 'Advanced', layout: 'Layout'
                };
                return (
                  <div key={category}>
                    <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest block mb-2 pl-0.5">
                      {labels[category]}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {items.map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            onClick={() => addField(item.type)}
                            className="p-2.5 bg-surface-800 border border-surface-700 hover:border-brand-500/50 hover:bg-surface-750
                              text-surface-400 hover:text-brand-400 rounded-lg flex flex-col items-center gap-1.5 text-center
                              transition-all cursor-pointer group"
                          >
                            <Icon className="w-3.5 h-3.5 transition-colors" />
                            <span className="text-[9px] font-semibold leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* CENTER: Canvas */}
        <main className="flex-1 bg-[#09090b] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl w-full mx-auto">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-surface-800 rounded-2xl p-10 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-brand-400 animate-glow-pulse" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Your canvas is empty</h4>
                      <p className="text-xs text-surface-500 max-w-xs">
                        Select field types from the left panel to start building your form.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <SortableFieldWrapper
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onDelete={(e) => removeField(field.id, e)}
                          renderContent={() => renderCanvasFieldPreview(field)}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </main>

        {/* RIGHT: Property Editor */}
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

          <ScrollArea className="flex-1">
            <div className="p-4">
              {!selectedField ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center text-surface-500">
                  <HelpCircle className="w-8 h-8 mb-2 text-surface-700" />
                  <p className="text-xs max-w-[160px]">Select a field from the canvas to edit its properties</p>
                </div>
              ) : (
                <div className="space-y-4">
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
          </ScrollArea>
        </aside>
      </div>

      {/* THEME DIALOG */}
      <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
        <DialogContent className="bg-surface-900 border-surface-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-400" />
              Form Design Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 block">Primary Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formSettings.theme.primaryColor}
                  onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, primaryColor: e.target.value } })}
                  className="w-10 h-9 bg-transparent border border-surface-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formSettings.theme.primaryColor}
                  onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, primaryColor: e.target.value } })}
                  className="flex-1 px-3 py-1.5 bg-surface-950 border border-surface-700 text-sm text-white rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 block">Background Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formSettings.theme.backgroundColor}
                  onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, backgroundColor: e.target.value } })}
                  className="w-10 h-9 bg-transparent border border-surface-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formSettings.theme.backgroundColor}
                  onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, backgroundColor: e.target.value } })}
                  className="flex-1 px-3 py-1.5 bg-surface-950 border border-surface-700 text-sm text-white rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 block">Border Radius</Label>
              <select
                value={formSettings.theme.borderRadius}
                onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, borderRadius: e.target.value } })}
                className="w-full bg-surface-950 border border-surface-700 text-white rounded-lg px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="0px">Sharp (0px)</option>
                <option value="0.375rem">Small (6px)</option>
                <option value="0.5rem">Medium (8px)</option>
                <option value="0.75rem">Large (12px)</option>
                <option value="1rem">Pill (16px)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 block">Success Message</Label>
              <input
                type="text"
                value={formSettings.successMessage}
                onChange={(e) => setFormSettings({ ...formSettings, successMessage: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface-950 border border-surface-700 text-sm text-white rounded-lg focus:outline-none"
              />
            </div>

            <Separator className="bg-surface-800 my-4" />

            <div className="space-y-3">
              <Label className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Theme Stylist ✨
              </Label>
              <p className="text-[10px] text-surface-500">Describe your preferred aesthetic (e.g. "forest spa", "cyberpunk neon", "clean medical clinic", "midnight luxury") to generate custom styles.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. elegant midnight gold..."
                  value={aiThemePrompt}
                  onChange={(e) => setAiThemePrompt(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-surface-950 border border-surface-700 text-sm text-white rounded-lg focus:outline-none placeholder-surface-600 font-sans"
                />
                <button
                  type="button"
                  disabled={isGeneratingTheme || !aiThemePrompt.trim()}
                  onClick={handleGenerateThemeAI}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-surface-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 border-0"
                >
                  {isGeneratingTheme ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
              {aiThemeError && (
                <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">{aiThemeError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsThemeOpen(false)} className="bg-brand-500 hover:bg-brand-400 text-surface-950 font-semibold border-0 cursor-pointer">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FieldWrapperProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  renderContent: () => React.ReactNode;
}

function SortableFieldWrapper({ field, isSelected, onSelect, onDelete, renderContent }: FieldWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 'auto' as any,
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative p-5 bg-surface-900 border rounded-xl shadow-sm transition-all select-none cursor-pointer ${
        isSelected
          ? 'border-brand-500/60 ring-2 ring-brand-500/10 shadow-brand-sm'
          : 'border-surface-800 hover:border-surface-700'
      }`}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          {...listeners}
          {...attributes}
          className="p-1.5 hover:bg-surface-800 text-surface-500 hover:text-white rounded-lg cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-surface-800 text-surface-500 hover:text-red-400 rounded-lg cursor-pointer"
          title="Delete field"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="pr-16 pointer-events-none">
        {renderContent()}
      </div>

      <div className="absolute left-3 bottom-2 text-[9px] text-surface-700 font-mono">
        {field.type} · {field.properties.width}%
      </div>
    </div>
  );
}
