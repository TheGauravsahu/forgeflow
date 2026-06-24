import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import {
  Sparkles,
  LayoutGrid,
  User,
  Settings,
  LogOut,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Bell,
  Sliders,
  Webhook,
  Key,
  CheckCircle2,
  AlertTriangle,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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

  // Preference Settings State
  const [emailNotif, setEmailNotif] = useState(true);
  const [submissionNotif, setSubmissionNotif] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [prefSuccess, setPrefSuccess] = useState('');

  // API Settings State
  const [apiKey, setApiKey] = useState('ff_live_58c27a93fde1188364e7c10b42');
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSuccess, setWebhookSuccess] = useState('');

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
  const updatePasswordMutation = trpc.auth.update.useMutation({
    onSuccess: () => {
      setSecuritySuccess('Password updated successfully!');
      setSecurityError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(''), 3000);
    },
    onError: (err) => {
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

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSuccess('Preferences saved successfully!');
    setTimeout(() => setPrefSuccess(''), 2000);
  };

  const handleWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSuccess('Webhook configurations updated!');
    setTimeout(() => setWebhookSuccess(''), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const randHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setApiKey(`ff_live_${randHex}`);
    setWebhookSuccess('New API secret key generated.');
    setTimeout(() => setWebhookSuccess(''), 2000);
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
              <TabsTrigger
                value="preferences"
                className="rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 transition-all cursor-pointer"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="developer"
                className="rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 transition-all cursor-pointer"
              >
                Developer API
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: SECURITY */}
            <TabsContent value="security" className="space-y-6 outline-none">
              <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl h-fit">
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

            {/* TAB CONTENT: PREFERENCES */}
            <TabsContent value="preferences" className="space-y-6 outline-none">
              <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl h-fit">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    System Preferences
                  </CardTitle>
                  <p className="text-xs text-zinc-500">Configure notification alerts, auto-save states, and workspace behaviors.</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <form onSubmit={handleSavePreferences} className="space-y-6 max-w-xl">
                    
                    {/* Toggle: Email Digest */}
                    <div className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-zinc-500" />
                          Email Digest Notifications
                        </Label>
                        <p className="text-xs text-zinc-500">Receive a weekly analytical report detailing form submission metrics.</p>
                      </div>
                      <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                    </div>

                    {/* Toggle: Submission alerts */}
                    <div className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-zinc-500" />
                          Instant Submission Alerts
                        </Label>
                        <p className="text-xs text-zinc-500">Receive an email immediately when a public user submits your form.</p>
                      </div>
                      <Switch checked={submissionNotif} onCheckedChange={setSubmissionNotif} />
                    </div>

                    {/* Toggle: Auto-save builder */}
                    <div className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-zinc-500" />
                          Auto-save Workspace
                        </Label>
                        <p className="text-xs text-zinc-500">Enable automatic background saving while designing schemas in the builder.</p>
                      </div>
                      <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                    </div>

                    {/* Feedback */}
                    {prefSuccess && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{prefSuccess}</span>
                      </div>
                    )}

                    <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: DEVELOPER */}
            <TabsContent value="developer" className="space-y-6 outline-none">
              <Card className="bg-zinc-900/40 border-zinc-800/70 shadow-none rounded-2xl h-fit">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    API Secret Keys
                  </CardTitle>
                  <p className="text-xs text-zinc-500">Use this token to query submissions and manage form schemas programmatically via HTTP.</p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-zinc-300">Live API Key</Label>
                    <div className="flex gap-2 max-w-xl">
                      <div className="relative flex-1">
                        <Input
                          readOnly
                          value={apiKey}
                          className="font-mono bg-zinc-900 text-xs text-amber-400 border-zinc-800 pr-10 focus:ring-0 focus:border-zinc-800 select-all"
                        />
                        <button
                          onClick={handleCopyKey}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white rounded"
                        >
                          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleRegenerateKey}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 text-xs gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800/60" />

                  {/* Webhooks Section */}
                  <form onSubmit={handleWebhookSubmit} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <Label className="text-base font-bold text-white flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-amber-500" />
                        Global Webhook URL
                      </Label>
                      <p className="text-xs text-zinc-500">ForgeFlow will send a JSON POST request to this endpoint every time a submission is received.</p>
                      <Input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://yourdomain.com/webhooks/forgeflow"
                        className="bg-zinc-900/80 border-zinc-800 text-sm text-white focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Messages */}
                    {webhookSuccess && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{webhookSuccess}</span>
                      </div>
                    )}

                    <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold transition-all">
                      Configure Webhook
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
