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
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('Developer');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  const toast = useToastStore();

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

  // Mutations
  const updatePasswordMutation = api.auth.update.useMutation({
    onSuccess: () => {
      toast.success('Your account password has been updated.', 'Password Changed');
      setSecuritySuccess('Password updated successfully!');
      setSecurityError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update password.', 'Password Change Failed');
      setSecurityError(err.message || 'Failed to update password.');
      setSecuritySuccess('');
    }
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }
    await updatePasswordMutation.mutateAsync({
      currentPassword,
      newPassword
    });
  };


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
              <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl h-fit p-4">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    Change Password
                  </CardTitle>
                  <p className="text-xs text-zinc-500">Ensure your workspace credentials remain secure by changing your password periodically.</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-300">Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-300">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-300">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Feedback Messages */}
                    {securitySuccess && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{securitySuccess}</span>
                      </div>
                    )}

                    {securityError && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{securityError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isLoading}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all"
                    >
                      {updatePasswordMutation.isLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

   

      

          </Tabs>

        </div>
      </main>
    </div>
  );
}
