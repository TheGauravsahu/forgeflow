import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import {
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  FolderPlus,
  Search,
  Archive,
  Copy,
  Edit,
  BarChart2,
  LogOut,
  Sparkles,
  Inbox,
  Share2,
  Check,
  ChevronRight,
  LayoutGrid,
  User,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FORM_TEMPLATES } from '../lib/templates';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Developer');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Modal / Input State
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [formToDeleteId, setFormToDeleteId] = useState<string | null>(null);
  const [folderToDeleteId, setFolderToDeleteId] = useState<string | null>(null);

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
        } catch (_) {}
      }
    }
  }, [navigate]);

  // Queries & Mutations
  const utils = trpc.useContext();
  const foldersQuery = trpc.form.getFolders.useQuery(undefined, { enabled: !!token });
  const formsQuery = trpc.form.list.useQuery(
    {
      folderId: selectedFolderId === null ? 'root' : selectedFolderId,
      isArchived: showArchived,
      search: searchQuery
    },
    { enabled: !!token }
  );

  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (data) => {
      utils.form.list.invalidate();
      setIsCreateFormOpen(false);
      setNewFormTitle('');
      setNewFormDesc('');
      setSelectedTemplateId('blank');
      navigate(`/builder/${data.id}`);
    }
  });

  // Instantiate pending template if chosen from landing page (declared after mutation to avoid ReferenceError)
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

  const createFolderMutation = trpc.form.createFolder.useMutation({
    onSuccess: () => {
      utils.form.getFolders.invalidate();
      setIsCreateFolderOpen(false);
      setNewFolderName('');
    }
  });

  const deleteFolderMutation = trpc.form.deleteFolder.useMutation({
    onSuccess: () => {
      utils.form.getFolders.invalidate();
      utils.form.list.invalidate();
      setSelectedFolderId(null);
      setFolderToDeleteId(null);
    }
  });

  const duplicateFormMutation = trpc.form.duplicate.useMutation({
    onSuccess: () => {
      utils.form.list.invalidate();
    }
  });

  const archiveFormMutation = trpc.form.update.useMutation({
    onSuccess: () => {
      utils.form.list.invalidate();
    }
  });

  const deleteFormMutation = trpc.form.delete.useMutation({
    onSuccess: () => {
      utils.form.list.invalidate();
      setFormToDeleteId(null);
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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolderMutation.mutateAsync({ name: newFolderName });
  };

  const handleCopyLink = (formId: string) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const currentSectionLabel = showArchived
    ? 'Archived Forms'
    : selectedFolderId
    ? foldersQuery.data?.find((f) => f.id === selectedFolderId)?.name || 'Folder'
    : 'All Forms';

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
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">

        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-zinc-800/60">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="w-4 h-4 text-zinc-900" />
          </div>
          <span className="font-black text-base text-white tracking-tight">ForgeFlow</span>
        </div>

        {/* Nav Items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-0.5 mb-6">
            <button
              id="nav-all-forms"
              onClick={() => {
                setSelectedFolderId(null);
                setShowArchived(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFolderId === null && !showArchived
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4 flex-shrink-0" />
              <span>All Forms</span>
              {selectedFolderId === null && !showArchived && (
                <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                  {formsQuery.data?.length ?? 0}
                </span>
              )}
            </button>

            <button
              id="nav-archived"
              onClick={() => {
                setSelectedFolderId(null);
                setShowArchived(true);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showArchived
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <Archive className="w-4 h-4 flex-shrink-0" />
              <span>Archived</span>
            </button>
          </div>

          <Separator className="bg-zinc-800/60 mb-4" />

          {/* Folders Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Folders</span>
              <Button
                id="btn-create-folder"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsCreateFolderOpen(true)}
                className="text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {foldersQuery.isLoading ? (
              <div className="px-3 py-2 text-xs text-zinc-600 animate-pulse">Loading folders…</div>
            ) : foldersQuery.data?.length === 0 ? (
              <div className="px-3 py-3 text-xs text-zinc-600 italic text-center border border-dashed border-zinc-800 rounded-lg">
                No folders yet
              </div>
            ) : (
              foldersQuery.data?.map((folder) => (
                <div
                  key={folder.id}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFolderId === folder.id && !showArchived
                      ? 'bg-amber-500/12 text-amber-300 border border-amber-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      setShowArchived(false);
                    }}
                    className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer"
                  >
                    <FolderOpen className={`w-4 h-4 flex-shrink-0 ${selectedFolderId === folder.id && !showArchived ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-[10px] font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      {folder._count.forms}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDeleteId(folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 ml-1 text-zinc-600 hover:text-red-400 rounded transition-all cursor-pointer"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create Folder CTA */}
          <div className="mt-6">
            <Button
              id="btn-sidebar-new-folder"
              variant="outline"
              onClick={() => setIsCreateFolderOpen(true)}
              className="w-full flex items-center justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 border border-dashed border-zinc-800 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </Button>
          </div>
        </ScrollArea>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-800/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group cursor-pointer text-left outline-none border-0 bg-transparent">
                <Avatar className="w-8 h-8 border border-amber-500/30">
                  <AvatarFallback className="bg-amber-500/15 text-amber-400 text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
                  <p className="text-[10px] text-zinc-600 truncate">Creator</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-xl p-1 shadow-2xl" align="end" side="top">
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors focus:bg-zinc-800 focus:text-white outline-none"
              >
                <User className="w-4 h-4 text-zinc-500" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors focus:bg-zinc-800 focus:text-white outline-none"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-400 outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm px-6 flex items-center justify-between flex-shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="font-medium">Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300 font-semibold">{currentSectionLabel}</span>
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

            {/* New Form */}
            <Button
              id="btn-create-form"
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Form
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Page heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{currentSectionLabel}</h1>
              <p className="text-xs text-zinc-600 mt-0.5">
                {formsQuery.data
                  ? `${formsQuery.data.length} form${formsQuery.data.length !== 1 ? 's' : ''}`
                  : 'Loading…'}
              </p>
            </div>

            {showArchived && (
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs font-semibold hover:bg-amber-500/20">
                <Archive className="w-3 h-3 mr-1" />
                Archive view
              </Badge>
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
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                <Inbox className="w-7 h-7 text-amber-500/60" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {showArchived ? 'No archived forms' : 'No forms yet'}
              </h3>
              <p className="text-sm text-zinc-500 text-center max-w-xs mb-6 leading-relaxed">
                {showArchived
                  ? 'Forms you archive will appear here.'
                  : 'Build your first drag-and-drop form in seconds.'}
              </p>
              {!showArchived && (
                <button
                  onClick={() => setIsCreateFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 text-sm font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create your first form
                </button>
              )}
            </div>
          )}

          {/* Forms Grid */}
          {!formsQuery.isLoading && (formsQuery.data?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {formsQuery.data?.map((form) => (
                <Card
                  key={form.id}
                  className="group relative bg-zinc-900/60 border-zinc-800/70 hover:border-amber-500/25 hover:bg-zinc-900/90 rounded-2xl shadow-none hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-200 overflow-hidden"
                >
                  {/* Subtle amber top accent on hover */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/0 group-hover:via-amber-500/40 to-transparent transition-all duration-300" />

                  <CardHeader className="px-5 pt-5 pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm font-bold text-white group-hover:text-amber-100 transition-colors leading-snug truncate flex-1">
                        {form.title}
                      </CardTitle>
                      <Badge
                        className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          form.published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {form.published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2rem] leading-relaxed">
                      {form.description || 'No description provided.'}
                    </p>
                  </CardHeader>

                  <CardContent className="px-5 pb-5">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                          <Inbox className="w-3 h-3 text-amber-500/70" />
                        </div>
                        <span className="text-sm font-bold text-white">{form._count.submissions}</span>
                        <span className="text-xs text-zinc-600">submissions</span>
                      </div>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(form.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Separator className="bg-zinc-800/60 mb-4" />

                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Button
                        id={`btn-edit-${form.id}`}
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/builder/${form.id}`)}
                        className="w-full bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-300 border-zinc-700/60 hover:border-amber-500/30 transition-all cursor-pointer font-semibold text-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Builder
                      </Button>

                      <Button
                        id={`btn-insights-${form.id}`}
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/insights/${form.id}`)}
                        className="w-full bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-300 border-zinc-700/60 hover:border-amber-500/30 transition-all cursor-pointer font-semibold text-xs"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        Analytics
                      </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        id={`btn-share-${form.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(form.id)}
                        disabled={!form.published}
                        title={!form.published ? 'Publish form to share link' : 'Copy public link'}
                        className="flex-1 justify-center bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer text-xs"
                      >
                        {copiedFormId === form.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </>
                        )}
                      </Button>

                      <Button
                        id={`btn-duplicate-${form.id}`}
                        variant="outline"
                        size="icon-sm"
                        onClick={() => duplicateFormMutation.mutate({ id: form.id })}
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        id={`btn-archive-${form.id}`}
                        variant="outline"
                        size="icon-sm"
                        onClick={() => archiveFormMutation.mutate({ id: form.id, isArchived: !form.isArchived })}
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                        title={form.isArchived ? 'Restore' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        id={`btn-delete-${form.id}`}
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setFormToDeleteId(form.id)}
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── CREATE FORM DIALOG ───────────────────────────────────────────── */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Create New Form</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateForm} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Form Title <span className="text-amber-500">*</span>
              </label>
              <input
                id="input-form-title"
                type="text"
                required
                placeholder="e.g. Customer Feedback Survey"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Description
              </label>
              <textarea
                id="input-form-desc"
                placeholder="Briefly describe the purpose of this form…"
                value={newFormDesc}
                onChange={(e) => setNewFormDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">
                Form Template
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId('blank')}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === 'blank'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">Start from Scratch</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Empty form builder canvas</span>
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
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTemplateId === t.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate w-full text-white">{t.title}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 truncate w-full">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setIsCreateFormOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-submit-create-form"
                type="submit"
                disabled={createFormMutation.isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                {createFormMutation.isLoading ? 'Creating…' : 'Create Form'}
              </button>
            </DialogFooter>
          </form>
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
                placeholder="e.g. Marketing Campaigns"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/15 transition-all"
              />
            </div>

            <DialogFooter className="pt-1 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-submit-create-folder"
                type="submit"
                disabled={createFolderMutation.isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-900 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
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
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
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
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0"
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
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
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
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0"
            >
              {deleteFolderMutation.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
