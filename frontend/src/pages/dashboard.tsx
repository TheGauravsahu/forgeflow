import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
   Archive,
  FileText,
  Trash2,
  Search,
  Copy,
  Edit,
  BarChart2,
  Sparkles,
  Inbox,
  Share2,
  ChevronRight,
  LayoutGrid,
  List,
  MoreVertical,
  FolderInput,
  ArrowUpDown,
  Calendar,
  TrendingUp,
  Menu,
  Plus,
  FolderPlus,
  Check,
  Code,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FORM_TEMPLATES } from '../lib/templates';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Developer');

  // Search, Filter & Layout State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'submissions' | 'alphabetical'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dialog State
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');

  // AI Creation State
  const [creationTab, setCreationTab] = useState<'template' | 'ai'>('template');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Responsiveness State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [copiedEmbedId, setCopiedEmbedId] = useState<string | null>(null);
  const [formToDeleteId, setFormToDeleteId] = useState<string | null>(null);
  const [folderToDeleteId, setFolderToDeleteId] = useState<string | null>(null);

  // Section switcher & Admin states
  const [currentSection, setCurrentSection] = useState<'forms' | 'marketplace' | 'admin'>('forms');
  const [isAdmin, setIsAdmin] = useState(false);

  // Form Edit States (Rename, Move, Share)
  const [renameForm, setRenameForm] = useState<any | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const [moveForm, setMoveForm] = useState<any | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>('root');

  const [shareForm, setShareForm] = useState<any | null>(null);

  // Marketplace states (declared at top level to satisfy React Hook Rules)
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [marketplaceSearchVal, setMarketplaceSearchVal] = useState<string>('');

  // Authenticate Client-side
  useEffect(() => {
    const savedToken = localStorage.getItem('forgeflow_token');
    const savedUser = localStorage.getItem('forgeflow_user');
    if (!savedToken) {
      navigate('/auth');
    } else {
      setToken(savedToken);
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setUserName(u.name || 'Developer');
          setIsAdmin(!!u.isAdmin);
        } catch (_) { }
      }
    }
  }, [navigate]);

  // Sync state from location.state if navigated from admin
  useEffect(() => {
    if (location.state) {
      const stateObj = location.state as any;
      if (stateObj.section) {
        setCurrentSection(stateObj.section);
      }
      if (stateObj.folderId !== undefined) {
        setSelectedFolderId(stateObj.folderId);
      }
      if (stateObj.showArchived !== undefined) {
        setShowArchived(stateObj.showArchived);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (currentSection === 'admin' && !isAdmin && token) {
      setCurrentSection('forms');
    }
  }, [currentSection, isAdmin, token]);

  // Queries & Mutations
  const toast = useToastStore();
  const utils = api.useContext();
  const foldersQuery = api.form.getFolders.useQuery(undefined, { enabled: !!token });
  const formsQuery = api.form.list.useQuery(
    {
      folderId: selectedFolderId === null ? 'root' : selectedFolderId,
      isArchived: showArchived,
      search: searchQuery
    },
    { enabled: !!token }
  );

  const createFormMutation = api.form.create.useMutation({
    onSuccess: (data) => {
      toast.success('Form created successfully!', 'Form Created');
      utils.form.list.invalidate();
      setIsCreateFormOpen(false);
      setNewFormTitle('');
      setNewFormDesc('');
      setSelectedTemplateId('blank');
      setAiPrompt('');
      setCreationTab('template');
      setAiError(null);
      navigate(`/builder/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create form.', 'Form Creation Failed');
    }
  });

  const generateFormMutation = api.ai.generateForm.useMutation();

  // Instantiate pending template if chosen from landing page
  useEffect(() => {
    const pendingTemplate = sessionStorage.getItem('forgeflow_pending_template');
    if (pendingTemplate && token) {
      sessionStorage.removeItem('forgeflow_pending_template');
      const template = FORM_TEMPLATES.find((t) => t.id === pendingTemplate);
      if (template) {
        createFormMutation.mutate({
          title: template.title,
          description: template.description,
          schema: template.fields,
          settings: template.settings
        });
      }
    }
  }, [token, createFormMutation]);

  const createFolderMutation = api.form.createFolder.useMutation({
    onSuccess: () => {
      toast.success('Folder created successfully!', 'Folder Created');
      utils.form.getFolders.invalidate();
      setIsCreateFolderOpen(false);
      setNewFolderName('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create folder.', 'Folder Creation Failed');
    }
  });

  const deleteFolderMutation = api.form.deleteFolder.useMutation({
    onSuccess: () => {
      toast.success('Folder deleted successfully.', 'Folder Deleted');
      utils.form.getFolders.invalidate();
      utils.form.list.invalidate();
      setSelectedFolderId(null);
      setFolderToDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete folder.', 'Folder Deletion Failed');
    }
  });

  const duplicateFormMutation = api.form.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Form duplicated successfully.', 'Form Duplicated');
      utils.form.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to duplicate form.', 'Duplication Failed');
    }
  });

  const archiveFormMutation = api.form.update.useMutation({
    onSuccess: () => {
      toast.success('Form archive status updated.', 'Success');
      utils.form.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update form.', 'Error');
    }
  });

  const updateFormMutation = api.form.update.useMutation({
    onSuccess: () => {
      toast.success('Form updated successfully.', 'Success');
      utils.form.list.invalidate();
      utils.form.getFolders.invalidate();
      setRenameForm(null);
      setMoveForm(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update form.', 'Error');
    }
  });

  const deleteFormMutation = api.form.delete.useMutation({
    onSuccess: () => {
      toast.success('Form deleted permanently.', 'Form Deleted');
      utils.form.list.invalidate();
      setFormToDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete form.', 'Deletion Failed');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('forgeflow_token');
    localStorage.removeItem('forgeflow_user');
    navigate('/auth');
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    let schema: any[] = [];
    let settings: any = null;

    if (selectedTemplateId !== 'blank') {
      const template = FORM_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (template) {
        schema = template.fields;
        settings = template.settings;
      }
    }

    await createFormMutation.mutateAsync({
      title: newFormTitle,
      description: newFormDesc,
      folderId: selectedFolderId,
      schema,
      settings
    });
  };

  const handleCreateFormAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const generated = await generateFormMutation.mutateAsync({
        prompt: aiPrompt
      });

      await createFormMutation.mutateAsync({
        title: generated.title,
        description: generated.description,
        schema: generated.fields,
        settings: generated.settings,
        folderId: selectedFolderId
      });
      toast.success('Form schema generated and form created successfully!', 'AI Form Success');
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'AI Form Generation failed. Please verify that GEMINI_API_KEY is configured in backend environment .env file.';
      toast.error(msg, 'AI Generation Failed');
      setAiError(msg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolderMutation.mutateAsync({ name: newFolderName });
  };

  const handleRenameFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameForm || !renameTitle.trim()) return;
    await updateFormMutation.mutateAsync({
      id: renameForm.id,
      title: renameTitle
    });
  };

  const handleMoveFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveForm) return;
    await updateFormMutation.mutateAsync({
      id: moveForm.id,
      folderId: moveTargetFolderId === 'root' ? null : moveTargetFolderId
    });
  };

  const handleCopyLink = (formId: string) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const handleCopyEmbedCode = (formId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/form/${formId}" style="width:100%; height:600px; border:none; border-radius:8px;" allow="geolocation; microphone; camera"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbedId(formId);
    setTimeout(() => setCopiedEmbedId(null), 2000);
  };

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const currentSectionLabel = currentSection === 'marketplace'
    ? 'Templates Marketplace'
    : currentSection === 'admin'
      ? 'Admin Dashboard'
      : showArchived
        ? 'Archived Forms'
        : selectedFolderId
          ? foldersQuery.data?.find((f) => f.id === selectedFolderId)?.name || 'Folder'
          : 'All Forms';

  // Client-side calculations for sorting & stats
  const activeForms = formsQuery.data ? formsQuery.data.filter((f) => !f.isArchived) : [];
  const totalSubmissions = activeForms.reduce((acc, f) => acc + f._count.submissions, 0);
  const liveFormsCount = activeForms.filter((f) => f.published).length;
  const draftFormsCount = activeForms.filter((f) => !f.published).length;

  // Sorting logic
  const sortedForms = formsQuery.data ? [...formsQuery.data].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    if (sortBy === 'submissions') {
      return b._count.submissions - a._count.submissions;
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  }) : [];

  // Recent 3 forms logic (non-archived)
  const recentForms = activeForms
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Generate submissions mock trend curve matching total submissions count
  const mockTimelineData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (totalSubmissions === 0) {
      return days.map(d => ({ day: d, count: 0 }));
    }
    const distribution = [0.1, 0.15, 0.08, 0.22, 0.28, 0.11, 0.06];
    return days.map((d, i) => ({
      day: d,
      count: Math.max(1, Math.round(totalSubmissions * distribution[i]))
    }));
  })();

  const handleUseTemplateFromMarketplace = async (template: any) => {
    try {
      const form = await createFormMutation.mutateAsync({
        title: template.title,
        description: template.description || 'A form created from template',
        schema: template.fields,
        settings: template.settings || {
          successMessage: 'Thank you! Your submission has been received.',
          theme: {
            primaryColor: '#6366f1',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            fontFamily: 'Inter'
          }
        }
      });
      navigate(`/builder/${form.id}`);
      toast.success('Form layout imported from marketplace!', 'Template Imported');
    } catch (err: any) {
      toast.error(err.message || 'Failed to import template.', 'Import Error');
    }
  };

  // Nested Templates Marketplace View
  const renderMarketplace = () => {
    const categories = ['all', 'feedback', 'registration', 'lead-gen', 'applications'];

    const filteredTemplates = FORM_TEMPLATES.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(marketplaceSearchVal.toLowerCase()) || 
                            t.description.toLowerCase().includes(marketplaceSearchVal.toLowerCase());
      if (filterCategory === 'all') return matchesSearch;
      
      const categoryMap: Record<string, string> = {
        'contact-form': 'feedback',
        'event-registration': 'registration',
        'newsletter-signup': 'lead-gen',
        'job-application': 'applications',
        'customer-satisfaction': 'feedback',
        'product-feedback': 'feedback'
      };
      return categoryMap[t.id] === filterCategory && matchesSearch;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Form Templates Marketplace</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Explore premium form templates crafted for surveys, conversion, and applications.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search templates..."
              value={marketplaceSearchVal}
              onChange={(e) => setMarketplaceSearchVal(e.target.value)}
              className="px-3.5 py-1.5 w-60 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Categories list */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border-0 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((t) => (
            <Card
              key={t.id}
              className="bg-zinc-900/20 border-zinc-800/80 hover:border-amber-500/30 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
            >
              <CardHeader className="p-5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <Badge className="bg-zinc-950 border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {t.fields.length} Fields
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-white mt-4">{t.title}</CardTitle>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed h-12 overflow-hidden">{t.description}</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <Separator className="bg-zinc-800/60" />
                <Button
                  onClick={() => handleUseTemplateFromMarketplace(t)}
                  className="w-full bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-800 hover:border-amber-500 font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Note: renderAdminDashboard has been moved to its own dedicated page at src/pages/admin.tsx

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <span className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
            <span className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-zinc-500 font-medium">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden">
      <DashboardSidebar
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        foldersQuery={foldersQuery}
        formsQuery={formsQuery}
        setIsCreateFolderOpen={setIsCreateFolderOpen}
        setFolderToDeleteId={setFolderToDeleteId}
        userInitials={userInitials}
        userName={userName}
        handleLogout={handleLogout}
        navigate={navigate}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        isAdmin={isAdmin}
      />

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950/20">        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm px-6 flex items-center justify-between flex-shrink-0">
          {/* Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded-lg cursor-pointer border-0 bg-transparent"
            >
              <Menu className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className="font-medium">Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-300 font-semibold">{currentSectionLabel}</span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
              <input
                id="search-forms"
                type="text"
                placeholder="Search forms…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 w-56 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Templates Toggle Button */}
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateFormOpen(true);
                setSelectedTemplateId('contact-form');
              }}
              className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              Templates
            </Button>

            {/* New Form */}
            <Button
              id="btn-create-form"
              onClick={() => {
                setIsCreateFormOpen(true);
                setSelectedTemplateId('blank');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-lg shadow-amber-500/10 cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Form
            </Button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {currentSection === 'marketplace' ? (
            renderMarketplace()
          ) : currentSection === 'admin' ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <>

          {/* ─── 1. OVERVIEW STATS & ACTIVITY CHART ───────────────────────────── */}
          {!formsQuery.isLoading && activeForms.length > 0 && !showArchived && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Aggregate Stats */}
              <Card className="lg:col-span-1 bg-zinc-900/30 border-zinc-800/60 rounded-2xl shadow-none p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{totalSubmissions}</span>
                    <span className="text-xs text-zinc-500 font-medium">submissions total</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
                    <div>
                      <span className="text-[10px] text-zinc-600 block uppercase font-black">Live Forms</span>
                      <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{liveFormsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-600 block uppercase font-black">Drafts</span>
                      <span className="text-lg font-bold text-zinc-400 mt-0.5 block">{draftFormsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mini area chart */}
              <Card className="lg:col-span-2 bg-zinc-900/30 border-zinc-800/60 rounded-2xl shadow-none p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Submission Traffic</h3>
                    <p className="text-[10px] text-zinc-500">Form entries collected over the past week</p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-extrabold tracking-widest">7 Days</Badge>
                </div>
                <div className="h-[96px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTimelineData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashAmberGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272f/30" vertical={false} />
                      <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '11px',
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#dashAmberGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* ─── 2. RECENT ACTIVITY ROW ────────────────────────────────────────── */}
          {!formsQuery.isLoading && recentForms.length > 0 && !showArchived && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Recent Forms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recentForms.map((form) => {
                  const settings = ((form as any).settings) || {};
                  const primaryColor = settings.theme?.primaryColor || '#f59e0b';
                  return (
                    <Card
                      key={`recent-${form.id}`}
                      className="bg-zinc-900/20 border-zinc-800/60 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all rounded-xl shadow-none overflow-hidden relative cursor-pointer"
                      onClick={() => navigate(`/builder/${form.id}`)}
                    >
                      <div className="h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}22, ${primaryColor})` }} />
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{form.title}</h4>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Updated {new Date(form.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-400 border-0 flex-shrink-0 text-xs font-bold">
                          {form._count.submissions}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Separator if recent forms are shown */}
          {!formsQuery.isLoading && recentForms.length > 0 && !showArchived && (
            <Separator className="bg-zinc-800/60" />
          )}

          {/* ─── 3. MAIN FILTER & FORMS SECTION ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Header controls: Sort, layout view toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{currentSectionLabel}</span>
                  <Badge className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-bold">
                    {formsQuery.data ? `${formsQuery.data.length} total` : '0'}
                  </Badge>
                </h2>
              </div>

              {!formsQuery.isLoading && (formsQuery.data?.length ?? 0) > 0 && (
                <div className="flex items-center gap-3 self-end sm:self-auto">

                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-transparent border-0 text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="newest" className="bg-zinc-900">Newest</option>
                      <option value="oldest" className="bg-zinc-900">Oldest</option>
                      <option value="submissions" className="bg-zinc-900">Submissions</option>
                      <option value="alphabetical" className="bg-zinc-900">Alphabetical</option>
                    </select>
                  </div>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded-md transition-all cursor-pointer border-0 bg-transparent ${viewMode === 'grid' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded-md transition-all cursor-pointer border-0 bg-transparent ${viewMode === 'list' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {formsQuery.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-52 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!formsQuery.isLoading && formsQuery.data?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Inbox className="w-6 h-6 text-amber-500/60" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {showArchived ? 'No archived forms' : 'No forms yet'}
                </h3>
                <p className="text-xs text-zinc-500 text-center max-w-[240px] mb-5 leading-relaxed">
                  {showArchived
                    ? 'Forms you archive will appear here.'
                    : 'Build your first drag-and-drop form in seconds.'}
                </p>
                {!showArchived && (
                  <button
                    onClick={() => {
                      setIsCreateFormOpen(true);
                      setSelectedTemplateId('blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create your first form
                  </button>
                )}
              </div>
            )}

            {/* Grid View Rendering */}
            {!formsQuery.isLoading && sortedForms.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedForms.map((form) => {
                  const settings = ((form as any).settings) || {};
                  const primaryColor = settings.theme?.primaryColor || '#f59e0b';
                  return (
                    <Card
                      key={form.id}
                      className="group relative bg-zinc-900/40 border-zinc-800/60 hover:border-amber-500/25 hover:bg-zinc-900/75 rounded-2xl shadow-none hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Mock mini form preview banner */}
                        <div
                          className="h-12 w-full bg-gradient-to-r relative border-b border-zinc-800/40 overflow-hidden"
                          style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}0a)` }}
                        >
                          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/0 group-hover:via-amber-500/20 to-transparent transition-all duration-300" />
                          {/* Colored stripe representing form primary theme */}
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: primaryColor }} />
                          {/* Miniature mock input lines */}
                          <div className="absolute left-4 top-3.5 w-1/3 h-1.5 bg-zinc-800/80 rounded" />
                          <div className="absolute left-4 top-6.5 w-1/2 h-1 bg-zinc-800/40 rounded" />
                        </div>

                        <CardHeader className="px-5 pt-4 pb-2 space-y-1.5 relative">
                          <div className="flex items-start justify-between gap-4">
                            <CardTitle className="text-sm font-bold text-white group-hover:text-amber-100 transition-colors leading-snug truncate flex-1 pt-0.5">
                              {form.title}
                            </CardTitle>

                            {/* Dropdown Options Context Menu */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Badge
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${form.published
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                  }`}
                              >
                                {form.published ? 'Live' : 'Draft'}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-xs" className="text-zinc-500 hover:text-white rounded-md cursor-pointer h-7 w-7">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-44 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl p-1" align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRenameForm(form);
                                      setRenameTitle(form.title);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Rename</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMoveForm(form);
                                      setMoveTargetFolderId(form.folderId || 'root');
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                  >
                                    <FolderInput className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Move to Folder</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => duplicateFormMutation.mutate({ id: form.id })}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Duplicate</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setShareForm(form)}
                                    disabled={!form.published}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none disabled:opacity-40"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Share & Embed</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
                                  <DropdownMenuItem
                                    onClick={() => archiveFormMutation.mutate({ id: form.id, isArchived: !form.isArchived })}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>{form.isArchived ? 'Restore' : 'Archive'}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setFormToDeleteId(form.id)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors outline-none"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2rem] leading-relaxed">
                            {form.description || 'No description provided.'}
                          </p>
                        </CardHeader>
                      </div>

                      <CardContent className="px-5 pb-4 pt-2">
                        {/* Stats Row */}
                        <div className="flex items-center justify-between mb-4 text-xs text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Inbox className="w-3.5 h-3.5 text-amber-500/60" />
                            <span className="font-bold text-zinc-300">{form._count.submissions}</span>
                            <span>entries</span>
                          </div>
                          <span>
                            {new Date(form.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <Separator className="bg-zinc-800/40 mb-3.5" />

                        {/* Primary Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            id={`btn-edit-${form.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/builder/${form.id}`)}
                            className="w-full bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-300 border border-zinc-700/50 hover:border-amber-500/30 transition-all cursor-pointer font-semibold text-xs py-1.5 h-8 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Builder
                          </Button>

                          <Button
                            id={`btn-insights-${form.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/insights/${form.id}`)}
                            className="w-full bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-300 border border-zinc-700/50 hover:border-amber-500/30 transition-all cursor-pointer font-semibold text-xs py-1.5 h-8 rounded-lg"
                          >
                            <BarChart2 className="w-3.5 h-3.5 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* List View Rendering */}
            {!formsQuery.isLoading && sortedForms.length > 0 && viewMode === 'list' && (
              <Card className="bg-zinc-900/25 border-zinc-800/60 rounded-2xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest bg-zinc-950/40 border-b border-zinc-800 text-zinc-500">
                        <th className="py-3 px-5">Form Details</th>
                        <th className="py-3 px-5 w-32">Status</th>
                        <th className="py-3 px-5 w-32">Submissions</th>
                        <th className="py-3 px-5 w-36">Last Updated</th>
                        <th className="py-3 px-5 text-right w-64">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {sortedForms.map((form) => {
                        const settings = ((form as any).settings) || {};
                        const primaryColor = settings.theme?.primaryColor || '#f59e0b';
                        return (
                          <tr
                            key={form.id}
                            className="hover:bg-zinc-900/20 transition-colors"
                          >
                            {/* Title & Desc */}
                            <td className="py-3 px-5 min-w-[280px]">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                <div>
                                  <span className="font-bold text-white text-sm block hover:text-amber-400 transition-colors cursor-pointer" onClick={() => navigate(`/builder/${form.id}`)}>
                                    {form.title}
                                  </span>
                                  {form.description && (
                                    <span className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                                      {form.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-5">
                              <Badge
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${form.published
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                  }`}
                              >
                                {form.published ? 'Live' : 'Draft'}
                              </Badge>
                            </td>

                            {/* Submissions */}
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-300">
                                <Inbox className="w-3.5 h-3.5 text-zinc-600" />
                                <span>{form._count.submissions}</span>
                              </div>
                            </td>

                            {/* Last Updated */}
                            <td className="py-3 px-5 text-xs text-zinc-500">
                              {new Date(form.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>

                            {/* Inline Actions & Context Menu */}
                            <td className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => navigate(`/builder/${form.id}`)}
                                  className="bg-zinc-800/80 hover:bg-zinc-700 text-xs px-2.5 py-1 h-7 border border-zinc-700/50 cursor-pointer"
                                >
                                  Builder
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  onClick={() => navigate(`/insights/${form.id}`)}
                                  className="bg-zinc-800/80 hover:bg-zinc-700 text-xs px-2.5 py-1 h-7 border border-zinc-700/50 cursor-pointer"
                                >
                                  Analytics
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-xs" className="text-zinc-500 hover:text-white h-7 w-7 rounded-md cursor-pointer border-0 bg-transparent">
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-44 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl p-1" align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setRenameForm(form);
                                        setRenameTitle(form.title);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-zinc-500" />
                                      <span>Rename</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setMoveForm(form);
                                        setMoveTargetFolderId(form.folderId || 'root');
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                    >
                                      <FolderInput className="w-3.5 h-3.5 text-zinc-500" />
                                      <span>Move to Folder</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => duplicateFormMutation.mutate({ id: form.id })}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                      <span>Duplicate</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setShareForm(form)}
                                      disabled={!form.published}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none disabled:opacity-40"
                                    >
                                      <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                                      <span>Share & Embed</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
                                    <DropdownMenuItem
                                      onClick={() => archiveFormMutation.mutate({ id: form.id, isArchived: !form.isArchived })}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors outline-none"
                                    >
                                      <Archive className="w-3.5 h-3.5 text-zinc-500" />
                                      <span>{form.isArchived ? 'Restore' : 'Archive'}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setFormToDeleteId(form.id)}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors outline-none"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          </div>
          </>
          )}
        </div>
      </main>

      {/* ─── SHARE & EMBED DIALOG (IFRAME CODE) ────────────────────────────────── */}
      <Dialog open={!!shareForm} onOpenChange={(open) => !open && setShareForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Share & Embed Form</DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">Integrate this form directly on your website or share it with users.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {shareForm && (
            <div className="space-y-5 py-2 text-sm text-zinc-300">

              {/* Direct Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">Direct Link</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    type="text"
                    value={`${window.location.origin}/form/${shareForm.id}`}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none select-all"
                  />
                  <Button
                    onClick={() => handleCopyLink(shareForm.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-xs px-4"
                  >
                    {copiedFormId === shareForm.id ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Iframe Embed Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                  <Code className="w-3.5 h-3.5" />
                  Iframe Embed Code
                </label>
                <div className="flex flex-col gap-2">
                  <textarea
                    readOnly
                    rows={3}
                    value={`<iframe src="${window.location.origin}/form/${shareForm.id}" style="width:100%; height:600px; border:none; border-radius:8px;" allow="geolocation; microphone; camera"></iframe>`}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 focus:outline-none select-all resize-none leading-relaxed"
                  />
                  <Button
                    onClick={() => handleCopyEmbedCode(shareForm.id)}
                    className="self-end bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all text-xs px-4 cursor-pointer"
                  >
                    {copiedEmbedId === shareForm.id ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : 'Copy Embed Code'}
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2 border-t border-zinc-800/80 pt-4 flex flex-col items-center">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block self-start">Form QR Code</label>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/form/${shareForm.id}`)}`}
                    alt="Form QR Code"
                    className="w-[150px] h-[150px] block"
                  />
                </div>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/form/${shareForm.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-500 hover:text-amber-400 hover:underline mt-1 font-medium"
                >
                  Download / Open High-Res QR Code
                </a>
              </div>

            </div>
          )}

          <DialogFooter className="pt-2 border-t border-zinc-800">
            <Button
              type="button"
              onClick={() => setShareForm(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── RENAME FORM DIALOG ───────────────────────────────────────────── */}
      <Dialog open={!!renameForm} onOpenChange={(open) => !open && setRenameForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Edit className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Rename Form</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleRenameFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                New Title
              </label>
              <input
                type="text"
                required
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-655 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>
            <DialogFooter className="pt-2 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setRenameForm(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFormMutation.isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MOVE FORM DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={!!moveForm} onOpenChange={(open) => !open && setMoveForm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FolderInput className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Move Form</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleMoveFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Select Destination Folder
              </label>
              <select
                value={moveTargetFolderId || 'root'}
                onChange={(e) => setMoveTargetFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all cursor-pointer"
              >
                <option value="root">Root Folder (No Folder)</option>
                {foldersQuery.data?.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setMoveForm(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFormMutation.isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                Move
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── CREATE FORM DIALOG (GALLERY BASED) ───────────────────────────── */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Create New Form</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex border-b border-zinc-800/80 mb-2">
            <button
              type="button"
              onClick={() => setCreationTab('template')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${creationTab === 'template'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Template Gallery
            </button>
            <button
              type="button"
              onClick={() => setCreationTab('ai')}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${creationTab === 'ai'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Prompt Creator ✨
            </button>
          </div>

          {creationTab === 'template' ? (
            <form onSubmit={handleCreateForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                    Form Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="input-form-title"
                    type="text"
                    required
                    placeholder="e.g. Feedback Survey"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                    Description
                  </label>
                  <input
                    id="input-form-desc"
                    placeholder="Brief purpose of this form…"
                    value={newFormDesc}
                    onChange={(e) => setNewFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-655 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                  Choose Form Layout / Template
                </label>
                <ScrollArea className="h-64 pr-2">
                  <div className="grid grid-cols-2 gap-2.5 p-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId('blank')}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedTemplateId === 'blank'
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-white">Start from Scratch</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5 leading-tight">Blank Canvas</span>
                      </div>
                    </button>
                    {FORM_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          if (!newFormTitle.trim() || newFormTitle === 'Blank Form') {
                            setNewFormTitle(t.title);
                          }
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedTemplateId === t.id
                            ? 'bg-amber-500/10 border-amber-500/50 text-white'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                          }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-white">{t.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 truncate leading-tight">{t.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="pt-2 gap-2 flex-row justify-end border-t border-zinc-800/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-form"
                  type="submit"
                  disabled={createFormMutation.isLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
                >
                  {createFormMutation.isLoading ? 'Creating…' : 'Create Form'}
                </button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleCreateFormAI} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                  Describe what you want to build
                </label>
                <textarea
                  id="textarea-ai-prompt"
                  rows={4}
                  required
                  placeholder="e.g. A customer satisfaction survey with rating, feedback, and user details..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all resize-none font-sans"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Suggestions</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Customer Satisfaction Survey',
                    'Event Registration Form',
                    'Job Application Form',
                    'Newsletter Signup'
                  ].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAiPrompt(`Create a ${p.toLowerCase()}`)}
                      className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-805 hover:border-zinc-700 text-zinc-400 hover:text-zinc-205 text-xs rounded-lg transition-all cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {aiError}
                </div>
              )}

              <DialogFooter className="pt-2 gap-2 flex-row justify-end border-t border-zinc-800/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAI || createFormMutation.isLoading || !aiPrompt.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isGeneratingAI ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full"></span>
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                      Generate & Create Form
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── CREATE FOLDER DIALOG ─────────────────────────────────────────── */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">New Folder</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Folder Name <span className="text-amber-500">*</span>
              </label>
              <input
                id="input-folder-name"
                type="text"
                required
                placeholder="e.g. Feedback Forms"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>

            <DialogFooter className="pt-1 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-create-folder"
                type="submit"
                disabled={createFolderMutation.isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all border-0 cursor-pointer"
              >
                {createFolderMutation.isLoading ? 'Creating…' : 'Create Folder'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE FORM CONFIRMATION DIALOG ──────────────────────────────── */}
      <Dialog open={!!formToDeleteId} onOpenChange={(open) => !open && setFormToDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Delete Form</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete this form? This action cannot be undone and will delete all gathered submissions.
            </p>
          </div>
          <DialogFooter className="pt-2 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFormToDeleteId(null)}
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteFormMutation.isLoading}
              onClick={() => {
                if (formToDeleteId) {
                  deleteFormMutation.mutate({ id: formToDeleteId });
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0 cursor-pointer"
            >
              {deleteFormMutation.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE FOLDER CONFIRMATION DIALOG ────────────────────────────── */}
      <Dialog open={!!folderToDeleteId} onOpenChange={(open) => !open && setFolderToDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Delete Folder</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete this folder? Forms inside this folder will remain but will be moved to the root list.
            </p>
          </div>
          <DialogFooter className="pt-2 gap-2 flex-row justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFolderToDeleteId(null)}
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all border-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleteFolderMutation.isLoading}
              onClick={() => {
                if (folderToDeleteId) {
                  deleteFolderMutation.mutate({ id: folderToDeleteId });
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0 cursor-pointer"
            >
              {deleteFolderMutation.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
