import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { FormField, FieldType } from '../types/shared';
import { FieldPalette } from '../components/builder/FieldPalette';
import { FormCanvas } from '../components/builder/FormCanvas';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';
import { ThemeGeneratorDialog } from '../components/builder/ThemeGeneratorDialog';

// dnd-kit Imports
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

// shadcn UI
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import {
  ArrowLeft,
  Settings,
  Eye,
  CheckCircle,
  Plus,
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

  const toast = useToastStore();
  const query = api.form.get.useQuery({ id: formId }, { enabled: !!formId });
  const updateFormMutation = api.form.update.useMutation();

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
      } catch (e: any) {
        toast.error(e.message || 'Error autosaving form', 'Autosave Failed');
        console.error('Error autosaving form:', e);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [fields, formTitle, formDesc, formSettings, formPublished, formId, isLoaded]);

  const generateThemeMutation = api.ai.generateTheme.useMutation();

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
      toast.success('New theme generated and applied successfully.', 'AI Theme Styling');
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'AI theme generation failed. Please check GEMINI_API_KEY config.';
      toast.error(msg, 'AI Theme Failed');
      setAiThemeError(msg);
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
        <FieldPalette
          isLeftSidebarOpen={isLeftSidebarOpen}
          setIsLeftSidebarOpen={setIsLeftSidebarOpen}
          addField={addField}
        />

        <FormCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          removeField={removeField}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
        />

        <PropertiesPanel
          selectedFieldId={selectedFieldId}
          selectedField={selectedField}
          updateSelectedFieldProperty={updateSelectedFieldProperty}
          fields={fields}
          isRightSidebarOpen={isRightSidebarOpen}
          setIsRightSidebarOpen={setIsRightSidebarOpen}
        />
      </div>

      <ThemeGeneratorDialog
        isThemeOpen={isThemeOpen}
        setIsThemeOpen={setIsThemeOpen}
        formSettings={formSettings}
        setFormSettings={setFormSettings}
        aiThemePrompt={aiThemePrompt}
        setAiThemePrompt={setAiThemePrompt}
        isGeneratingTheme={isGeneratingTheme}
        handleGenerateThemeAI={handleGenerateThemeAI}
        aiThemeError={aiThemeError}
      />
    </div>
  );
}
