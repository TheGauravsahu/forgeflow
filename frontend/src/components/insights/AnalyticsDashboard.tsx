import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, BarChart2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsDashboardProps {
  analytics: any;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <>
      {/* ── 1. Timeline Card ── */}
      <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-none p-4">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                Submission Timeline
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#f4f4f5',
                      fontSize: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.85)',
                    }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 600 }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 700 }}
                    cursor={{ stroke: 'rgba(245,158,11,0.15)', strokeWidth: 1 }}
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
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
                  <Calendar className="w-8 h-8 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-400">No timeline data yet</p>
                <p className="text-xs text-zinc-500">Submissions will appear here once collected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Field Breakdown Section ── */}
      {analytics?.fieldAnalytics && Object.keys(analytics.fieldAnalytics).length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Question Breakdown
            </h2>
            <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {Object.keys(analytics.fieldAnalytics).length} fields
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(analytics.fieldAnalytics).map(([fieldId, data]: [string, any]) => {
              const isNumeric = ['rating', 'slider', 'number'].includes(data.type);
              return (
                <Card
                  key={fieldId}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-none flex flex-col justify-between p-4"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-sm font-bold text-slate-200 leading-snug">
                        {data.label || fieldId}
                      </CardTitle>
                      <Badge className="text-[9px] font-black px-2 py-0.5 rounded-full border-0 bg-amber-500/10 text-amber-500">
                        {data.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {data.responsesCount} response{data.responsesCount !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-4 bg-zinc-800/60" />
                    {isNumeric ? (
                      <div className="rounded-xl p-4 flex items-center justify-between bg-zinc-950/40 border border-zinc-800/60">
                        <div>
                          <p className="text-xs text-zinc-500 font-medium">Average Score</p>
                          <p className="text-4xl font-black mt-1 text-amber-500">
                            {data.average}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Metric</p>
                          <p className="text-xs font-bold text-zinc-400 uppercase mt-1">
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
                                  <span className="text-zinc-300 truncate max-w-[180px]">
                                    {key}
                                  </span>
                                  <span className="text-zinc-500 flex-shrink-0 ml-2">
                                    {count} ({pct}%)
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-800">
                                  <div
                                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          },
                        )}
                        {Object.keys(data.distribution || {}).length === 0 && (
                          <p className="text-xs text-zinc-500 italic">No distribution data</p>
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
        <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-none p-4">
          <CardContent className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <BarChart2 className="w-10 h-10 text-zinc-500" />
            </div>
            <div>
              <p className="font-bold text-zinc-300">No field analytics yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Analytics will populate once responses are submitted
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
