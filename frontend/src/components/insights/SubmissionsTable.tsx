import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Loader2, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormField } from '../../types/shared';

interface SubmissionsTableProps {
  submissionData: any;
  isLoading: boolean;
  activeFields: FormField[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  setInspectSubmission: (sub: any) => void;
}

export function SubmissionsTable({
  submissionData,
  isLoading,
  activeFields,
  currentPage,
  setCurrentPage,
  totalPages,
  setInspectSubmission
}: SubmissionsTableProps) {
  return (
    <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-none overflow-hidden p-4">
      {/* Card Header */}
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">
                All Submissions
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Individual form replies submitted by respondents
              </p>
            </div>
          </div>
          {submissionData && (
            <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {submissionData.totalCount} entries
            </Badge>
          )}
        </div>
      </CardHeader>

      <Separator className="mt-4 bg-zinc-800/60" />

      {/* Table body */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-sm font-medium">Loading responses…</span>
          </div>
        ) : !submissionData || submissionData.submissions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <FileText className="w-10 h-10 text-zinc-500" />
            </div>
            <div>
              <p className="font-bold text-zinc-300">No submissions yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Share your form link to start collecting responses
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-widest bg-zinc-950/60 border-b border-zinc-800 text-zinc-500">
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
                {submissionData.submissions.map((sub: any) => {
                  const data = sub.data as Record<string, any>;
                  return (
                    <tr
                      key={sub.id}
                      className="text-sm border-b border-zinc-800/40 hover:bg-amber-500/[0.02] transition-colors duration-150 animate-fade-in"
                    >
                      <td className="py-4 px-5 text-zinc-400 whitespace-nowrap font-medium">
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
                            className="py-4 px-5 text-zinc-400 max-w-[180px] truncate"
                          >
                            {typeof val === 'string' &&
                            val.startsWith('data:image/') ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-150"
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
                          onClick={() => setInspectSubmission(sub)}
                          className="text-xs font-bold transition-colors duration-150 cursor-pointer text-amber-500 hover:text-amber-400 border-0 bg-transparent"
                        >
                          Inspect
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
          <Separator className="bg-zinc-800/60" />
          <div className="px-6 py-4 flex items-center justify-between bg-zinc-950/20">
            <span className="text-xs text-zinc-500 font-medium">
              Page{' '}
              <span className="text-zinc-300 font-bold">{currentPage + 1}</span>{' '}
              of{' '}
              <span className="text-zinc-300 font-bold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="w-8 h-8 rounded-lg border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 transition-all duration-150 bg-zinc-900 text-zinc-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 transition-all duration-150 bg-zinc-900 text-zinc-400 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
