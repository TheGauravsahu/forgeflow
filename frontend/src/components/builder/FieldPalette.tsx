import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Type, AlignLeft, Hash, Mail, Lock, Phone, Link2, Calendar, Clock, CheckSquare, Radio as RadioIcon, ChevronDown, Sliders, ToggleLeft, Upload, Image as ImageIcon, PenTool, EyeOff, Heading as HeadingIcon, Minus, FileCode, FileText } from 'lucide-react';
import { FieldType } from '../../types/shared';

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

interface FieldPaletteProps {
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (open: boolean) => void;
  addField: (type: FieldType) => void;
}

export function FieldPalette({ isLeftSidebarOpen, setIsLeftSidebarOpen, addField }: FieldPaletteProps) {
  return (
    <>
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
                            transition-all cursor-pointer group animate-fade-in"
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
    </>
  );
}
