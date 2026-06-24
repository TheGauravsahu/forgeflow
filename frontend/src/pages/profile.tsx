import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import {
  Sparkles,
  LayoutGrid,
  User,
  Settings,
  LogOut,
  Mail,
  Layers,
  Inbox,
  Save,
  CheckCircle2,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Responsiveness State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toast = useToastStore();

  // Fetch token and current user
  useEffect(() => {
    const savedToken = localStorage.getItem('forgeflow_token');
    if (!savedToken) {
      navigate('/auth');
    } else {
      setToken(savedToken);
    }
  }, [navigate]);

  // queries
  const userQuery = api.auth.me.useQuery(undefined, {
    enabled: !!token,
    onSuccess: (data: any) => {
      setName(data.name || '');
      setEmail(data.email || '');
    }
  });

  const activeFormsQuery = api.form.list.useQuery(
    { isArchived: false },
    { enabled: !!token }
  );

  const archivedFormsQuery = api.form.list.useQuery(
    { isArchived: true },
    { enabled: !!token }
  );

  // mutations
  const updateProfileMutation = api.auth.update.useMutation({
    onSuccess: (data: any) => {
      toast.success('Your profile details have been saved.', 'Profile Updated');
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      // Update localStorage user details
      const savedUser = localStorage.getItem('forgeflow_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          u.name = data.name;
          u.email = data.email;
          localStorage.setItem('forgeflow_user', JSON.stringify(u));
        } catch (_) {}
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile.', 'Profile Update Failed');
      setErrorMsg(err.message || 'Failed to update profile.');
      setSuccessMsg('');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('forgeflow_token');
    localStorage.removeItem('forgeflow_user');
    navigate('/auth');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and Email are required.');
      return;
    }
    await updateProfileMutation.mutateAsync({ name, email });
  };

  const totalForms =
    (activeFormsQuery.data?.length ?? 0) + (archivedFormsQuery.data?.length ?? 0);

  const totalSubmissions =
    (activeFormsQuery.data?.reduce((acc, form) => acc + (form._count?.submissions ?? 0), 0) ?? 0) +
    (archivedFormsQuery.data?.reduce((acc, form) => acc + (form._count?.submissions ?? 0), 0) ?? 0);

  const userInitials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FF';

  const isLoading = userQuery.isLoading || activeFormsQuery.isLoading;

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
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* ─── LEFT SIDEBAR (DESKTOP) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] flex-shrink-0 flex flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          className="h-14 flex items-center gap-2.5 px-5 border-b border-zinc-800/60 cursor-pointer hover:bg-zinc-900/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="w-4 h-4 text-zinc-900" />
          </div>
          <span className="font-black text-base text-white tracking-tight">ForgeFlow</span>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group">
            <Avatar className="w-8 h-8 border border-amber-500/30">
              <AvatarFallback className="bg-amber-500/15 text-amber-400 text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{name || 'Developer'}</p>
              <p className="text-[10px] text-zinc-600 truncate">Creator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-all"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>      {/* ─── LEFT SIDEBAR (MOBILE DRAWER) ───────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[240px] bg-zinc-950 border-r border-zinc-800/60 z-50 flex flex-col md:hidden transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div
          onClick={() => {
            navigate('/dashboard');
            setIsMobileSidebarOpen(false);
          }}
          className="h-14 flex items-center justify-between px-5 border-b border-zinc-800/60 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-black text-base text-white tracking-tight">ForgeFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileSidebarOpen(false);
            }}
            className="text-zinc-500 hover:text-white cursor-pointer border-0 bg-transparent"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => {
              navigate('/dashboard');
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all border-0 bg-transparent cursor-pointer text-left"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              navigate('/profile');
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 transition-all border-0 bg-transparent cursor-pointer text-left"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => {
              navigate('/settings');
              setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all border-0 bg-transparent cursor-pointer text-left"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group">
            <Avatar className="w-8 h-8 border border-amber-500/30">
              <AvatarFallback className="bg-amber-500/15 text-amber-400 text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{name || 'Developer'}</p>
              <p className="text-[10px] text-zinc-600 truncate">Creator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-all border-0 bg-transparent cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg cursor-pointer border-0 bg-transparent"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Account Profile</h1>
              <p className="text-sm text-zinc-500 mt-1">Manage your public identity and track form creation statistics.</p>
            </div>
          </div>          <Separator className="bg-zinc-800/60" />

          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl animate-pulse" />
              <div className="h-64 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Card & Stats */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 border-2 border-amber-500/40 mb-4 shadow-lg shadow-amber-500/10">
                      <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 truncate max-w-full">{email}</p>
                    <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      Creator Tier
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-2xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500/70" />
                        Total Forms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <span className="text-2xl font-black text-white">{totalForms}</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-2xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Inbox className="w-3.5 h-3.5 text-amber-500/70" />
                        Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <span className="text-2xl font-black text-white">{totalSubmissions}</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Edit Details */}
              <div className="lg:col-span-2">
                <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" />
                      Personal Information
                    </CardTitle>
                    <p className="text-xs text-zinc-500">Update your account email address and display name.</p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <form onSubmit={handleUpdate} className="space-y-5">
                      
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-xs font-semibold text-zinc-300">Display Name</Label>
                        <Input
                          id="profile-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-xs font-semibold text-zinc-300">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <Input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="pl-10 bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>

                      {/* Messages */}
                      {successMsg && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      {errorMsg && (
                        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Submit */}
                      <Button
                        id="btn-update-profile"
                        type="submit"
                        disabled={updateProfileMutation.isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all"
                      >
                        {updateProfileMutation.isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                          </div>
                        )}
                      </Button>

                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
