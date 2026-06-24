import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { FormField } from '../types/shared';
import { AnalyticsDashboard } from '../components/insights/AnalyticsDashboard';
import { SubmissionsTable } from '../components/insights/SubmissionsTable';
import { AISubmissionsAnalyzer } from '../components/insights/AISubmissionsAnalyzer';
import {
  ArrowLeft,
  Download,
  Layers,
  FileText,
  TrendingUp,
  BarChart2,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

/* ─────────────────────────── helpers ─────────────────────────── */



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
  const [inspectSubmission, setInspectSubmission] = useState<any | null>(null);

  // AI Analyst State
  const [activeTab, setActiveTab] = useState<'analytics' | 'submissions' | 'ai'>('analytics');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const toast = useToastStore();

  const analyzeSubmissionsMutation = api.ai.analyzeSubmissions.useMutation();

  const handleGenerateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAiAnalysisError(null);
    try {
      const result = await analyzeSubmissionsMutation.mutateAsync({
        formId
      });
      setAiAnalysis(result.analysis);
      toast.success('AI analysis generated successfully!', 'Report Compiled');
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Analysis failed. Please verify that GEMINI_API_KEY is configured in backend environment .env file.';
      toast.error(msg, 'AI Report Failed');
      setAiAnalysisError(msg);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-amber-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-extrabold text-white mt-5 mb-3">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-black text-white mt-6 mb-4">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="text-xs text-zinc-300 ml-4 list-disc my-1">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      let content: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        content = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part);
      }
      return <p key={idx} className="text-xs text-zinc-300 leading-relaxed my-1">{content}</p>;
    });
  };

  // Queries
  const formQuery = api.form.get.useQuery({ id: formId }, { enabled: !!formId });
  const analyticsQuery = api.submission.getAnalytics.useQuery({ formId }, { enabled: !!formId });
  const listQuery = api.submission.list.useQuery(
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
    (import.meta.env.VITE_API_URL as string) ||
    'http://localhost:3001/api';
  const basePrefix = apiBase.replace('/trpc', '').replace('/api', '') + '/api';
  const exportUrl = `${basePrefix}/forms/${formId}/export-csv?token=${localStorage.getItem('forgeflow_token')}`;

  const fields = ((form?.schema as unknown) as FormField[]) || [];
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
    <div className="min-h-screen flex flex-col text-zinc-100 bg-[#09090b] font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Form Insights
              </h1>
              <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 transition-all">
                Analytics
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 truncate max-w-[220px] sm:max-w-md mt-0.5">
              {form?.title ?? 'Loading…'}
            </p>
          </div>
        </div>

        <a
          href={exportUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="flex items-center gap-2 font-bold text-sm rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all border-0 cursor-pointer">
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
            <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/65 shadow-none hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.05),transparent_60%)]" />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Total Submissions
                  </p>
                  <h3 className="text-4xl font-black mt-1.5 text-white">
                    {totalSubmissions}
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1">responses collected</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500">
                  <FileText className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>

            {/* Avg per Day */}
            <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/65 shadow-none hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.05),transparent_60%)]" />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Avg per Day
                  </p>
                  <h3 className="text-4xl font-black mt-1.5 text-white">
                    {avgPerDay}
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1">daily average</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/65 shadow-none hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.05),transparent_60%)]" />
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Completion Rate
                  </p>
                  <h3 className="text-4xl font-black mt-1.5 text-white">
                    {completionRate}
                  </h3>
                  <p className="text-[11px] text-zinc-600 mt-1">of submissions complete</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500">
                  <Zap className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800/60 mb-6 mt-4 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${
              activeTab === 'analytics'
                ? 'border-amber-500 text-amber-450 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Dashboard &amp; Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${
              activeTab === 'submissions'
                ? 'border-amber-500 text-amber-450 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Responses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none ${
              activeTab === 'ai'
                ? 'border-amber-500 text-amber-450 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Analyst Report ✨
          </button>
        </div>

        <div className="space-y-8">
          {activeTab === 'analytics' && (
            <AnalyticsDashboard analytics={analytics} />
          )}

          {activeTab === 'submissions' && (
            <SubmissionsTable
              submissionData={submissionData}
              isLoading={listQuery.isLoading}
              activeFields={activeFields}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              setInspectSubmission={setInspectSubmission}
            />
          )}

          {activeTab === 'ai' && (
            <AISubmissionsAnalyzer
              aiAnalysis={aiAnalysis}
              isGeneratingAnalysis={isGeneratingAnalysis}
              handleGenerateAnalysis={handleGenerateAnalysis}
              aiAnalysisError={aiAnalysisError}
              renderMarkdown={renderMarkdown}
            />
          )}
        </div>
      </main>

      {/* ─── INSPECT SUBMISSION DIALOG ────────────────────────────────────── */}
      <Dialog open={!!inspectSubmission} onOpenChange={(open) => !open && setInspectSubmission(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg shadow-2xl shadow-black/60 rounded-2xl">
          <DialogHeader className="pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Submission Detail</DialogTitle>
            </div>
          </DialogHeader>

          {inspectSubmission && (
            <ScrollArea className="max-h-[380px] pr-2 py-4">
              <div className="space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40 text-xs">
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-wider font-semibold text-[10px]">Submission ID</span>
                    <span className="text-zinc-300 font-mono select-all">{inspectSubmission.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase tracking-wider font-semibold text-[10px]">Submitted At</span>
                    <span className="text-zinc-300">
                      {new Date(inspectSubmission.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {inspectSubmission.ip && (
                    <div className="col-span-2">
                      <span className="text-zinc-500 block uppercase tracking-wider font-semibold text-[10px]">IP Address</span>
                      <span className="text-zinc-300 font-mono">{inspectSubmission.ip}</span>
                    </div>
                  )}
                </div>

                {/* Answers list */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Responses</h4>
                  <div className="divide-y divide-zinc-800/40 border-t border-b border-zinc-800/60">
                    {activeFields.map((field) => {
                      const answer = inspectSubmission.data?.[field.id];
                      let displayVal = '—';
                      if (answer !== undefined && answer !== null) {
                        if (typeof answer === 'boolean') {
                          displayVal = answer ? 'Yes' : 'No';
                        } else if (Array.isArray(answer)) {
                          displayVal = answer.join(', ');
                        } else if (typeof answer === 'object') {
                          displayVal = JSON.stringify(answer);
                        } else {
                          displayVal = String(answer);
                        }
                      }

                      return (
                        <div key={field.id} className="py-3 flex flex-col gap-1">
                          <span className="text-xs font-bold text-zinc-400">
                            {field.properties.label || field.id}
                          </span>
                          <div className="text-sm text-zinc-200 break-words font-medium">
                            {typeof answer === 'string' && answer.startsWith('data:image/') ? (
                              <div className="mt-1">
                                <img
                                  src={answer}
                                  alt="attachment"
                                  className="max-h-32 rounded-lg border border-zinc-800 bg-zinc-950 p-1"
                                />
                                <a
                                  href={answer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block text-xs font-bold text-amber-500 hover:text-amber-400 mt-1.5"
                                >
                                  View Full Attachment
                                </a>
                              </div>
                            ) : (
                              displayVal
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="pt-2 border-t border-zinc-800">
            <Button
              type="button"
              onClick={() => setInspectSubmission(null)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold rounded-xl transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
