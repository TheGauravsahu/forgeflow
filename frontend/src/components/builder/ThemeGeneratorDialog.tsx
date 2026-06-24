import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings, Sparkles, Loader2 } from 'lucide-react';

interface ThemeGeneratorDialogProps {
  isThemeOpen: boolean;
  setIsThemeOpen: (open: boolean) => void;
  formSettings: any;
  setFormSettings: (settings: any) => void;
  aiThemePrompt: string;
  setAiThemePrompt: (prompt: string) => void;
  isGeneratingTheme: boolean;
  handleGenerateThemeAI: () => void;
  aiThemeError: string | null;
}

export function ThemeGeneratorDialog({
  isThemeOpen,
  setIsThemeOpen,
  formSettings,
  setFormSettings,
  aiThemePrompt,
  setAiThemePrompt,
  isGeneratingTheme,
  handleGenerateThemeAI,
  aiThemeError
}: ThemeGeneratorDialogProps) {
  return (
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
                value={formSettings.theme.primaryColor || '#f59e0b'}
                onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, primaryColor: e.target.value } })}
                className="w-10 h-9 bg-transparent border border-surface-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formSettings.theme.primaryColor || '#f59e0b'}
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
                value={formSettings.theme.backgroundColor || '#ffffff'}
                onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, backgroundColor: e.target.value } })}
                className="w-10 h-9 bg-transparent border border-surface-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formSettings.theme.backgroundColor || '#ffffff'}
                onChange={(e) => setFormSettings({ ...formSettings, theme: { ...formSettings.theme, backgroundColor: e.target.value } })}
                className="flex-1 px-3 py-1.5 bg-surface-950 border border-surface-700 text-sm text-white rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 block">Border Radius</Label>
            <select
              value={formSettings.theme.borderRadius || '0.5rem'}
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
              value={formSettings.successMessage || 'Thank you! Your submission has been received.'}
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
  );
}
