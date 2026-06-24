import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  Shield,
  Layers,
  Eye,
  Inbox,
  Settings,
  Heart,
  Save,
  Trash,
  Download,
  Upload,
  Copy,
  Check,
  Palette,
  Moon,
  Sun,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useThemeStore, PRESET_THEMES, AppTheme } from '@/store/useThemeStore';
import { useToastStore } from '@/store/useToastStore';

const LOGO_ICONS: AppTheme['logoIcon'][] = [
  'Sparkles',
  'Zap',
  'Flame',
  'Shield',
  'Layers',
  'Eye',
  'Inbox',
  'Settings',
  'Heart'
];

const LOGO_ICON_COMPONENTS = {
  Sparkles,
  Zap,
  Flame,
  Shield,
  Layers,
  Eye,
  Inbox,
  Settings,
  Heart
};

const FONTS = [
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Sleek)' },
  { value: 'Inter', label: 'Inter (Clean Sans)' },
  { value: 'Geist', label: 'Geist (Modern Sans)' },
  { value: 'Geist Mono', label: 'Geist Mono (Developer)' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Console)' }
];

const ACCENT_PRESETS = [
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#2563eb', name: 'Royal Blue' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' }
];

export function ThemeCustomizer() {
  const { activeTheme, customThemes, setActiveTheme, saveTheme, deleteTheme, importTheme } = useThemeStore();
  const toast = useToastStore();

  // Temporary edit states
  const [themeName, setThemeName] = useState(activeTheme.name);
  const [accentColor, setAccentColor] = useState(activeTheme.accentColor);
  const [isDark, setIsDark] = useState(activeTheme.isDark);
  const [fontFamily, setFontFamily] = useState(activeTheme.fontFamily);
  const [borderRadius, setBorderRadius] = useState(activeTheme.borderRadius);
  const [sidebarStyle, setSidebarStyle] = useState(activeTheme.sidebarStyle);
  const [cardStyle, setCardStyle] = useState(activeTheme.cardStyle);
  const [buttonStyle, setButtonStyle] = useState(activeTheme.buttonStyle);
  const [logoIcon, setLogoIcon] = useState(activeTheme.logoIcon);

  // Full color palette states
  const [bgColor, setBgColor] = useState(activeTheme.colors.background);
  const [fgColor, setFgColor] = useState(activeTheme.colors.foreground);
  const [cardColor, setCardColor] = useState(activeTheme.colors.card);
  const [cardFgColor, setCardFgColor] = useState(activeTheme.colors.cardForeground);
  const [borderColor, setBorderColor] = useState(activeTheme.colors.border);
  const [mutedColor, setMutedColor] = useState(activeTheme.colors.mutedForeground);

  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Update live preview parameters
  const getEditingTheme = (): AppTheme => ({
    id: activeTheme.id.startsWith('custom-') ? activeTheme.id : `custom-${Date.now()}`,
    name: themeName,
    isDark,
    accentColor,
    fontFamily,
    borderRadius,
    sidebarStyle,
    cardStyle,
    buttonStyle,
    logoIcon,
    colors: {
      background: bgColor,
      foreground: fgColor,
      card: cardColor,
      cardForeground: cardFgColor,
      border: borderColor,
      mutedForeground: mutedColor,
    }
  });

  const handleApplyNow = () => {
    const editTheme = getEditingTheme();
    setActiveTheme(editTheme);
    toast.success('Theme applied successfully!', 'Appearance Updated');
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) {
      toast.error('Please enter a theme name first.', 'Validation Error');
      return;
    }
    const editTheme = getEditingTheme();
    saveTheme({ ...editTheme, id: `custom-${Date.now()}` });
    toast.success(`Theme "${themeName}" saved to library!`, 'Theme Saved');
  };

  const handlePresetSelect = (preset: AppTheme) => {
    setThemeName(preset.name);
    setAccentColor(preset.accentColor);
    setIsDark(preset.isDark);
    setFontFamily(preset.fontFamily);
    setBorderRadius(preset.borderRadius);
    setSidebarStyle(preset.sidebarStyle);
    setCardStyle(preset.cardStyle);
    setButtonStyle(preset.buttonStyle);
    setLogoIcon(preset.logoIcon);

    setBgColor(preset.colors.background);
    setFgColor(preset.colors.foreground);
    setCardColor(preset.colors.card);
    setCardFgColor(preset.colors.cardForeground);
    setBorderColor(preset.colors.border);
    setMutedColor(preset.colors.mutedForeground);

    setActiveTheme(preset);
  };

  const handleExportTheme = () => {
    const current = getEditingTheme();
    const config = JSON.stringify(current, null, 2);
    navigator.clipboard.writeText(config);
    setIsCopied(true);
    toast.success('Theme JSON copied to clipboard!', 'Config Exported');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadThemeFile = () => {
    const current = getEditingTheme();
    const config = JSON.stringify(current, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    link.click();
    toast.success('Theme file downloaded!', 'File Saved');
  };

  const handleImportTheme = () => {
    if (!importJson.trim()) return;
    const res = importTheme(importJson);
    if (res.success) {
      toast.success('Theme configuration imported successfully!', 'Theme Imported');
      setImportJson('');
      // Reload preset states
      setTimeout(() => window.location.reload(), 300);
    } else {
      toast.error(res.error || 'Import failed.', 'JSON Syntax Error');
    }
  };

  const handleLightDarkSwitch = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      setBgColor('#09090b');
      setFgColor('#f4f4f5');
      setCardColor('#0f0f12');
      setCardFgColor('#f4f4f5');
      setBorderColor('#27272f');
      setMutedColor('#71717a');
    } else {
      setBgColor('#f8fafc');
      setFgColor('#0f172a');
      setCardColor('#ffffff');
      setCardFgColor('#0f172a');
      setBorderColor('#e2e8f0');
      setMutedColor('#64748b');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-zinc-100 font-sans">
      
      {/* ─── LEFT COLUMN: CONTROLS (8 cols) ─────────────────────────────────── */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Presets Row */}
        <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme Presets Library
            </CardTitle>
            <p className="text-2xs text-zinc-500">Pick a starting preset or switch between themes.</p>
          </CardHeader>
          <CardContent className="p-5 flex flex-wrap gap-2.5">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  activeTheme.id === preset.id
                    ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                {preset.name}
              </button>
            ))}

            {customThemes.map((custom) => (
              <div key={custom.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePresetSelect(custom)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    activeTheme.id === custom.id
                      ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: custom.accentColor }} />
                  {custom.name}
                </button>
                <button
                  onClick={() => {
                    deleteTheme(custom.id);
                    toast.success('Custom theme removed.', 'Theme Deleted');
                  }}
                  className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                  title="Delete Custom Theme"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customization Workspace */}
        <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
          <CardHeader className="p-6 pb-2 border-b border-zinc-800/60">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              Customize Active Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSaveTheme} className="space-y-6">
              
              {/* Theme Name */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-300">Theme Name</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="My Custom Theme"
                    className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60"
                  />
                  <Button type="button" onClick={handleApplyNow} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-4">
                    Apply Live
                  </Button>
                </div>
              </div>

              {/* Mode & Accent Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dark/Light mode */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-zinc-300">Appearance Mode</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLightDarkSwitch(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-zinc-950 text-white border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-amber-500" />
                      Dark Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLightDarkSwitch(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        !isDark
                          ? 'bg-zinc-950 text-white border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Light Mode
                    </button>
                  </div>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Accent / Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-zinc-800 cursor-pointer bg-zinc-950 p-1"
                    />
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {ACCENT_PRESETS.map((p) => (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => setAccentColor(p.hex)}
                          className="w-6 h-6 rounded-full border border-zinc-850 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: p.hex }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Typography & Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Font family */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Font Family</Label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-amber-500/60"
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value} className="bg-zinc-950 text-zinc-200">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Border Radius */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Border Radius (Rounding)</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { value: '0px', label: 'None' },
                      { value: '6px', label: 'Sharp' },
                      { value: '10px', label: 'Medium' },
                      { value: '16px', label: 'Round' },
                      { value: '999px', label: 'Full' }
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setBorderRadius(r.value)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                          borderRadius === r.value
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Style Presets Grid (Sidebar, Card, Buttons) */}
              <div className="space-y-4">
                
                {/* Sidebar Style */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Sidebar Appearance</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'solid', label: 'Solid Solid' },
                      { value: 'transparent', label: 'Transparent' },
                      { value: 'glass', label: 'Glassmorphic' },
                      { value: 'bordered', label: 'Left Accent Border' }
                    ].map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSidebarStyle(s.value as any)}
                        className={`p-2.5 text-2xs font-bold uppercase tracking-wider rounded-xl border cursor-pointer text-center transition-all ${
                          sidebarStyle === s.value
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Card Design Structure</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'solid', label: 'Standard Solid' },
                      { value: 'glass', label: 'Glassmorphism' },
                      { value: 'high-contrast', label: 'High Contrast' },
                      { value: 'bordered-flat', label: 'Flat Bordered' }
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCardStyle(c.value as any)}
                        className={`p-2.5 text-2xs font-bold uppercase tracking-wider rounded-xl border cursor-pointer text-center transition-all ${
                          cardStyle === c.value
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Default Button Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'flat', label: 'Solid Accent' },
                      { value: 'gradient', label: 'Accent Gradient' },
                      { value: 'glass', label: 'Soft Glass' },
                      { value: 'outline', label: 'Glow Outline' }
                    ].map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setButtonStyle(b.value as any)}
                        className={`p-2.5 text-2xs font-bold uppercase tracking-wider rounded-xl border cursor-pointer text-center transition-all ${
                          buttonStyle === b.value
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* App logo icon selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">App Icon / Logo Mark</Label>
                  <div className="flex gap-2 flex-wrap">
                    {LOGO_ICONS.map((ico) => {
                      const isActive = logoIcon === ico;
                      const IconComponent = LOGO_ICON_COMPONENTS[ico] || Sparkles;
                      return (
                        <button
                          key={ico}
                          type="button"
                          onClick={() => setLogoIcon(ico)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-brand-500/15 border-brand-500/60 text-brand-500'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                          }`}
                          title={`Select ${ico} icon`}
                        >
                          <IconComponent className="w-5 h-5 text-inherit" />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Full Color Palette Editor */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setIsPaletteExpanded((v) => !v)}
                  className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer bg-transparent border-0"
                >
                  <span>Advanced Color Palette override</span>
                  <span>{isPaletteExpanded ? '▲ Collapse' : '▼ Expand'}</span>
                </button>

                {isPaletteExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 animate-fade-in">
                    
                    {/* Background */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Background Color</Label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                    {/* Foreground (text) */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Text Foreground Color</Label>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                    {/* Card background */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Card Background Color</Label>
                      <input
                        type="color"
                        value={cardColor}
                        onChange={(e) => setCardColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                    {/* Card Foreground */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Card Text Color</Label>
                      <input
                        type="color"
                        value={cardFgColor}
                        onChange={(e) => setCardFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                    {/* Borders */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Border Color</Label>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                    {/* Muted */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-zinc-400">Muted Text Color</Label>
                      <input
                        type="color"
                        value={mutedColor}
                        onChange={(e) => setMutedColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer bg-zinc-950"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800/60">
                <Button
                  id="btn-save-theme"
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold gap-2 px-6 rounded-xl flex items-center justify-center"
                >
                  <Save className="w-4 h-4" />
                  Save Custom Theme
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>

      {/* ─── RIGHT COLUMN: PREVIEW & IMPORT/EXPORT (5 cols) ───────────────── */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Live Preview Pane */}
        <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl overflow-hidden flex flex-col h-fit">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-500">
              Live Layout Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {/* Virtual Dashboard Mock Container */}
            <div
              className="border border-zinc-800 rounded-xl overflow-hidden flex h-60 text-[10px] select-none"
              style={{
                fontFamily: fontFamily + ', sans-serif',
                backgroundColor: bgColor,
                color: fgColor,
                borderRadius
              }}
            >
              {/* Virtual Sidebar */}
              <div
                className="w-20 border-r p-2 flex flex-col gap-3 justify-start"
                style={{
                  backgroundColor: sidebarStyle === 'solid' ? cardColor : sidebarStyle === 'glass' ? 'rgba(0,0,0,0.3)' : 'transparent',
                  borderColor: sidebarStyle === 'bordered' ? accentColor : borderColor,
                  borderWidth: sidebarStyle === 'bordered' ? '0 2px 0 0' : '0 1px 0 0',
                }}
              >
                {/* Mock Logo */}
                <div className="flex items-center gap-1 mt-1 justify-center">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span className="text-[7px] text-zinc-950">FF</span>
                  </div>
                  <span className="font-extrabold text-[8px]">Mock</span>
                </div>
                {/* Nav buttons */}
                <div className="space-y-1 mt-2">
                  <div className="p-1 rounded bg-zinc-800/40 flex items-center gap-1 font-semibold">
                    <LayoutGrid size={8} style={{ color: accentColor }} />
                    <span>Home</span>
                  </div>
                  <div className="p-1 rounded flex items-center gap-1 text-zinc-500">
                    <Settings size={8} />
                    <span>Config</span>
                  </div>
                </div>
              </div>

              {/* Virtual Content Pane */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor }}>
                  <span className="font-bold text-[9px] uppercase tracking-wide">Workspace details</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>
                {/* Virtual Card */}
                <div
                  className="p-3"
                  style={{
                    borderRadius,
                    backgroundColor: cardStyle === 'solid' ? cardColor : cardStyle === 'high-contrast' ? '#000' : 'rgba(255,255,255,0.02)',
                    border: cardStyle === 'bordered-flat' ? `1px solid ${borderColor}` : `1px solid ${borderColor}`,
                    boxShadow: cardStyle === 'glass' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <h4 className="font-bold mb-1" style={{ color: cardFgColor }}>Submissions collected</h4>
                  <p style={{ color: mutedColor }}>7 responses collected daily average.</p>
                </div>
                {/* Virtual Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    className="flex-1 py-1 text-center font-bold"
                    style={{
                      borderRadius,
                      border: buttonStyle === 'outline' ? `2px solid ${accentColor}` : 'none',
                      color: buttonStyle === 'outline' || buttonStyle === 'glass' ? accentColor : '#000',
                      background: buttonStyle === 'flat' ? accentColor : buttonStyle === 'gradient' ? `linear-gradient(135deg, ${accentColor} 0%, #1f1f1f 100%)` : buttonStyle === 'glass' ? `${accentColor}25` : 'transparent'
                    }}
                  >
                    Action
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-1 text-center font-semibold text-zinc-400 bg-zinc-800/50"
                    style={{ borderRadius }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import & Export Card */}
        <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-brand-500">
              Import & Export Config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            
            {/* Export buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleExportTheme}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold gap-1.5 py-2.5 rounded-xl border border-zinc-750"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy JSON Config
              </Button>
              <Button
                type="button"
                onClick={handleDownloadThemeFile}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold gap-1.5 py-2.5 rounded-xl border border-zinc-750"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON
              </Button>
            </div>

            <Separator className="bg-zinc-800/60" />

            {/* Import form */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400">Import Theme JSON</Label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Paste theme configuration JSON here e.g. { "id": "custom-123", "name": "Ocean", ... }'
                className="w-full h-24 text-2xs p-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-brand-500/50 font-mono text-zinc-300 placeholder-zinc-600 leading-relaxed resize-none"
              />
              <Button
                type="button"
                disabled={!importJson.trim()}
                onClick={handleImportTheme}
                className="w-full bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold gap-2 py-2 rounded-xl border-0 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                Import & Apply Config
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
