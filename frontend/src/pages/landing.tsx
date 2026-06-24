import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { FORM_TEMPLATES } from '../lib/templates';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const toast = useToastStore();

  useEffect(() => {
    const token = localStorage.getItem('forgeflow_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const createFormMutation = api.form.create.useMutation();

  const handleUseTemplate = async (templateId: string) => {
    const template = FORM_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    if (!isLoggedIn) {
      // Store selected template in sessionStorage to initialize after auth
      sessionStorage.setItem('forgeflow_pending_template', templateId);
      navigate('/auth');
      return;
    }

    setLoadingTemplateId(templateId);
    try {
      const form = await createFormMutation.mutateAsync({
        title: template.title,
        description: template.description,
        schema: template.fields,
        settings: template.settings
      });
      navigate(`/builder/${form.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create form from template. Please try again.', 'Template Error');
      console.error('Failed to create form from template:', err);
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const getIcon = (name: string, className: string) => {
    const IconComponent = (Icons as any)[name];
    if (!IconComponent) return <Icons.FileText className={className} />;
    return <IconComponent className={className} />;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/40 bg-zinc-950/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Icons.Sparkles className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">ForgeFlow</span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
              Features
            </button>
            <button onClick={() => scrollToSection('templates')} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
              Templates
            </button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-sm px-4 py-2 rounded-lg cursor-pointer"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                  Sign In
                </button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-sm px-4 py-2 rounded-lg cursor-pointer"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
            <Icons.Sparkles className="w-3.5 h-3.5" />
            Introducing ForgeFlow 1.0
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans">
            Build Stunning Forms.<br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Capture Submissions.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A premium developer-first form builder. Design fields visually, configure custom styles, and collect submissions with ease.
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto h-11 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-base font-bold rounded-xl shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all cursor-pointer"
            >
              Start Building Free
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection('templates')}
              className="w-full sm:w-auto h-11 px-6 bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white text-base font-semibold rounded-xl transition-all cursor-pointer"
            >
              Browse Templates
            </Button>
          </div>
        </div>

        {/* Visual Mockup */}
        <div className="mt-16 relative rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 max-w-4xl mx-auto shadow-2xl shadow-black/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b] pointer-events-none z-10" />
          <div className="h-[320px] sm:h-[450px] rounded-lg bg-zinc-900/60 border border-zinc-800/60 p-6 flex flex-col overflow-hidden text-left">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <span className="w-3 h-3 rounded-full bg-green-500/40" />
                <span className="text-zinc-600 text-xs font-mono ml-2">forgeflow.dev/builder</span>
              </div>
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-2xs">Published</Badge>
            </div>
            
            {/* Mock Builder Canvas */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl">
                <span className="text-2xs font-bold text-zinc-600 uppercase tracking-widest">Fields Palette</span>
                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 flex items-center gap-2"><Icons.Type className="w-3.5 h-3.5 text-zinc-500" /> Short Text</div>
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 flex items-center gap-2"><Icons.Mail className="w-3.5 h-3.5 text-zinc-500" /> Email Input</div>
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 flex items-center gap-2"><Icons.CheckSquare className="w-3.5 h-3.5 text-zinc-500" /> Checkbox Group</div>
                </div>
              </div>
              <div className="md:col-span-2 bg-zinc-950/60 border border-dashed border-zinc-800 p-6 rounded-xl flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                  <Icons.FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Visual Design Area</h4>
                  <p className="text-2xs text-zinc-500 max-w-xs mt-1">Drag fields here, configure validations, and review live styles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="border-y border-zinc-800/30 py-8 bg-zinc-950/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-30 select-none">
          <span className="font-black text-zinc-400 text-lg tracking-wider font-mono">IPSUM</span>
          <span className="font-black text-zinc-400 text-lg tracking-wider font-mono">logo ipsum</span>
          <span className="font-black text-zinc-400 text-lg tracking-wider font-mono">Logoipsum</span>
        </div>
      </section>

      {/* ── PREBUILT TEMPLATES ── */}
      <section id="templates" className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white tracking-tight font-sans">Ship Prebuilt Templates</h2>
          <p className="text-sm text-zinc-500">Kickstart your workflow by deploying prebuilt templates fully customizable in seconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORM_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="group bg-zinc-900/40 border-zinc-800/80 hover:border-amber-500/30 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/5 group-hover:bg-amber-500 group-hover:text-zinc-900 transition-all duration-300">
                    {getIcon(template.iconName, "w-5 h-5")}
                  </div>
                  <Badge className="bg-zinc-950 border-zinc-800 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    {template.fields.length} Fields
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-white mt-4 group-hover:text-amber-100 transition-colors">
                  {template.title}
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed h-12 overflow-hidden">
                  {template.description}
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <Separator className="bg-zinc-800/60" />
                
                {/* Field breakdown list */}
                <div className="flex flex-wrap gap-1.5 h-12 overflow-hidden items-start">
                  {template.fields
                    .filter((f) => f.type !== 'heading')
                    .slice(0, 3)
                    .map((field) => (
                      <span key={field.id} className="text-[10px] font-semibold bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-md">
                        {field.properties.label}
                      </span>
                    ))}
                  {template.fields.filter((f) => f.type !== 'heading').length > 3 && (
                    <span className="text-[9px] font-bold text-amber-500/70 px-1 py-0.5">
                      +{template.fields.filter((f) => f.type !== 'heading').length - 3} more
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={loadingTemplateId === template.id}
                  className="w-full bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-800 hover:border-amber-500 font-semibold text-xs py-2 rounded-xl transition-all gap-2 cursor-pointer"
                >
                  {loadingTemplateId === template.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section id="features" className="relative z-10 py-24 bg-zinc-950/20 border-y border-zinc-800/30 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight font-sans">Engineering Features</h2>
            <p className="text-sm text-zinc-500 font-sans">Designed for modern developers who need visual efficiency and standard protocols.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Icons.Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Drag & Drop</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add input text, multi-select dropdowns, file upload containers, signature pads, and more with our workspace panel.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Icons.BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Advanced Analytics</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Track completion metrics, inspect submission velocity graphs, breakdown choices with charts, and export CSV outputs instantly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Icons.Webhook className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Webhooks & API</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Receive POST requests on your server immediately upon form submission, or fetch submissions using standard API tokens.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800/30 bg-zinc-950/60 relative z-10 py-12 px-6 text-center text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
              <Icons.Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            </div>
            <span className="font-black text-sm text-white tracking-tight">ForgeFlow</span>
          </div>
          <p>© {new Date().getFullYear()} ForgeFlow. Built for developers with Geist variable fonts.</p>
        </div>
      </footer>

    </div>
  );
}
