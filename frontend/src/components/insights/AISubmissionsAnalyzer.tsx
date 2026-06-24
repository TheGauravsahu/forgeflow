import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AISubmissionsAnalyzerProps {
  aiAnalysis: string | null;
  isGeneratingAnalysis: boolean;
  handleGenerateAnalysis: () => void;
  aiAnalysisError: string | null;
  renderMarkdown: (text: string) => React.ReactNode;
}

export function AISubmissionsAnalyzer({
  aiAnalysis,
  isGeneratingAnalysis,
  handleGenerateAnalysis,
  aiAnalysisError,
  renderMarkdown
}: AISubmissionsAnalyzerProps) {
  return (
    <Card className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-none p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white">AI Submission Analyst Report</CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">Gemini-powered natural language summary, sentiment analysis, trends, and action recommendations.</p>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-zinc-800/60 my-2" />
      <CardContent className="p-0 pt-4">
        {!aiAnalysis ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
            {isGeneratingAnalysis ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-sm font-medium text-zinc-400">Gemini is analyzing submissions, compiling insights, and generating recommendations...</span>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
                  <Sparkles className="w-10 h-10 text-zinc-500" />
                </div>
                <div>
                  <p className="font-bold text-zinc-300">Ready to Analyze Responses</p>
                  <p className="text-xs text-zinc-500 mt-1">Get instant feedback summaries, customer sentiments, key findings, and action items.</p>
                </div>
                <Button
                  onClick={handleGenerateAnalysis}
                  className="mt-2 flex items-center gap-2 font-bold text-sm rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10 border-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Summary
                </Button>
              </>
            )}
            {aiAnalysisError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl max-w-md">
                {aiAnalysisError}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 prose prose-invert max-w-none bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl font-sans animate-fade-in">
            {renderMarkdown(aiAnalysis)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
