import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutGrid,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecuritySettings } from '@/components/profile/SecuritySettings';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('Developer');

  // Load User details
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


  const handleLogout = () => {
    localStorage.removeItem('forgeflow_token');
    localStorage.removeItem('forgeflow_user');
    navigate('/auth');
  };

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FF';

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
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 transition-all"
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
              <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
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
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-sans">System Settings</h1>
            <p className="text-sm text-zinc-500 mt-1">Configure security thresholds, UI configurations, and developer tokens.</p>
          </div>

          <Separator className="bg-zinc-800/60" />

          <Tabs defaultValue="security" className="w-full space-y-6">
            <TabsList className="bg-zinc-900/60 border border-zinc-800 p-1 rounded-xl flex w-fit gap-1">
              <TabsTrigger
                value="security"
                className="rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 transition-all cursor-pointer"
              >
                Security & Access
              </TabsTrigger>
 
            </TabsList>

            {/* TAB CONTENT: SECURITY */}
            <TabsContent value="security" className="space-y-6 outline-none">
              <SecuritySettings />
            </TabsContent>

   

      

          </Tabs>

        </div>
      </main>
    </div>
  );
}
