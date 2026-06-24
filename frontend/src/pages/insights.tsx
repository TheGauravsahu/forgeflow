import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { FormField } from '../types/shared';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Calendar,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Eye,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

/* ─────────────────────────── helpers ─────────────────────────── */

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ─────────────────────────── stat card skeleton ─────────────────────────── */

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1f1f28] bg-[#0f0f12] p-6 flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-[#1f1f28]" />
        <div className="h-8 w-16 rounded-lg bg-[#1f1f28]" />
      </div>
      <div className="h-12 w-12 rounded-xl bg-[#1f1f28]" />
    </div>
  );
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function InsightsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const formId = id || '';

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('forgeflow_token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Queries
  const formQuery = trpc.form.get.useQuery({ id: formId }, { enabled: !!formId });
  const analyticsQuery = trpc.submission.getAnalytics.useQuery({ formId }, { enabled: !!formId });
  const listQuery = trpc.submission.list.useQuery(
    {
      formId,
      take: itemsPerPage,
      skip: currentPage * itemsPerPage,
    },
    { enabled: !!formId },
  );

  const form = formQuery.data;
  const analytics = analyticsQuery.data;
  const submissionData = listQuery.data;

  // CSV Export URL
  const apiBase =
    (import.meta.env.VITE_API_URL as string)?.replace('/trpc', '') ||
    'http://localhost:3001';
  const exportUrl = `${apiBase}/api/forms/${formId}/export-csv?token=${localStorage.getItem('forgeflow_token')}`;

  const fields = (form?.schema as FormField[]) || [];
  const activeFields = fields.filter(
    (f) => !['heading', 'divider', 'markdown', 'richtext', 'hidden'].includes(f.type),
  );

  const totalPages = submissionData
    ? Math.ceil(submissionData.totalCount / itemsPerPage)
    : 0;

  // Derived stats
  const totalSubmissions = analytics?.totalSubmissions ?? 0;
  const avgPerDay =
    analytics?.timeline && analytics.timeline.length > 0
      ? (
          analytics.timeline.reduce((acc: number, d: any) => acc + (d.count ?? 0), 0) /
          analytics.timeline.length
        ).toFixed(1)
      : '—';
  const completionRate =
    totalSubmissions > 0
      ? `${Math.min(100, Math.round((totalSubmissions / Math.max(totalSubmissions, 1)) * 100))}%`
      : '—';

  /* ──────────────── JSX ──────────────── */
  return (
    <div
      className="min-h-screen flex flex-col text-slate-100"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(9,9,11,0.85)',
          borderColor: '#1f1f28',
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-extrabold tracking-tight"
                style={{ color: '#f8f8f8' }}
              >
                Form Insights
              </h1>
              <Badge
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border-0"
                style={{ backgroundColor: '#f59e0b22', color: '#f59e0b' }}
              >
                Analytics
              </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-md mt-0.5">
              {form?.title ?? 'Loading…'}
            </p>
          </div>
        </div>

        <a
          href={exportUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            className="flex items-center gap-2 font-bold text-sm rounded-xl shadow-lg transition-all duration-200 border-0"
            style={{
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#09090b',
              boxShadow: '0 4px 20px #f59e0b33',
            }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </a>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">

        {/* ── Stat Cards ── */}
        {analyticsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Total Submissions */}
            <Card
              className="rounded-2xl border shadow-2xl overflow-hidden relative group"
              style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left,#f59e0b0d,transparent 60%)' }}
              />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Total Submissions
                  </p>
                  <h3 className="text-4xl font-black mt-1.5" style={{ color: '#f8f8f8' }}>
                    {totalSubmissions}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">responses collected</p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                >
                  <FileText className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>

            {/* Avg per Day */}
            <Card
              className="rounded-2xl border shadow-2xl overflow-hidden relative group"
              style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left,#f59e0b0d,transparent 60%)' }}
              />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Avg per Day
                  </p>
                  <h3 className="text-4xl font-black mt-1.5" style={{ color: '#f8f8f8' }}>
                    {avgPerDay}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">daily average</p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                >
                  <TrendingUp className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card
              className="rounded-2xl border shadow-2xl overflow-hidden relative group"
              style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left,#f59e0b0d,transparent 60%)' }}
              />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Completion Rate
                  </p>
                  <h3 className="text-4xl font-black mt-1.5" style={{ color: '#f8f8f8' }}>
                    {completionRate}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">of submissions complete</p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                >
                  <Zap className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tabs: Timeline + Breakdown + Submissions ── */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList
            className="rounded-xl p-1 gap-1 border"
            style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
          >
            {[
              { value: 'timeline', label: 'Timeline', icon: <Calendar className="w-3.5 h-3.5" /> },
              { value: 'breakdown', label: 'Field Breakdown', icon: <BarChart2 className="w-3.5 h-3.5" /> },
              { value: 'submissions', label: 'Submissions', icon: <Layers className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-4 py-2 transition-all duration-200 data-[state=active]:text-[#09090b]"
                style={
                  {
                    '--tab-active-bg': '#f59e0b',
                  } as React.CSSProperties
                }
              >
                <span style={{ color: 'inherit' }}>{tab.icon}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Timeline Tab ── */}
          <TabsContent value="timeline" className="mt-6">
            <Card
              className="rounded-2xl border shadow-2xl"
              style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-100">
                      Submission Timeline
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Volume of form answers submitted over time
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  {analytics?.timeline && analytics.timeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.timeline} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                        <defs>
                          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                            <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.08} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f28" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#3f3f46"
                          tick={{ fill: '#71717a', fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#3f3f46"
                          tick={{ fill: '#71717a', fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181f',
                            borderColor: '#2a2a35',
                            borderRadius: '10px',
                            color: '#f8f8f8',
                            fontSize: '12px',
                            boxShadow: '0 8px 32px #00000088',
                          }}
                          labelStyle={{ color: '#a1a1aa', fontWeight: 600 }}
                          itemStyle={{ color: '#f59e0b', fontWeight: 700 }}
                          cursor={{ stroke: '#f59e0b33', strokeWidth: 1 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#amberGradient)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#f59e0b', stroke: '#09090b', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: '#1f1f28' }}
                      >
                        <Calendar className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">No timeline data yet</p>
                      <p className="text-xs text-slate-600">Submissions will appear here once collected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Field Breakdown Tab ── */}
          <TabsContent value="breakdown" className="mt-6">
            {analytics?.fieldAnalytics && Object.keys(analytics.fieldAnalytics).length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">
                    Question Breakdown
                  </h2>
                  <Badge
                    className="text-[10px] font-bold border-0"
                    style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                  >
                    {Object.keys(analytics.fieldAnalytics).length} fields
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries(analytics.fieldAnalytics).map(([fieldId, data]: [string, any]) => {
                    const isNumeric = ['rating', 'slider', 'number'].includes(data.type);
                    return (
                      <Card
                        key={fieldId}
                        className="rounded-2xl border shadow-xl flex flex-col justify-between"
                        style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start gap-3">
                            <CardTitle className="text-sm font-bold text-slate-200 leading-snug">
                              {data.label || fieldId}
                            </CardTitle>
                            <Badge
                              className="text-[9px] font-black px-2 py-0.5 rounded-full border-0 flex-shrink-0"
                              style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                            >
                              {data.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {data.responsesCount} response{data.responsesCount !== 1 ? 's' : ''}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Separator className="mb-4" style={{ backgroundColor: '#1f1f28' }} />
                          {isNumeric ? (
                            <div
                              className="rounded-xl p-4 flex items-center justify-between"
                              style={{ backgroundColor: '#18181f', border: '1px solid #1f1f28' }}
                            >
                              <div>
                                <p className="text-xs text-slate-500">Average Score</p>
                                <p
                                  className="text-4xl font-black mt-1"
                                  style={{ color: '#f59e0b' }}
                                >
                                  {data.average}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-600">Metric</p>
                                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                                  Mean
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {Object.entries(data.distribution || {}).map(
                                ([key, count]: [string, any]) => {
                                  const total = data.responsesCount || 1;
                                  const pct = Math.round((count / total) * 100);
                                  return (
                                    <div key={key} className="space-y-1">
                                      <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-300 truncate max-w-[180px]">
                                          {key}
                                        </span>
                                        <span className="text-slate-500 flex-shrink-0 ml-2">
                                          {count} ({pct}%)
                                        </span>
                                      </div>
                                      <div
                                        className="w-full h-2 rounded-full overflow-hidden"
                                        style={{ backgroundColor: '#1f1f28' }}
                                      >
                                        <div
                                          className="h-full rounded-full transition-all duration-700"
                                          style={{
                                            width: `${pct}%`,
                                            background:
                                              'linear-gradient(90deg,#f59e0b,#d97706)',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                              {Object.keys(data.distribution || {}).length === 0 && (
                                <p className="text-xs text-slate-600 italic">No distribution data</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card
                className="rounded-2xl border"
                style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
              >
                <CardContent className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#1f1f28' }}
                  >
                    <BarChart2 className="w-10 h-10 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">No field analytics yet</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Analytics will populate once responses are submitted
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Submissions Tab ── */}
          <TabsContent value="submissions" className="mt-6">
            <Card
              className="rounded-2xl border shadow-xl overflow-hidden"
              style={{ backgroundColor: '#0f0f12', borderColor: '#1f1f28' }}
            >
              {/* Card Header */}
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-100">
                        All Submissions
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Individual form replies submitted by respondents
                      </p>
                    </div>
                  </div>
                  {submissionData && (
                    <Badge
                      className="font-bold border-0 text-xs"
                      style={{ backgroundColor: '#f59e0b18', color: '#f59e0b' }}
                    >
                      {submissionData.totalCount} entries
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <Separator className="mt-4" style={{ backgroundColor: '#1f1f28' }} />

              {/* Table body */}
              <div className="overflow-x-auto">
                {listQuery.isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8" style={{ color: '#f59e0b' } as React.CSSProperties} />
                    <span className="text-sm font-medium">Loading responses…</span>
                  </div>
                ) : !submissionData || submissionData.submissions.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: '#1f1f28' }}
                    >
                      <FileText className="w-10 h-10 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">No submissions yet</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Share your form link to start collecting responses
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="w-full">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                      <thead>
                        <tr
                          className="text-[11px] font-black uppercase tracking-widest"
                          style={{
                            backgroundColor: '#18181f',
                            borderBottom: '1px solid #1f1f28',
                            color: '#71717a',
                          }}
                        >
                          <th className="py-3.5 px-5">Submitted At</th>
                          {activeFields.slice(0, 4).map((f) => (
                            <th key={f.id} className="py-3.5 px-5 max-w-[180px] truncate">
                              {f.properties.label}
                            </th>
                          ))}
                          <th className="py-3.5 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionData.submissions.map((sub, rowIdx) => {
                          const data = sub.data as Record<string, any>;
                          return (
                            <tr
                              key={sub.id}
                              className="text-sm transition-colors duration-150"
                              style={{
                                borderBottom: '1px solid #1f1f28',
                                backgroundColor: rowIdx % 2 === 0 ? 'transparent' : '#18181f44',
                              }}
                              onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                                  '#f59e0b08')
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                                  rowIdx % 2 === 0 ? 'transparent' : '#18181f44')
                              }
                            >
                              <td className="py-4 px-5 text-slate-400 whitespace-nowrap font-medium">
                                {new Date(sub.createdAt).toLocaleString()}
                              </td>
                              {activeFields.slice(0, 4).map((f) => {
                                const val = data[f.id];
                                let cellContent = '';

                                if (val === undefined || val === null) {
                                  cellContent = '-';
                                } else if (Array.isArray(val)) {
                                  cellContent = val.join(', ');
                                } else if (
                                  typeof val === 'string' &&
                                  val.startsWith('data:image/')
                                ) {
                                  cellContent = 'Image Preview';
                                } else {
                                  cellContent = String(val);
                                }

                                return (
                                  <td
                                    key={f.id}
                                    className="py-4 px-5 text-slate-400 max-w-[180px] truncate"
                                  >
                                    {typeof val === 'string' &&
                                    val.startsWith('data:image/') ? (
                                      <a
                                        href={val}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors duration-150"
                                        style={{
                                          backgroundColor: '#f59e0b18',
                                          color: '#f59e0b',
                                          border: '1px solid #f59e0b33',
                                        }}
                                      >
                                        <Eye className="w-3 h-3" />
                                        View Attachment
                                      </a>
                                    ) : (
                                      cellContent
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-4 px-5 text-right">
                                <button
                                  onClick={() => {
                                    // Modal detail display (optional)
                                    alert(JSON.stringify(data, null, 2));
                                  }}
                                  className="text-xs font-bold transition-colors duration-150"
                                  style={{ color: '#f59e0b' }}
                                  onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLButtonElement).style.color = '#fbbf24')
                                  }
                                  onMouseLeave={(e) =>
                                    ((e.currentTarget as HTMLButtonElement).style.color = '#f59e0b')
                                  }
                                >
                                  Inspect JSON
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <>
                  <Separator style={{ backgroundColor: '#1f1f28' }} />
                  <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ backgroundColor: '#18181f44' }}
                  >
                    <span className="text-xs text-slate-500 font-medium">
                      Page{' '}
                      <span className="text-slate-300 font-bold">{currentPage + 1}</span>{' '}
                      of{' '}
                      <span className="text-slate-300 font-bold">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        className="w-8 h-8 rounded-lg border transition-all duration-150 disabled:opacity-40"
                        style={{
                          backgroundColor: '#18181f',
                          borderColor: '#2a2a35',
                          color: '#a1a1aa',
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="w-8 h-8 rounded-lg border transition-all duration-150 disabled:opacity-40"
                        style={{
                          backgroundColor: '#18181f',
                          borderColor: '#2a2a35',
                          color: '#a1a1aa',
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
