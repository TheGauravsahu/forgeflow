import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import {
  Loader2,
  ShieldCheck,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function AdminPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Admin User');
  const [isAdmin, setIsAdmin] = useState(false);

  // States required for Sidebar (unused in admin body but required by DashboardSidebar prop signature)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<'forms' | 'marketplace' | 'admin'>('admin');
  
  // Dummy callbacks/stubs for unused sidebar operations
  const setIsCreateFolderOpen = () => {};
  const setFolderToDeleteId = () => {};

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
          setUserName(u.name || 'Admin User');
          setIsAdmin(!!u.isAdmin);
        } catch (_) { }
      }
    }
  }, [navigate]);

  const toast = useToastStore();

  // Queries for Sidebar contents
  const foldersQuery = api.form.getFolders.useQuery(undefined, { enabled: !!token });
  const formsQuery = api.form.list.useQuery(
    {
      folderId: 'root',
      isArchived: false,
      search: ''
    },
    { enabled: !!token }
  );

  // Queries & Mutations for Admin Dashboard
  const statsQuery = api.admin.getStats.useQuery(undefined, { enabled: !!token && isAdmin });
  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success('User deleted successfully.', 'User Removed');
      statsQuery.refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete user.', 'Deletion Failed');
    }
  });

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
    .slice(0, 2) || 'AD';

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <span className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
            <span className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-zinc-500 font-medium">Verifying authorization…</p>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data || {
    totalUsers: 0,
    totalForms: 0,
    totalSubmissions: 0,
    globalConversionRate: 0,
    users: [],
    submissionsOverTime: [],
    systemHealth: {
      database: { status: 'Connected', latency: '4ms' },
      gemini: { status: 'Active', latency: '120ms' },
      vercel: { status: 'Healthy', deployment: 'Production' }
    }
  };

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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950/20">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm px-6 flex items-center justify-between flex-shrink-0">
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
              <span className="font-medium">System Control</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-zinc-300 font-semibold">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {statsQuery.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : statsQuery.error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
              <p className="text-red-400 text-sm">Failed to load administrator statistics. Ensure env variables are configured properly.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  System Control Panel
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Admin console monitoring database status, API key usage, and user directories.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 rounded-xl shadow-none">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-widest">Total Registered Users</span>
                  <span className="text-2xl font-black text-white mt-1 block">{stats.totalUsers}</span>
                </Card>
                <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 rounded-xl shadow-none">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-widest">Total Forms Created</span>
                  <span className="text-2xl font-black text-white mt-1 block">{stats.totalForms}</span>
                </Card>
                <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 rounded-xl shadow-none">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-widest">Aggregate Responses</span>
                  <span className="text-2xl font-black text-white mt-1 block">{stats.totalSubmissions}</span>
                </Card>
                <Card className="bg-zinc-900/30 border-zinc-800/60 p-4 rounded-xl shadow-none">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-widest">Response Conversion Rate</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{stats.globalConversionRate}%</span>
                </Card>
              </div>

              {/* Charts & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-zinc-900/30 border-zinc-800/60 rounded-xl p-5 shadow-none flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Submission Velocity</h3>
                    <p className="text-[10px] text-zinc-500">Total responses captured across all live forms</p>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.submissionsOverTime} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adminAmberGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#adminAmberGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="lg:col-span-1 bg-zinc-900/30 border-zinc-800/60 rounded-xl p-5 shadow-none flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Service Health Indicators</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
                        <span className="text-xs text-zinc-400">Prisma database</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-zinc-500">{stats.systemHealth?.database?.status || 'Online'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
                        <span className="text-xs text-zinc-400">Gemini 2.5 API</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-zinc-500">{stats.systemHealth?.gemini?.status || 'Online'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
                        <span className="text-xs text-zinc-400">Vercel Web Server</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-zinc-500">{stats.systemHealth?.vercel?.status || 'Healthy'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* User Management Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Platform User Management</h3>
                <Card className="bg-zinc-900/20 border-zinc-800/60 rounded-xl overflow-hidden shadow-none">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400">
                          <th className="p-4 font-semibold">User Name</th>
                          <th className="p-4 font-semibold">Email Address</th>
                          <th className="p-4 font-semibold">Account Role</th>
                          <th className="p-4 font-semibold">Created Forms</th>
                          <th className="p-4 font-semibold">Joined At</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {stats.users && stats.users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-zinc-900/10 text-zinc-300">
                            <td className="p-4 font-bold text-white">{u.name || 'Developer'}</td>
                            <td className="p-4">{u.email}</td>
                            <td className="p-4">
                              <Badge className={`border-0 font-bold uppercase tracking-widest text-[9px] ${
                                u.role === 'Admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="p-4">{u.formCount} forms</td>
                            <td className="p-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              {u.role !== 'Admin' && (
                                <button
                                  disabled={deleteUserMutation.isLoading}
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete user ${u.email}? This will delete all their forms and submissions.`)) {
                                      deleteUserMutation.mutate({ id: u.id });
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-bold rounded text-[10px] transition-colors cursor-pointer border-0"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
